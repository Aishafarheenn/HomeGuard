from uuid import UUID

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
    """Owner only: submit complaint. Name and email are taken from the logged-in user."""
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
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin: list all complaints. Owner: list own complaints."""
    try:
        if current_user.role == "admin":
            return complaint_services.get_all_complaints(db)
        if current_user.role == "owner":
            return complaint_services.get_owner_complaints(current_user.user_id, db)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners/admins can access complaints",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.patch(
    "/complaints/{complaint_id}/response",
    response_model=complaint_schemas.ComplaintResponse,
)
def respond_complaint(
    complaint_id: UUID,
    data: complaint_schemas.ComplaintResponseUpdate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: send/update response for a complaint."""
    try:
        return complaint_services.respond_complaint(
            complaint_id, data, current_admin.user_id, db
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
