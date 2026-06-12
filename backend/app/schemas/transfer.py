from datetime import datetime

from pydantic import BaseModel, Field


class TransferCreate(BaseModel):
    source_profile_id: int
    destination_profile_id: int
    amount: float = Field(..., gt=0)


class TransferResponse(BaseModel):
    id: int
    source_profile_id: int
    destination_profile_id: int
    amount: float
    created_at: datetime

    model_config = {"from_attributes": True}
