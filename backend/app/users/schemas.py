from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class OwnerBase(BaseModel):
    full_name: str
    email: str
    phone: str
    country: str

class OwnerCreate(OwnerBase):
    pass

class OwnerResponse(OwnerBase):
    id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class OwnerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    class Config:
        from_attributes = True