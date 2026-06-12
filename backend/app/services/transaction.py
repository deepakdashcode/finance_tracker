from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Profile
from app.models.transaction import Transaction, TransactionType
from app.repositories.transaction import TransactionRepository
from app.schemas.transaction import (
    TransactionCreate,
    TransactionFilter,
    TransactionResponse,
    TransactionUpdate,
)


class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TransactionRepository(db)

    async def _get_user_profile_ids(self, user_id: int) -> list[int]:
        result = await self.db.execute(
            select(Profile.id).where(Profile.user_id == user_id)
        )
        return [row[0] for row in result.all()]

    async def _get_profile(self, profile_id: int, user_id: int) -> Profile | None:
        result = await self.db.execute(
            select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    def _apply_balance_change(self, profile: Profile, old_type: TransactionType | None, old_amount: float | None, new_type: TransactionType, new_amount: float) -> None:
        d_new = Decimal(str(new_amount))
        if old_type is not None and old_amount is not None:
            d_old = Decimal(str(old_amount))
            if old_type == TransactionType.CREDIT:
                profile.current_balance -= d_old
            else:
                profile.current_balance += d_old

        if new_type == TransactionType.CREDIT:
            profile.current_balance += d_new
        else:
            profile.current_balance -= d_new

    async def get_transactions(self, user_id: int, filters: TransactionFilter) -> tuple[list[TransactionResponse], int]:
        profile_ids = await self._get_user_profile_ids(user_id)
        transactions, total = await self.repo.get_filtered(
            profile_ids,
            category_id=filters.category_id,
            type=filters.type,
            date_from=filters.date_from,
            date_to=filters.date_to,
            search=filters.search,
            page=filters.page,
            page_size=filters.page_size,
        )
        return [TransactionResponse.model_validate(t) for t in transactions], total

    async def create_transaction(self, user_id: int, data: TransactionCreate) -> TransactionResponse:
        profile = await self._get_profile(data.profile_id, user_id)
        if not profile:
            raise ValueError("Profile not found")

        transaction_date = data.transaction_date
        if transaction_date is None:
            transaction_date = datetime.now(timezone.utc).date()

        self._apply_balance_change(profile, None, None, data.type, data.amount)

        transaction = await self.repo.create(
            profile_id=data.profile_id,
            category_id=data.category_id,
            type=data.type,
            amount=data.amount,
            title=data.title,
            notes=data.notes,
            transaction_date=transaction_date,
        )
        await self.db.commit()
        return TransactionResponse.model_validate(transaction)

    async def update_transaction(self, user_id: int, transaction_id: int, data: TransactionUpdate) -> TransactionResponse | None:
        transaction = await self.repo.get_by_id(transaction_id)
        if not transaction:
            return None

        profile = await self._get_profile(transaction.profile_id, user_id)
        if not profile:
            return None

        new_type = data.type if data.type is not None else transaction.type
        new_amount = data.amount if data.amount is not None else float(transaction.amount)

        self._apply_balance_change(profile, transaction.type, float(transaction.amount), new_type, new_amount)

        transaction = await self.repo.update(
            transaction,
            category_id=data.category_id,
            type=data.type,
            amount=data.amount,
            title=data.title,
            notes=data.notes,
            transaction_date=data.transaction_date,
        )
        await self.db.commit()
        return TransactionResponse.model_validate(transaction)

    async def delete_transaction(self, user_id: int, transaction_id: int) -> bool:
        transaction = await self.repo.get_by_id(transaction_id)
        if not transaction:
            return False

        profile = await self._get_profile(transaction.profile_id, user_id)
        if not profile:
            return False

        if transaction.type == TransactionType.CREDIT:
            profile.current_balance -= transaction.amount
        else:
            profile.current_balance += transaction.amount

        await self.repo.delete(transaction)
        await self.db.commit()
        return True
