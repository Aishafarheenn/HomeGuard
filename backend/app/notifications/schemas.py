from pydantic import BaseModel
from uuid import UUID
from datetime import datetime



class NotificationCreate(BaseModel):
    user_id=UUID
    message=str
    status=str

class NotificationResponse(BaseModel):
    id:UUID
    user_id:UUID
    message:str
    sent_at:datetime
    status:str

class NotificationUpdate(BaseModel):
    user_id:UUID
    message:str
    status:str

    class Config:
        from_attributes=True



    