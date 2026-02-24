from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.complaint import schemas as complaint_schemas
from app.complaint import models as complaint_models



def create_complaint(complaint_data: complaint_schemas.ComplaintCreate, db: Session):
   
    try:
        new_complaint = complaint_models.Complaint(**complaint_data.model_dump())
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        return new_complaint
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"Database error" )
    except SQLAlchemyError as e:
       db.rollback()
       raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_all_complaints(db: Session):
    try:
        return db.query(complaint_models.Complaint).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
