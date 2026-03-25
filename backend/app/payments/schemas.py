from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from uuid import UUID


class PaymentCreate(BaseModel):
    schedule_id: UUID
    amount: int
    currency: str = "INR"
    method: str
    reference_no: Optional[str] = None
    notes: Optional[str] = None
    proof_url: Optional[str] = None


class PaymentVerifyUpdate(BaseModel):
    notes: Optional[str] = None


class PaymentRejectUpdate(BaseModel):
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: UUID
    schedule_id: UUID

    owner_id: UUID
    owner_name: Optional[str] = None

    property_address: Optional[str] = None
    package_name: Optional[str] = None
    scheduled_date: Optional[date] = None

    amount: int
    currency: str
    method: str
    reference_no: Optional[str] = None
    proof_url: Optional[str] = None

    status: str
    submitted_at: datetime
    verified_at: Optional[datetime] = None
    verified_by_name: Optional[str] = None

    notes: Optional[str] = None

    # Derived from job ticket assignment for this schedule.
    assigned_inspector_name: Optional[str] = None

