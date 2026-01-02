from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class InspectionResponse(BaseModel):
    id:UUID
    schedule_id:UUID
    inspector_id:UUID
    start_time:datetime
    end_time:datetime
    geo_verified:bool

class InspectionUpdate(BaseModel):
    schedule_id:UUID
    inspector_id:UUID
    start_time:datetime
    end_time:datetime
    geo_verified:bool
    
    class Config:
        from_attributes=True
     