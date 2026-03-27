from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional

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


class FeedbackPublicResponse(BaseModel):
    """Public-safe feedback for marketing pages (no email)."""
    id: UUID
    name: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class InspectionReviewCreate(BaseModel):
    """Owner: rate inspector after inspection is completed."""
    inspection_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1)


class InspectionReviewResponse(BaseModel):
    id: UUID
    inspection_id: UUID
    owner_id: UUID
    inspector_id: UUID
    rating: int
    comment: str
    created_at: datetime
    owner_name: Optional[str] = None
    inspector_name: Optional[str] = None
    property_address: Optional[str] = None

    class Config:
        from_attributes = True