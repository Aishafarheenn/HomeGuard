from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.properties import models as property_models
from app.properties import schemas as property_schemas
from uuid import UUID

def get_all_properties(db: Session):
    try:
        return db.query(property_models.Property).options(selectinload(property_models.Property.owner)).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_property_by_id(property_id: UUID, db: Session):
    try:
        property = db.query(property_models.Property).options(selectinload(property_models.Property.owner)).filter(property_models.Property.id == property_id).first()
        if not property:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        return property
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_property(property_data: property_schemas.PropertyCreate, db: Session):
    try:
        new_property = property_models.Property(**property_data.model_dump())
        db.add(new_property)
        db.commit()
        db.refresh(new_property)
        return new_property
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_property(property_id: UUID, property_data: property_schemas.PropertyUpdate, db: Session):
    try:
        property = db.query(property_models.Property).filter(property_models.Property.id == property_id).first()
        if not property:
            return None
        for field, value in property_data.model_dump(exclude_unset=True).items():
            setattr(property, field, value)
        db.commit()
        db.refresh(property)
        return property
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_property(property_id: UUID, db: Session):
    try:
        property = db.query(property_models.Property).filter(property_models.Property.id == property_id).first()
        if not property:
            return None
        db.delete(property)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")