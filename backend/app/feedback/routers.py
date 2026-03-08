from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.feedback import schemas as feedback_schemas
from app.feedback import services as feedback_services
from auth.dependencies import CurrentUser, get_current_admin, get_current_user
from middleware.db import get_db

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "/feedback",
    response_model=feedback_schemas.FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_feedback(
    feedback_data: feedback_schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Any authenticated user can submit feedback. Name and email are taken from the logged-in user."""
    try:
        return feedback_services.create_feedback(feedback_data, current_user, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/feedback", response_model=list[feedback_schemas.FeedbackResponse])
def get_all_feedback(
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: list all feedback (model is not user-scoped)."""
    try:
        return feedback_services.get_all_feedback(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
