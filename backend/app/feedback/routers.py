from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import Query

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
    """Owners only: general app feedback. Admins and inspectors cannot."""
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


@router.get("/public", response_model=list[feedback_schemas.FeedbackPublicResponse])
def get_public_feedback(
    limit: int = Query(default=6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Public: latest owner-submitted general feedback (no email)."""
    try:
        return feedback_services.get_public_feedback(db, limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "/inspection-reviews",
    response_model=feedback_schemas.InspectionReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inspection_review(
    data: feedback_schemas.InspectionReviewCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Owner: rate inspector and comment after inspection is completed."""
    try:
        return feedback_services.create_inspection_review(data, current_user, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/inspection-reviews",
    response_model=list[feedback_schemas.InspectionReviewResponse],
)
def list_inspection_reviews(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin: all reviews. Owner: reviews they submitted. Inspector: reviews about them."""
    try:
        if current_user.role == "admin":
            return feedback_services.list_inspection_reviews_admin(db)
        if current_user.role == "owner":
            return feedback_services.list_inspection_reviews_owner(current_user.user_id, db)
        if current_user.role == "inspector":
            return feedback_services.list_inspection_reviews_inspector(current_user.user_id, db)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


