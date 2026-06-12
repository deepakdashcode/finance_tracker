from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.services.profile import ProfileService
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("")
async def list_profiles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(ProfileRepository(db))
    profiles = await service.get_profiles(current_user.id)
    return success_response([p.model_dump() for p in profiles])


@router.get("/{profile_id}")
async def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(ProfileRepository(db))
    profile = await service.get_profile(current_user.id, profile_id)
    if not profile:
        return error_response("Profile not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(profile.model_dump())


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_profile(
    body: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(ProfileRepository(db))
    profile = await service.create_profile(current_user.id, body)
    return success_response(profile.model_dump(), status_code=status.HTTP_201_CREATED)


@router.put("/{profile_id}")
async def update_profile(
    profile_id: int,
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(ProfileRepository(db))
    profile = await service.update_profile(current_user.id, profile_id, body)
    if not profile:
        return error_response("Profile not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(profile.model_dump())


@router.delete("/{profile_id}")
async def delete_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(ProfileRepository(db))
    deleted = await service.delete_profile(current_user.id, profile_id)
    if not deleted:
        return error_response("Profile not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response({"message": "Profile deleted successfully"})
