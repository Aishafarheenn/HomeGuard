from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PropertyCreate(BaseModel):
    user_id: UUID
    address: str
    lattitude: float
    longitude: float

class PropertyResponse(BaseModel):
    id: UUID
    user_id: UUID
    address: str
    lattitude: float
    longitude: float
    created_at: datetime

    class config:
        from_attributes =True