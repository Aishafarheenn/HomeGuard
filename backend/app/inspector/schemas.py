from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class InspectorBase(BaseModel):
    full_name: str
    email: str
    phone: str
    status: str

class InspectorCreate(InspectorBase):
    password: str  # Hashed server-side

class InspectorResponse(InspectorBase):
    id: UUID
    approved_by: Optional[UUID] = None
    created_at: datetime
    class Config:
        from_attributes = True

class InspectorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    approved_by: Optional[UUID] = None
    class Config:
        from_attributes = True