from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from uuid import UUID
from typing import Optional, Any

# InspectionPackage Schemas
class InspectionPackageBase(BaseModel):
    name: str
    description: str
    price: int

class InspectionPackageCreate(InspectionPackageBase):
    pass

class InspectionPackageResponse(InspectionPackageBase):
    id: UUID
    class Config:
        from_attributes = True

# InspectionSchedule Schemas
class InspectionScheduleBase(BaseModel):
    owner_id: UUID
    property_id: UUID
    package_id: UUID
    scheduled_date: date
    frequency: str
    status: str

class InspectionScheduleCreate(InspectionScheduleBase):
    pass

class InspectionScheduleResponse(InspectionScheduleBase):
    id: UUID
    created_at: datetime
    class Config:
        from_attributes = True


class OwnerJobItem(BaseModel):
    """One job (schedule) for owner with optional assignment and inspection status."""
    schedule_id: UUID
    package_id: UUID
    scheduled_date: date
    property_address: str
    package_name: str
    package_price: Optional[int] = None
    schedule_status: str
    created_at: datetime
    job_ticket_id: Optional[UUID] = None
    job_ticket_status: Optional[str] = None
    inspector_name: Optional[str] = None
    inspection_status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_submitted_at: Optional[datetime] = None
    payment_verified_at: Optional[datetime] = None
    assigned_at: Optional[datetime] = None
    inspection_completed_at: Optional[datetime] = None
    inspection_id: Optional[UUID] = None
    inspector_id: Optional[UUID] = None
    has_owner_review: bool = False

# JobTickets Schemas
class JobTicketBase(BaseModel):
    schedule_id: UUID
    inspector_id: Optional[UUID] = None
    status: str

class JobTicketCreate(JobTicketBase):
    pass

class JobTicketResponse(JobTicketBase):
    id: UUID
    assigned_at: datetime
    class Config:
        from_attributes = True


# Nested schemas for job ticket list/detail (schedule with property, owner; inspector)
class PropertySummary(BaseModel):
    id: UUID
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    class Config:
        from_attributes = True


class OwnerSummary(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    country: Optional[str] = None
    class Config:
        from_attributes = True


class InspectorSummary(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    class Config:
        from_attributes = True


class PackageSummary(BaseModel):
    id: UUID
    name: str
    description: str
    price: int
    class Config:
        from_attributes = True


class ScheduleWithRelations(BaseModel):
    id: UUID
    owner_id: UUID
    property_id: UUID
    package_id: UUID
    scheduled_date: date
    frequency: str
    status: str
    created_at: datetime
    property: Optional[PropertySummary] = None
    owner: Optional[OwnerSummary] = None
    package: Optional[PackageSummary] = None
    class Config:
        from_attributes = True


class JobTicketResponseWithRelations(JobTicketBase):
    id: UUID
    assigned_at: Optional[datetime] = None
    schedule: Optional[ScheduleWithRelations] = None
    inspector: Optional[InspectorSummary] = None
    inspections: Optional[list["InspectionWithGeoResponse"]] = None
    class Config:
        from_attributes = True


# Geo verification (declared before inspection detail response used on job tickets)
class GeoVerificationBase(BaseModel):
    inspection_id: UUID
    latitude: float
    longitude: float
    distance_from_property: float
    verified: bool


class GeoVerificationCreate(GeoVerificationBase):
    pass


class GeoVerificationResponse(GeoVerificationBase):
    id: UUID
    verified_at: datetime
    class Config:
        from_attributes = True


# Inspection Schemas
class InspectionBase(BaseModel):
    job_ticket_id: UUID
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    overall_status: str

class InspectionCreate(InspectionBase):
    """Optional latitude/longitude required when inspector starts inspection (geo-verification)."""
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class InspectionResponse(InspectionBase):
    id: UUID
    class Config:
        from_attributes = True


class InspectionWithGeoResponse(InspectionBase):
    """Inspection as returned on job ticket detail (includes geo verification when loaded)."""

    id: UUID
    geo_verifications: Optional[list[GeoVerificationResponse]] = Field(
        default=None,
        validation_alias="geo_verification_logs",
    )
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class InspectionUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    overall_status: Optional[str] = None
    class Config:
        from_attributes = True

# Checklist Schemas
class ChecklistBase(BaseModel):
    package_id: UUID
    area_name: str

class ChecklistCreate(ChecklistBase):
    pass

class ChecklistResponse(ChecklistBase):
    id: UUID
    class Config:
        from_attributes = True


class ChecklistUpdate(BaseModel):
    """Admin: rename checklist area (template item)."""
    area_name: Optional[str] = None

# InspectionChecklistResults Schemas
class InspectionChecklistResultBase(BaseModel):
    inspection_id: UUID
    checklist_item_id: UUID
    status: str
    remark: str

class InspectionChecklistResultCreate(InspectionChecklistResultBase):
    pass


class InspectionChecklistResultUpdate(BaseModel):
    status: Optional[str] = None
    remark: Optional[str] = None


class InspectionChecklistResultResponse(InspectionChecklistResultBase):
    id: UUID
    class Config:
        from_attributes = True


class ChecklistItemSummary(BaseModel):
    id: UUID
    area_name: str
    class Config:
        from_attributes = True


class OwnerJobReportChecklistItem(BaseModel):
    area_name: str
    status: str
    remark: str


class OwnerJobReportEvidenceItem(BaseModel):
    id: UUID
    media_type: str
    media_url: str
    area_name: Optional[str] = None

    class Config:
        from_attributes = True


class OwnerJobReportRedFlagItem(BaseModel):
    id: UUID
    category: str
    severity: str
    description: str

    class Config:
        from_attributes = True


class OwnerJobReportResponse(BaseModel):
    """Inspection report view for owner: inspection summary + checklist + report notes + evidence + red flags."""
    inspection_id: UUID
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    overall_status: str
    checklist_results: list[OwnerJobReportChecklistItem] = []
    report_notes: Optional[str] = None
    report_url: Optional[str] = None
    evidence: list[OwnerJobReportEvidenceItem] = []
    red_flags: list[OwnerJobReportRedFlagItem] = []


class InspectionChecklistResultWithItemResponse(InspectionChecklistResultResponse):
    checklist_item: Optional[ChecklistItemSummary] = None
    class Config:
        from_attributes = True
