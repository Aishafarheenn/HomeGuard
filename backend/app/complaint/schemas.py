from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class ComplaintCreate(BaseModel):
    """Request body: only message. Name and email come from logged-in user."""
    message: str


class ComplaintResponse(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    email: str
    message: str
    admin_response: Optional[str] = None
    responded_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintResponseUpdate(BaseModel):
    admin_response: str
