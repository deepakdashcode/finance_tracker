from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


class CategoryService:
    def __init__(self, repo: CategoryRepository):
        self.repo = repo

    async def get_categories(self, user_id: int) -> list[CategoryResponse]:
        categories = await self.repo.get_by_user_id(user_id)
        return [CategoryResponse.model_validate(c) for c in categories]

    async def get_category(self, user_id: int, category_id: int) -> CategoryResponse | None:
        category = await self.repo.get_by_user_and_id(user_id, category_id)
        if not category:
            return None
        return CategoryResponse.model_validate(category)

    async def create_category(self, user_id: int, data: CategoryCreate) -> CategoryResponse:
        category = await self.repo.create(user_id, **data.model_dump(exclude_none=True))
        return CategoryResponse.model_validate(category)

    async def update_category(self, user_id: int, category_id: int, data: CategoryUpdate) -> CategoryResponse | None:
        category = await self.repo.get_by_user_and_id(user_id, category_id)
        if not category:
            return None
        category = await self.repo.update(category, **data.model_dump(exclude_none=True))
        return CategoryResponse.model_validate(category)

    async def delete_category(self, user_id: int, category_id: int) -> bool:
        category = await self.repo.get_by_user_and_id(user_id, category_id)
        if not category:
            return False
        await self.repo.delete(category)
        return True
