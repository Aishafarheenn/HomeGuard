from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AdminCreate(BaseModel):
    name:str
    email:str
    password_hash:str
    phone:str

class AdminResponse(BaseModel):
    id:UUID
    name:str
    email:str
    phone:str
    created_at:datetime

class AdminUpdate(BaseModel):
    id:UUID
    name:str
    email:str
    phone:str
    

    class Config:
        from_attributes=True