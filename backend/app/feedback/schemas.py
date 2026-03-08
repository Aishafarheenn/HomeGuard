from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class FeedbackCreate(BaseModel):
    """Request body: only rating and comment. Name and email come from logged-in user."""
    rating: int
    comment: str


class FeedbackResponse(BaseModel):
    """Response includes name and email (set from logged-in user on create)."""
    id: UUID
    name: str
    email: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True