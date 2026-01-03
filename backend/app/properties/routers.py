from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app.properties import services as property_services
from app.properties import schemas as property_schemas

from middleware.db import get_db

router = APIRouter(prefix="/property",tags=["Property"])

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
    
@router.put("/{property_id}", response_model=property_schemas.propertyUpdate)
def update_property(
    property_id:str, 
    property_data:property_schemas.propertyUpdate, 
    db:Session = Depends(get_db)):

    property=property_services.update_property_services(
        property_id=property_id,
        property_data=property_data,
        db=db
    )
    if not property:
        raise HTTPException(status_code=404,detail="property not found")
    return property

@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    db:Session = Depends(get_db)
):
    result = property_services.delete_property_services(
        property_id=property_id,
        db=db
    )
    if not result:
        raise HTTPException(status_code=404, detail="property not found")
        return {"message":"property deleted successfully"}

    
    