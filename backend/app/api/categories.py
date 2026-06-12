from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.category import CategoryService
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(CategoryRepository(db))
    categories = await service.get_categories(current_user.id)
    return success_response([c.model_dump() for c in categories])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(CategoryRepository(db))
    category = await service.create_category(current_user.id, body)
    return success_response(category.model_dump(), status_code=status.HTTP_201_CREATED)


@router.put("/{category_id}")
async def update_category(
    category_id: int,
    body: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(CategoryRepository(db))
    category = await service.update_category(current_user.id, category_id, body)
    if not category:
        return error_response("Category not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(category.model_dump())


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(CategoryRepository(db))
    deleted = await service.delete_category(current_user.id, category_id)
    if not deleted:
        return error_response("Category not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response({"message": "Category deleted successfully"})
