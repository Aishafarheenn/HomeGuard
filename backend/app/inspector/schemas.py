from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class InspectorBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None


class InspectorCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    password: str  # Hashed server-side; status set to "pending" by backend for public registration

class InspectorResponse(InspectorBase):
    id: UUID
    status: str  # "pending" | "approved" | "rejected"
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