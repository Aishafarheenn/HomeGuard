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


class InspectorJobSummary(BaseModel):
    """Aggregates job tickets assigned to this inspector."""

    total_jobs: int
    by_status: dict[str, int]
    completed_inspections: int


class InspectorRatingSummary(BaseModel):
    average_rating: Optional[float] = None
    review_count: int


class InspectorProfileReviewItem(BaseModel):
    """Owner inspection review (rating) without internal IDs."""

    property_address: Optional[str] = None
    owner_name: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime


class InspectorProfileResponse(BaseModel):
    inspector: InspectorResponse
    job_summary: InspectorJobSummary
    rating_summary: InspectorRatingSummary
    reviews: list[InspectorProfileReviewItem]