from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AdminCreate(BaseModel):
    full_name: str
    email: str
    password: str  # Plain password; hashed server-side. Min length enforced in router if needed.
    phone: str

class AdminResponse(BaseModel):
    id:UUID
    full_name:str
    email:str
    phone:str
    created_at:datetime

class AdminUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None

    class Config:
        from_attributes = True