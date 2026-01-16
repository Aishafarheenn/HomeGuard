from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.properties import services as property_services
from app.properties import schemas as property_schemas
from middleware.db import get_db
from uuid import UUID

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("", response_model=list[property_schemas.PropertyResponse])
def get_all_properties(db: Session = Depends(get_db)):
    try:
        return property_services.get_all_properties(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{property_id}", response_model=property_schemas.PropertyResponse)
def get_property(property_id: UUID, db: Session = Depends(get_db)):
    try:
        return property_services.get_property_by_id(property_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("", response_model=property_schemas.PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(property_data: property_schemas.PropertyCreate, db: Session = Depends(get_db)):
    try:
        return property_services.create_property(property_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{property_id}", response_model=property_schemas.PropertyResponse)
def update_property(property_id: UUID, property_data: property_schemas.PropertyUpdate, db: Session = Depends(get_db)):
    try:
        property = property_services.update_property(property_id, property_data, db)
        if not property:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        return property
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{property_id}")
def delete_property(property_id: UUID, db: Session = Depends(get_db)):
    try:
        result = property_services.delete_property(property_id, db)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        return {"message": "Property deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    
    