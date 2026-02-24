from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ComplaintCreate(BaseModel):
    name: str
    email: str
    message: str


class ComplaintResponse(ComplaintCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
