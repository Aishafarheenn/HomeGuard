from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app.properties import services as property_services
from app.properties import schemas as property_schemas

from middleware.db import get_db

router = APIRouter(prifix="/property",tags=["Property"])

@router.post("/create",response_model=property_schemas.PropertyResponse)
def add_property(payload:property_schemas.PropertyCreate, db:Session=Depends(get_db)):
    try:    
        return property_services.create_proprty(db,payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/get",response_model = list[property_schemas.PropertyResponse] )
def get_property(db:Session=Depends(get_db)):
    try:
        return  property_services.get_all_property(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    