from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.feedback import schemas as feedback_schemas
from app.feedback import models as feedback_models


def create_feedback(feedback_data: feedback_schemas.FeedbackCreate, db: Session):
    try:
        new_feedback = feedback_models.Feedback(**feedback_data.model_dump())
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return new_feedback
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"Database error" )
    except SQLAlchemyError as e:
       db.rollback()
       raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def get_all_feedback(db: Session):
    try:
        return db.query(feedback_models.Feedback).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"Database error: {str(e)}")