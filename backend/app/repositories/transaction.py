from datetime import date

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction, TransactionType


class TransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, transaction_id: int) -> Transaction | None:
        result = await self.db.execute(select(Transaction).where(Transaction.id == transaction_id))
        return result.scalar_one_or_none()

    async def get_filtered(
        self,
        profile_ids: list[int],
        *,
        category_id: int | None = None,
        type: TransactionType | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Transaction], int]:
        query = select(Transaction).where(Transaction.profile_id.in_(profile_ids))

        if category_id is not None:
            query = query.where(Transaction.category_id == category_id)
        if type is not None:
            query = query.where(Transaction.type == type)
        if date_from is not None:
            query = query.where(Transaction.transaction_date >= date_from)
        if date_to is not None:
            query = query.where(Transaction.transaction_date <= date_to)
        if search:
            query = query.where(
                or_(
                    Transaction.title.ilike(f"%{search}%"),
                    Transaction.notes.ilike(f"%{search}%"),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        transactions = list(result.scalars().all())

        return transactions, total

    async def create(self, **kwargs) -> Transaction:
        transaction = Transaction(**kwargs)
        self.db.add(transaction)
        await self.db.flush()
        await self.db.refresh(transaction)
        return transaction

    async def update(self, transaction: Transaction, **kwargs) -> Transaction:
        for key, value in kwargs.items():
            if value is not None:
                setattr(transaction, key, value)
        await self.db.flush()
        await self.db.refresh(transaction)
        return transaction

    async def delete(self, transaction: Transaction) -> None:
        await self.db.delete(transaction)
        await self.db.flush()
