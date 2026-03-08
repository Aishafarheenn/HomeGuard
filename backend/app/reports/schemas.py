from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

# Evidence Schemas
class EvidenceBase(BaseModel):
    inspection_id: UUID
    checklist_item_id: UUID
    media_type: str
    media_url: str

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: UUID
    uploaded_at: datetime
    class Config:
        from_attributes = True

class EvidenceUpdate(BaseModel):
    inspection_id: Optional[UUID] = None
    checklist_item_id: Optional[UUID] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    class Config:
        from_attributes = True

# RedFlag Schemas
class RedFlagBase(BaseModel):
    inspection_id: UUID
    category: str
    severity: str
    description: str

class RedFlagCreate(RedFlagBase):
    pass

class RedFlagResponse(RedFlagBase):
    id: UUID
    class Config:
        from_attributes = True

class RedFlagUpdate(BaseModel):
    category: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    class Config:
        from_attributes = True

# InspectionReport Schemas
class InspectionReportBase(BaseModel):
    inspection_id: UUID
    report_url: Optional[str] = None
    report_notes: Optional[str] = None


class InspectionReportCreate(InspectionReportBase):
    pass


class InspectionReportResponse(InspectionReportBase):
    id: UUID
    generated_at: datetime
    class Config:
        from_attributes = True


class InspectionReportUpdate(BaseModel):
    report_url: Optional[str] = None
    report_notes: Optional[str] = None
    class Config:
        from_attributes = True
    

    