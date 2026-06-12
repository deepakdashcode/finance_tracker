from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.transaction import TransactionType
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionFilter, TransactionUpdate
from app.services.transaction import TransactionService
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    profile_id: int | None = Query(None),
    category_id: int | None = Query(None),
    type: TransactionType | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    filters = TransactionFilter(
        profile_id=profile_id,
        category_id=category_id,
        type=type,
        date_from=date_from,
        date_to=date_to,
        search=search,
        page=page,
        page_size=page_size,
    )
    transactions, total = await service.get_transactions(current_user.id, filters)
    return success_response({
        "items": [t.model_dump() for t in transactions],
        "total": total,
        "page": page,
        "page_size": page_size,
    })


@router.get("/{transaction_id}")
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    filters = TransactionFilter(page=1, page_size=1)
    transactions, _ = await service.get_transactions(current_user.id, filters)

    txn = None
    for t in transactions:
        if t.id == transaction_id:
            txn = t
            break

    if not txn:
        return error_response("Transaction not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(txn.model_dump())


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    body: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    try:
        transaction = await service.create_transaction(current_user.id, body)
        return success_response(transaction.model_dump(), status_code=status.HTTP_201_CREATED)
    except ValueError as e:
        return error_response(str(e), status_code=status.HTTP_400_BAD_REQUEST)


@router.put("/{transaction_id}")
async def update_transaction(
    transaction_id: int,
    body: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    transaction = await service.update_transaction(current_user.id, transaction_id, body)
    if not transaction:
        return error_response("Transaction not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(transaction.model_dump())


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    deleted = await service.delete_transaction(current_user.id, transaction_id)
    if not deleted:
        return error_response("Transaction not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response({"message": "Transaction deleted successfully"})
