from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class EvidenceCreate(BaseModel):
    inspection_id: UUID 
    checklist_item_id:UUID
    media_type: str
    media_url: str

class EvidenceResponse(BaseModel):
    id: UUID
    inspection_id: UUID
    checklist_item_id:UUID
    media_type: str
    media_url: str
    notes: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class EvidenceUpdate(BaseModel):
    inspection_id:UUID
    checklist_item_id:UUID
    media_type:str
    media_url:str
    

    