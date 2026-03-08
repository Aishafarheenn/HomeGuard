from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.properties import models as property_models
from app.properties import schemas as property_schemas


def get_all_properties(db: Session):
    try:
        return (
            db.query(property_models.Property)
            .options(selectinload(property_models.Property.owner))
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def get_properties_for_owner(owner_id: UUID, db: Session):
    """Return properties belonging to a specific owner."""
    try:
        return (
            db.query(property_models.Property)
            .options(selectinload(property_models.Property.owner))
            .filter(property_models.Property.owner_id == owner_id)
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def get_property_by_id(property_id: UUID, db: Session):
    try:
        property_obj = (
            db.query(property_models.Property)
            .options(selectinload(property_models.Property.owner))
            .filter(property_models.Property.id == property_id)
            .first()
        )
        if not property_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
            )
        return property_obj
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def create_property(property_data: property_schemas.PropertyCreate, db: Session):
    try:
        new_property = property_models.Property(**property_data.model_dump())
        db.add(new_property)
        db.commit()
        db.refresh(new_property)
        return new_property
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid foreign key or duplicate data",
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def update_property(
    property_id: UUID, update_data: dict, db: Session
):
    try:
        property_obj = (
            db.query(property_models.Property)
            .filter(property_models.Property.id == property_id)
            .first()
        )
        if not property_obj:
            return None
        for field, value in update_data.items():
            if hasattr(property_obj, field):
                setattr(property_obj, field, value)
        db.commit()
        db.refresh(property_obj)
        return property_obj
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid foreign key or duplicate data",
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def delete_property(property_id: UUID, db: Session):
    try:
        property_obj = (
            db.query(property_models.Property)
            .filter(property_models.Property.id == property_id)
            .first()
        )
        if not property_obj:
            return None
        db.delete(property_obj)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )