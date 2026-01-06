from pydantic import BaseModel
from uuid import UUID

class InspectorCreate(BaseModel):
    name:str
    email:str
    password_hash:str
    phone:str

class InspectorResponse(BaseModel):
    id=UUID
    name:str
    email:str
    password_hash:str
    phone:str
    status:bool
    created_at:str

class InspectorUpdate(BaseModel):
    name:str
    email:str
    phone:str
    status:bool