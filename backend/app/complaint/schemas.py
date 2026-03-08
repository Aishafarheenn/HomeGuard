from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ComplaintCreate(BaseModel):
    """Request body: only message. Name and email come from logged-in user."""
    message: str


class ComplaintResponse(BaseModel):
    id: UUID
    name: str
    email: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
