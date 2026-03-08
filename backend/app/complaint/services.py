from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.complaint import schemas as complaint_schemas
from app.complaint import models as complaint_models


def _resolve_user_name_email(user_id: UUID, role: str, db: Session) -> tuple[str, str]:
    """Resolve logged-in user's full_name and email from role and user_id."""
    if role == "owner":
        from app.users import models as user_models
        row = db.query(user_models.Owner).filter(user_models.Owner.id == user_id).first()
    elif role == "inspector":
        from app.inspector import models as inspector_models
        row = db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == user_id).first()
    elif role == "admin":
        from app.admin import models as admin_models
        row = db.query(admin_models.Admin).filter(admin_models.Admin.id == user_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown role",
        )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    name = getattr(row, "full_name", None) or str(user_id)
    email = getattr(row, "email", None) or ""
    return (name, email)


def create_complaints(
    complaint_data: complaint_schemas.ComplaintCreate,
    current_user,
    db: Session,
):
    try:
        name, email = _resolve_user_name_email(current_user.user_id, current_user.role, db)
        new_complaint = complaint_models.Complaint(
            name=name,
            email=email,
            message=complaint_data.message,
        )
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        return new_complaint
    except HTTPException:
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error",
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

def get_all_complaints(db: Session):
    try:
        return db.query(complaint_models.Complaint).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
