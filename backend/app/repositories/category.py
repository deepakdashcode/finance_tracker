from sqlalchemy import select

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository):
    async def get_by_user_id(self, user_id: int) -> list[Category]:
        result = await self.db.execute(
            select(Category).where(Category.user_id == user_id).order_by(Category.name)
        )
        return list(result.scalars().all())

    async def get_by_user_and_id(self, user_id: int, category_id: int) -> Category | None:
        result = await self.db.execute(
            select(Category).where(Category.id == category_id, Category.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: int, **kwargs) -> Category:
        category = Category(user_id=user_id, **kwargs)
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category, **kwargs) -> Category:
        for key, value in kwargs.items():
            if value is not None:
                setattr(category, key, value)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category: Category) -> None:
        await self.db.delete(category)
        await self.db.commit()
