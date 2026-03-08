from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.complaint import schemas as complaint_schemas
from app.complaint import services as complaint_services
from auth.dependencies import CurrentUser, get_current_admin, get_current_user
from middleware.db import get_db


router = APIRouter(prefix="/complaints", tags=["complaint"])


@router.post(
    "/complaints",
    response_model=complaint_schemas.ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_complaints(
    complaint_data: complaint_schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Any authenticated user can submit a complaint. Name and email are taken from the logged-in user."""
    try:
        return complaint_services.create_complaints(complaint_data, current_user, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/complaints", response_model=list[complaint_schemas.ComplaintResponse])
def get_all_complaints(
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: list all complaints (model is not user-scoped)."""
    try:
        return complaint_services.get_all_complaints(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
