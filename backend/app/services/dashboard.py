from datetime import datetime, timedelta, timezone

from sqlalchemy import Date, Float, cast, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.profile import Profile
from app.models.transaction import Transaction, TransactionType
from app.schemas.dashboard import DashboardResponse


class DashboardService:
    def __init__(self, db: AsyncSession, user_id: int):
        self.db = db
        self.user_id = user_id

    async def get_dashboard(self) -> DashboardResponse:
        profile_ids = await self._get_profile_ids()

        total_balance = await self._get_total_balance()
        monthly_income = await self._get_monthly_sum(profile_ids, TransactionType.CREDIT)
        monthly_expense = await self._get_monthly_sum(profile_ids, TransactionType.DEBIT)
        expense_trend = await self._get_trend(profile_ids, TransactionType.DEBIT)
        income_trend = await self._get_trend(profile_ids, TransactionType.CREDIT)
        category_breakdown = await self._get_category_breakdown(profile_ids)
        top_categories = await self._get_top_categories(profile_ids)
        recent_txns = await self._get_recent_transactions(profile_ids)

        return DashboardResponse(
            totalBalance=total_balance,
            monthlyIncome=monthly_income,
            monthlyExpense=monthly_expense,
            expenseTrend=expense_trend,
            incomeTrend=income_trend,
            categoryBreakdown=category_breakdown,
            topCategories=top_categories,
            recentTransactions=recent_txns,
        )

    async def _get_profile_ids(self) -> list[int]:
        result = await self.db.execute(
            select(Profile.id).where(Profile.user_id == self.user_id)
        )
        return [row[0] for row in result.all()]

    async def _get_total_balance(self) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Profile.current_balance), 0)).where(
                Profile.user_id == self.user_id
            )
        )
        return float(result.scalar_one())

    async def _get_monthly_sum(self, profile_ids: list[int], type: TransactionType) -> float:
        if not profile_ids:
            return 0
        now = datetime.now(timezone.utc)
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.profile_id.in_(profile_ids),
                Transaction.type == type,
                Transaction.transaction_date >= first_of_month,
            )
        )
        return float(result.scalar_one())

    async def _get_trend(self, profile_ids: list[int], type: TransactionType) -> list[dict]:
        if not profile_ids:
            return []
        days30 = datetime.now(timezone.utc) - timedelta(days=30)
        result = await self.db.execute(
            select(
                cast(Transaction.transaction_date, Date).label("date"),
                cast(func.sum(Transaction.amount), Float).label("amount"),
            )
            .where(
                Transaction.profile_id.in_(profile_ids),
                Transaction.type == type,
                Transaction.transaction_date >= days30,
            )
            .group_by(text("date"))
            .order_by(text("date"))
        )
        return [{"date": str(row.date), "amount": round(float(row.amount), 2)} for row in result.all()]

    async def _get_category_breakdown(self, profile_ids: list[int]) -> list[dict]:
        if not profile_ids:
            return []
        now = datetime.now(timezone.utc)
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(
                Category.name,
                Category.color,
                cast(func.sum(Transaction.amount), Float).label("amount"),
            )
            .join(Category, Transaction.category_id == Category.id, isouter=True)
            .where(
                Transaction.profile_id.in_(profile_ids),
                Transaction.type == TransactionType.DEBIT,
                Transaction.transaction_date >= first_of_month,
            )
            .group_by(Category.name, Category.color)
            .order_by(text("amount DESC"))
        )
        return [
            {"category": row.name or "Uncategorized", "color": row.color or "#94a3b8", "amount": round(float(row.amount), 2)}
            for row in result.all()
        ]

    async def _get_top_categories(self, profile_ids: list[int]) -> list[dict]:
        if not profile_ids:
            return []
        now = datetime.now(timezone.utc)
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(
                Category.name,
                Category.color,
                cast(func.sum(Transaction.amount), Float).label("amount"),
            )
            .join(Category, Transaction.category_id == Category.id, isouter=True)
            .where(
                Transaction.profile_id.in_(profile_ids),
                Transaction.type == TransactionType.DEBIT,
                Transaction.transaction_date >= first_of_month,
            )
            .group_by(Category.name, Category.color)
            .order_by(text("amount DESC"))
            .limit(5)
        )
        return [
            {"category": row.name or "Uncategorized", "color": row.color or "#94a3b8", "amount": round(float(row.amount), 2)}
            for row in result.all()
        ]

    async def _get_recent_transactions(self, profile_ids: list[int]) -> list[dict]:
        if not profile_ids:
            return []
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.profile_id.in_(profile_ids))
            .order_by(Transaction.transaction_date.desc())
            .limit(10)
        )
        txns = result.scalars().all()
        return [
            {
                "id": t.id,
                "profile_id": t.profile_id,
                "category_id": t.category_id,
                "type": t.type.value,
                "amount": float(t.amount),
                "title": t.title,
                "notes": t.notes,
                "transaction_date": t.transaction_date.isoformat(),
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
            }
            for t in txns
        ]
