from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    name:str
    email:str
    password_hash:str
    phone:str
    country:str

class UserResponse(BaseModel):
    id:UUID
    name:str
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