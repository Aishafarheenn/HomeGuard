from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    full_name:str
    email:str
    phone:str
    country:str

class UserResponse(BaseModel):
    id:UUID
    full_name:str
    email:str
    phone:str
    country:str
    created_at:datetime

class UserUpdate(BaseModel):
    name:str
    email:str
    phone:str
    country:str

class Config:
    from_attributes=True