from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.profile import Profile
from app.models.transaction import Transaction, TransactionType
from app.models.transfer import Transfer
from app.models.user import User
from app.schemas.transfer import TransferCreate
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/transfers", tags=["transfers"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_transfer(
    body: TransferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.source_profile_id == body.destination_profile_id:
        return error_response("Source and destination must be different")

    result = await db.execute(
        select(Profile).where(
            Profile.id.in_([body.source_profile_id, body.destination_profile_id]),
            Profile.user_id == current_user.id,
        )
    )
    profiles = result.scalars().all()

    if len(profiles) != 2:
        return error_response("One or both profiles not found", status_code=status.HTTP_404_NOT_FOUND)

    profile_map = {p.id: p for p in profiles}
    source = profile_map[body.source_profile_id]
    dest = profile_map[body.destination_profile_id]

    if float(source.current_balance) < body.amount:
        return error_response("Insufficient balance in source profile")

    amount_dec = Decimal(str(body.amount))
    source.current_balance -= amount_dec
    dest.current_balance += amount_dec

    source_txn = Transaction(
        profile_id=body.source_profile_id,
        type=TransactionType.DEBIT,
        amount=body.amount,
        title=f"Transfer to {dest.name}",
        transaction_date=datetime.now(timezone.utc),
    )
    dest_txn = Transaction(
        profile_id=body.destination_profile_id,
        type=TransactionType.CREDIT,
        amount=body.amount,
        title=f"Transfer from {source.name}",
        transaction_date=datetime.now(timezone.utc),
    )

    transfer = Transfer(
        source_profile_id=body.source_profile_id,
        destination_profile_id=body.destination_profile_id,
        amount=body.amount,
    )

    db.add_all([source_txn, dest_txn, transfer])
    await db.commit()

    return success_response({"message": "Transfer completed successfully"}, status_code=status.HTTP_201_CREATED)


@router.get("")
async def list_transfers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Profile.id).where(Profile.user_id == current_user.id)
    )
    profile_ids = [row[0] for row in result.all()]

    result = await db.execute(
        select(Transfer).where(
            or_(
                Transfer.source_profile_id.in_(profile_ids),
                Transfer.destination_profile_id.in_(profile_ids),
            )
        ).order_by(Transfer.created_at.desc()).limit(50)
    )
    transfers = result.scalars().all()

    return success_response([
        {
            "id": t.id,
            "source_profile_id": t.source_profile_id,
            "destination_profile_id": t.destination_profile_id,
            "amount": float(t.amount),
            "created_at": t.created_at.isoformat(),
        }
        for t in transfers
    ])
