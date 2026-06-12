from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import DevLoginRequest, GoogleLoginRequest, UserResponse
from app.services.auth import AuthService
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google")
async def google_login(body: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    service = AuthService(user_repo)
    try:
        auth_resp, user_resp = await service.google_login(body.token)
        return success_response({
            "access_token": auth_resp.access_token,
            "token_type": auth_resp.token_type,
            "user": user_resp.model_dump(),
        })
    except ValueError as e:
        return error_response(str(e), status_code=status.HTTP_401_UNAUTHORIZED)


@router.post("/dev-login")
async def dev_login(body: DevLoginRequest, db: AsyncSession = Depends(get_db)):
    if not settings.DEV_MODE:
        return error_response("Dev login is disabled", status_code=status.HTTP_403_FORBIDDEN)

    repo = UserRepository(db)
    user = await repo.get_by_email(body.email)
    if not user:
        user = await repo.create(
            google_id=f"dev_{body.email}",
            email=body.email,
            name=body.name,
            avatar_url=None,
        )

    token = create_access_token(user.id)
    user_resp = UserResponse.model_validate(user)
    return success_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user_resp.model_dump(),
    })


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return success_response(AuthService.get_user_response(current_user).model_dump())


@router.post("/logout")
async def logout():
    return success_response({"message": "Logged out successfully"})
