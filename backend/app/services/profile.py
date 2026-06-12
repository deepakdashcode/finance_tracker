from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate


class ProfileService:
    def __init__(self, repo: ProfileRepository):
        self.repo = repo

    async def get_profiles(self, user_id: int) -> list[ProfileResponse]:
        profiles = await self.repo.get_by_user_id(user_id)
        return [ProfileResponse.model_validate(p) for p in profiles]

    async def get_profile(self, user_id: int, profile_id: int) -> ProfileResponse | None:
        profile = await self.repo.get_by_user_and_id(user_id, profile_id)
        if not profile:
            return None
        return ProfileResponse.model_validate(profile)

    async def create_profile(self, user_id: int, data: ProfileCreate) -> ProfileResponse:
        profile = await self.repo.create(user_id, **data.model_dump(exclude_none=True))
        return ProfileResponse.model_validate(profile)

    async def update_profile(self, user_id: int, profile_id: int, data: ProfileUpdate) -> ProfileResponse | None:
        profile = await self.repo.get_by_user_and_id(user_id, profile_id)
        if not profile:
            return None
        profile = await self.repo.update(profile, **data.model_dump(exclude_none=True))
        return ProfileResponse.model_validate(profile)

    async def delete_profile(self, user_id: int, profile_id: int) -> bool:
        profile = await self.repo.get_by_user_and_id(user_id, profile_id)
        if not profile:
            return False
        await self.repo.delete(profile)
        return True
