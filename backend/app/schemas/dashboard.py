from datetime import datetime

from pydantic import BaseModel


class TrendPoint(BaseModel):
    date: str
    amount: float


class CategoryBreakdown(BaseModel):
    category: str
    color: str
    amount: float


class TransactionItem(BaseModel):
    id: int
    profile_id: int
    category_id: int | None
    type: str
    amount: float
    title: str
    notes: str | None
    transaction_date: str
    created_at: str
    updated_at: str


class DashboardResponse(BaseModel):
    totalBalance: float
    monthlyIncome: float
    monthlyExpense: float
    expenseTrend: list[TrendPoint]
    incomeTrend: list[TrendPoint]
    categoryBreakdown: list[CategoryBreakdown]
    topCategories: list[CategoryBreakdown]
    recentTransactions: list[TransactionItem]
