from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    profile_id: int
    category_id: int | None = None
    type: TransactionType
    amount: float = Field(..., gt=0)
    title: str = Field(..., min_length=1, max_length=255)
    notes: str | None = None
    transaction_date: date | None = None


class TransactionUpdate(BaseModel):
    category_id: int | None = None
    type: TransactionType | None = None
    amount: float | None = Field(None, gt=0)
    title: str | None = Field(None, min_length=1, max_length=255)
    notes: str | None = None
    transaction_date: date | None = None


class TransactionResponse(BaseModel):
    id: int
    profile_id: int
    category_id: int | None
    type: TransactionType
    amount: float
    title: str
    notes: str | None
    transaction_date: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TransactionFilter(BaseModel):
    profile_id: int | None = None
    category_id: int | None = None
    type: TransactionType | None = None
    date_from: date | None = None
    date_to: date | None = None
    search: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
