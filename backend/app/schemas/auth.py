from pydantic import BaseModel


class GoogleLoginRequest(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DevLoginRequest(BaseModel):
    email: str
    name: str = "Dev User"


class UserResponse(BaseModel):
    id: int
    google_id: str
    email: str
    name: str
    avatar_url: str | None

    model_config = {"from_attributes": True}
