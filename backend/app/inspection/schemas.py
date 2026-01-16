from pydantic import BaseModel
from datetime import datetime, date
from uuid import UUID
from typing import Optional

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

# JobTickets Schemas
class JobTicketBase(BaseModel):
    schedule_id: UUID
    inspector_id: UUID
    status: str

class JobTicketCreate(JobTicketBase):
    pass

class JobTicketResponse(JobTicketBase):
    id: UUID
    assigned_at: datetime
    class Config:
        from_attributes = True

# Inspection Schemas
class InspectionBase(BaseModel):
    job_ticket_id: UUID
    start_time: datetime
    end_time: datetime
    overall_status: str

class InspectionCreate(InspectionBase):
    pass

class InspectionResponse(InspectionBase):
    id: UUID
    class Config:
        from_attributes = True

class InspectionUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    overall_status: Optional[str] = None
    class Config:
        from_attributes = True

# GeoVerification Schemas
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

# InspectionChecklistResults Schemas
class InspectionChecklistResultBase(BaseModel):
    inspection_id: UUID
    checklist_item_id: UUID
    status: str
    remark: str

class InspectionChecklistResultCreate(InspectionChecklistResultBase):
    pass

class InspectionChecklistResultResponse(InspectionChecklistResultBase):
    id: UUID
    class Config:
        from_attributes = True
     