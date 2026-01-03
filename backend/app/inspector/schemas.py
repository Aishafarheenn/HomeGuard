from pydantic import BaseModel
from uuid import UUID

class InspectorCreate(BaseModel):
    name:str
    email:str
    password_hash:str
    phone:str
    status:str

class InspectorResponse(BaseModel):
    id=UUID
    name:str
    email:str
    password_hash:str
    phone:str
    status:str
    created_at:str

class InspectorUpdate(BaseModel):
    id:UUID
    name:str
    email:str
    phone:str
    status:str