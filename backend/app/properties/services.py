from fastapi import FastAPI,HTTPException
from sqlalchemy.orm import Session
from app.properties import models as property_models
from app.properties import schemas as property_schemas


def create_proprty(db:Session,data:property_schemas.PropertyCreate):
    try:

        new_property = property_models.Property(
        user_id = data.user_id,
        address = data.address,
            lattitude = data.lattitude,
            longitude = data.longitude,

        )
        db.add(new_property)
        db.commit()
        db.refresh(new_property)

        return new_property
    except Exception as e:
        raise HTTPException(status_code=400,detail=str(e))

def get_all_property(db:Session):
    try:
        return db.query(property_models.Property).all()
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))