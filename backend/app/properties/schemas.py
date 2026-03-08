from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

# Minimal owner schema for nested serialization (avoids circular import and ORM serialization error)
class OwnerSummary(BaseModel):
    id: UUID
    full_name: str
    email: str
    class Config:
        from_attributes = True


class PropertyBase(BaseModel):
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PropertyCreate(PropertyBase):
    owner_id: UUID


class PropertyResponse(PropertyBase):
    id: UUID
    owner_id: Optional[UUID] = None
    created_at: datetime
    owner: Optional[OwnerSummary] = None
    class Config:
        from_attributes = True

class PropertyUpdate(BaseModel):
    owner_id: Optional[UUID] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    class Config:
        from_attributes = True