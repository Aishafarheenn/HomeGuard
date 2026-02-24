from pydantic import BaseModel
from datetime import datetime, date
from uuid import UUID
from typing import Optional

class FeedbackCreate(BaseModel):
    name: str
    email: str
    rating: int
    comment: str


class FeedbackResponse(FeedbackCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True