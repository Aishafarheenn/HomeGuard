from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class PropertyBase(BaseModel):
    address: str
    latitude: float
    longitude: float

class PropertyCreate(PropertyBase):
    pass

class PropertyResponse(PropertyBase):
    id: UUID
    owner_id: Optional[UUID] = None
    created_at: datetime
    class Config:
        from_attributes = True

class PropertyUpdate(BaseModel):
    owner_id: Optional[UUID] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    class Config:
        from_attributes = True