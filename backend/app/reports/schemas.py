from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class EvidenceCreate(BaseModel):
    inspection_id: UUID 
    media_type: str
    media_url: str
    notes: str

class EvidenceResponse(BaseModel):
    id: UUID
    inspection_id: UUID
    media_type: str
    media_url: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


class EvidenceUpdate(BaseModel):
    inspection_id:UUID
    media_type:str
    media_url:str
    notes:str

    