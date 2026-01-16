from pydantic import BaseModel
from uuid import UUID

class InspectorCreate(BaseModel):
    full_name:str
    email:str
    phone:str
    status:str

class InspectorResponse(BaseModel):
    id=UUID
    full_name:str
    email:str
    phone:str
    status:str
    approved_by:UUID
    created_at:str

class InspectorUpdate(BaseModel):
    name:str
    email:str
    phone:str
    status:str