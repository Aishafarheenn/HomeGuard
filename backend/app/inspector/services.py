from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.inspector import models as inspector_models
from app.inspector import schemas as inspector_schemas
from core.security import hash_password
from uuid import UUID

def get_all_inspectors(db: Session):
    try:
        return db.query(inspector_models.Inspector).options(
            selectinload(inspector_models.Inspector.admin)
        ).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_inspector_by_id(inspector_id: UUID, db: Session):
    try:
        inspector = db.query(inspector_models.Inspector).options(
            selectinload(inspector_models.Inspector.admin)
        ).filter(inspector_models.Inspector.id == inspector_id).first()
        if not inspector:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found")
        return inspector
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_inspector(inspector_data: inspector_schemas.InspectorCreate, db: Session):
    try:
        data = inspector_data.model_dump(exclude={"password"})
        data["password_hash"] = hash_password(inspector_data.password)
        new_inspector = inspector_models.Inspector(**data)
        db.add(new_inspector)
        db.commit()
        db.refresh(new_inspector)
        return new_inspector
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists or invalid data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_inspector(inspector_id: UUID, inspector_data: inspector_schemas.InspectorUpdate, db: Session):
    try:
        inspector = db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == inspector_id).first()
        if not inspector:
            return None
        for field, value in inspector_data.model_dump(exclude_unset=True).items():
            setattr(inspector, field, value)
        db.commit()
        db.refresh(inspector)
        return inspector
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists or invalid data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_inspector(inspector_id: UUID, db: Session):
    try:
        inspector = db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == inspector_id).first()
        if not inspector:
            return None
        db.delete(inspector)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")