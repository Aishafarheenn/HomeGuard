from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PropertyCreate(BaseModel):
    owner_id: UUID
    address: str
    lattitude: float
    longitude: float

class PropertyResponse(BaseModel):
    id: UUID
    owner_id: UUID
    address: str
    lattitude: float
    longitude: float
    created_at: datetime

class PropertyUpdate(BaseModel):
    owner_id:UUID
    address:str
    lattitude:float
    longitude:float

    
    class config:
        from_attributes =True