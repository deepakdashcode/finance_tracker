from sqlalchemy import select, delete

from app.models.profile import Profile
from app.repositories.base import BaseRepository


class ProfileRepository(BaseRepository):
    async def get_by_user_id(self, user_id: int) -> list[Profile]:
        result = await self.db.execute(
            select(Profile).where(Profile.user_id == user_id).order_by(Profile.created_at)
        )
        return list(result.scalars().all())

    async def get_by_user_and_id(self, user_id: int, profile_id: int) -> Profile | None:
        result = await self.db.execute(
            select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: int, **kwargs) -> Profile:
        profile = Profile(user_id=user_id, **kwargs)
        profile.current_balance = profile.initial_balance
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def update(self, profile: Profile, **kwargs) -> Profile:
        for key, value in kwargs.items():
            if value is not None:
                setattr(profile, key, value)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def delete(self, profile: Profile) -> None:
        await self.db.delete(profile)
        await self.db.commit()
