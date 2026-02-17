from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    user_id: UUID
    user_type: str  # 'owner' or 'inspector'
    message: str

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_type: str
    message: str
    is_read: bool
    sent_at: datetime
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    class Config:
        from_attributes = True



    