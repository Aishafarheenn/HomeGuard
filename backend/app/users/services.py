from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.users import schemas as user_schemas
from app.users import models as user_models
from core.security import hash_password
from uuid import UUID

def get_all_owners(db: Session):
    try:
        return db.query(user_models.Owner).options(
            selectinload(user_models.Owner.properties),
            selectinload(user_models.Owner.inspection_schedules)
        ).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_owner_by_id(owner_id: UUID, db: Session):
    try:
        owner = db.query(user_models.Owner).options(
            selectinload(user_models.Owner.properties),
            selectinload(user_models.Owner.inspection_schedules)
        ).filter(user_models.Owner.id == owner_id).first()
        if not owner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")
        return owner
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_owner(owner_data: user_schemas.OwnerCreate, db: Session):
    try:
        data = owner_data.model_dump(exclude={"password"})
        data["password_hash"] = hash_password(owner_data.password)
        new_owner = user_models.Owner(**data)
        db.add(new_owner)
        db.commit()
        db.refresh(new_owner)
        return new_owner
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists or invalid data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_owner(owner_id: UUID, owner_data: user_schemas.OwnerUpdate, db: Session):
    try:
        owner = db.query(user_models.Owner).filter(user_models.Owner.id == owner_id).first()
        if not owner:
            return None
        for field, value in owner_data.model_dump(exclude_unset=True).items():
            setattr(owner, field, value)
        db.commit()
        db.refresh(owner)
        return owner
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists or invalid data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_owner(owner_id: UUID, db: Session):
    try:
        owner = db.query(user_models.Owner).filter(user_models.Owner.id == owner_id).first()
        if not owner:
            return None
        db.delete(owner)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

