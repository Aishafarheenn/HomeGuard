from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.feedback import schemas as feedback_schemas
from app.feedback import models as feedback_models
from app.inspection import models as inspection_models


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


def create_feedback(
    feedback_data: feedback_schemas.FeedbackCreate,
    current_user,
    db: Session,
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only property owners can submit general feedback",
        )
    try:
        name, email = _resolve_user_name_email(current_user.user_id, current_user.role, db)
        new_feedback = feedback_models.Feedback(
            name=name,
            email=email,
            rating=feedback_data.rating,
            comment=feedback_data.comment,
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return new_feedback
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


def get_all_feedback(db: Session):
    try:
        return db.query(feedback_models.Feedback).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"Database error: {str(e)}")


def get_public_feedback(db: Session, limit: int = 6):
    """Public latest feedback list for landing page."""
    safe_limit = max(1, min(limit, 20))
    try:
        return (
            db.query(feedback_models.Feedback)
            .order_by(feedback_models.Feedback.created_at.desc())
            .limit(safe_limit)
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def _inspection_review_to_response(
    row: feedback_models.InspectionReview, db: Session
) -> feedback_schemas.InspectionReviewResponse:
    from app.users import models as user_models
    from app.inspector import models as inspector_models
    from app.properties import models as prop_models

    owner_name = None
    inspector_name = None
    property_address = None
    owner = db.query(user_models.Owner).filter(user_models.Owner.id == row.owner_id).first()
    if owner:
        owner_name = owner.full_name
    insp = db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == row.inspector_id).first()
    if insp:
        inspector_name = insp.full_name
    inspection = (
        db.query(inspection_models.Inspection)
        .filter(inspection_models.Inspection.id == row.inspection_id)
        .first()
    )
    if inspection and inspection.job_ticket_id:
        jt = (
            db.query(inspection_models.JobTickets)
            .filter(inspection_models.JobTickets.id == inspection.job_ticket_id)
            .first()
        )
        if jt and jt.schedule_id:
            sched = (
                db.query(inspection_models.InspectionSchedule)
                .filter(inspection_models.InspectionSchedule.id == jt.schedule_id)
                .first()
            )
            if sched:
                p = db.query(prop_models.Property).filter(prop_models.Property.id == sched.property_id).first()
                if p:
                    property_address = p.address

    return feedback_schemas.InspectionReviewResponse(
        id=row.id,
        inspection_id=row.inspection_id,
        owner_id=row.owner_id,
        inspector_id=row.inspector_id,
        rating=row.rating,
        comment=row.comment,
        created_at=row.created_at,
        owner_name=owner_name,
        inspector_name=inspector_name,
        property_address=property_address,
    )


def create_inspection_review(
    data: feedback_schemas.InspectionReviewCreate,
    current_user,
    db: Session,
):
    if current_user.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only property owners can submit inspection reviews")

    existing = (
        db.query(feedback_models.InspectionReview)
        .filter(feedback_models.InspectionReview.inspection_id == data.inspection_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already submitted a review for this inspection")

    inspection = (
        db.query(inspection_models.Inspection)
        .filter(inspection_models.Inspection.id == data.inspection_id)
        .first()
    )
    if not inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
    if (inspection.overall_status or "").lower() != "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inspection must be completed before you can review")

    jt = (
        db.query(inspection_models.JobTickets)
        .filter(inspection_models.JobTickets.id == inspection.job_ticket_id)
        .first()
    )
    if not jt or not jt.schedule_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job for this inspection")

    sched = (
        db.query(inspection_models.InspectionSchedule)
        .filter(inspection_models.InspectionSchedule.id == jt.schedule_id)
        .first()
    )
    if not sched or sched.owner_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your inspection")
    if not jt.inspector_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No inspector assigned for this job")

    try:
        rev = feedback_models.InspectionReview(
            inspection_id=data.inspection_id,
            owner_id=current_user.user_id,
            inspector_id=jt.inspector_id,
            rating=data.rating,
            comment=data.comment.strip(),
        )
        db.add(rev)
        db.commit()
        db.refresh(rev)
        return _inspection_review_to_response(rev, db)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Review already exists")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def list_inspection_reviews_admin(db: Session):
    try:
        rows = db.query(feedback_models.InspectionReview).order_by(feedback_models.InspectionReview.created_at.desc()).all()
        return [_inspection_review_to_response(r, db) for r in rows]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def list_inspection_reviews_owner(owner_id: UUID, db: Session):
    try:
        rows = (
            db.query(feedback_models.InspectionReview)
            .filter(feedback_models.InspectionReview.owner_id == owner_id)
            .order_by(feedback_models.InspectionReview.created_at.desc())
            .all()
        )
        return [_inspection_review_to_response(r, db) for r in rows]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def list_inspection_reviews_inspector(inspector_id: UUID, db: Session):
    """Reviews where this inspector was rated by the property owner."""
    try:
        rows = (
            db.query(feedback_models.InspectionReview)
            .filter(feedback_models.InspectionReview.inspector_id == inspector_id)
            .order_by(feedback_models.InspectionReview.created_at.desc())
            .all()
        )
        return [_inspection_review_to_response(r, db) for r in rows]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
