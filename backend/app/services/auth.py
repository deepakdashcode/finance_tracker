from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.security import create_access_token
from app.repositories.user import UserRepository
from app.schemas.auth import AuthResponse, UserResponse


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def google_login(self, token: str) -> tuple[AuthResponse, UserResponse]:
        try:
            id_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            raise ValueError("Invalid Google token")

        google_id = id_info["sub"]
        email = id_info["email"]
        name = id_info.get("name", "")
        avatar_url = id_info.get("picture")

        user = await self.user_repo.get_by_google_id(google_id)
        if not user:
            user = await self.user_repo.create(google_id, email, name, avatar_url)

        access_token = create_access_token(user.id)
        auth_resp = AuthResponse(access_token=access_token)
        user_resp = UserResponse.model_validate(user)
        return auth_resp, user_resp

    @staticmethod
    def get_user_response(user) -> UserResponse:
        return UserResponse.model_validate(user)
