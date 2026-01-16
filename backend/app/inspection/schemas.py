from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class InspectionResponse(BaseModel):
    id:UUID
    job_ticket_id:UUID
    start_time:datetime
    end_time:datetime
    overall_status:str

class InspectionUpdate(BaseModel):
    job_ticket_id:UUID
    start_time:datetime
    end_time:datetime
    over_all_status:str
    
    class Config:
        from_attributes=True
     