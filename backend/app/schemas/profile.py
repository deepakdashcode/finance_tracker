from datetime import datetime

from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    initial_balance: float = Field(default=0, ge=0)


class ProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    initial_balance: float | None = Field(None, ge=0)


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    initial_balance: float
    current_balance: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
