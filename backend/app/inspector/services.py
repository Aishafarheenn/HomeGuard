from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.inspector import models as inspector_models
from app.inspector import schemas as inspector_schemas
from app.inspection import models as inspection_models
from app.feedback import models as feedback_models
from app.feedback.services import _inspection_review_to_response
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
        data["status"] = "pending"  # Public registration: admin must approve before login
        data["approved_by"] = None
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

def approve_inspector(inspector_id: UUID, admin_id: UUID, db: Session):
    """Set inspector status to approved and set approved_by. Only admins should call this."""
    inspector = db.query(inspector_models.Inspector).filter(
        inspector_models.Inspector.id == inspector_id
    ).first()
    if not inspector:
        return None
    inspector.status = "approved"
    inspector.approved_by = admin_id
    db.commit()
    db.refresh(inspector)
    return inspector


def reject_inspector(inspector_id: UUID, db: Session):
    """Set inspector status to rejected."""
    inspector = db.query(inspector_models.Inspector).filter(
        inspector_models.Inspector.id == inspector_id
    ).first()
    if not inspector:
        return None
    inspector.status = "rejected"
    inspector.approved_by = None
    db.commit()
    db.refresh(inspector)
    return inspector


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


def get_inspector_profile_for_admin(inspector_id: UUID, db: Session) -> inspector_schemas.InspectorProfileResponse:
    """Admin: inspector details, job ticket counts, and owner inspection ratings."""
    inspector = get_inspector_by_id(inspector_id, db)

    status_rows = (
        db.query(inspection_models.JobTickets.status, func.count())
        .filter(inspection_models.JobTickets.inspector_id == inspector_id)
        .group_by(inspection_models.JobTickets.status)
        .all()
    )
    by_status: dict[str, int] = {str(row[0]): int(row[1]) for row in status_rows}
    total_jobs = sum(by_status.values())

    completed_inspections = (
        db.query(func.count(inspection_models.Inspection.id))
        .join(
            inspection_models.JobTickets,
            inspection_models.Inspection.job_ticket_id == inspection_models.JobTickets.id,
        )
        .filter(
            inspection_models.JobTickets.inspector_id == inspector_id,
            func.lower(inspection_models.Inspection.overall_status) == "completed",
        )
        .scalar()
    )
    if completed_inspections is None:
        completed_inspections = 0

    avg_row = (
        db.query(func.avg(feedback_models.InspectionReview.rating))
        .filter(feedback_models.InspectionReview.inspector_id == inspector_id)
        .scalar()
    )
    review_count = (
        db.query(func.count(feedback_models.InspectionReview.id))
        .filter(feedback_models.InspectionReview.inspector_id == inspector_id)
        .scalar()
    ) or 0
    average_rating = None
    if avg_row is not None and review_count > 0:
        average_rating = round(float(avg_row), 2)

    review_rows = (
        db.query(feedback_models.InspectionReview)
        .filter(feedback_models.InspectionReview.inspector_id == inspector_id)
        .order_by(feedback_models.InspectionReview.created_at.desc())
        .limit(50)
        .all()
    )
    reviews: list[inspector_schemas.InspectorProfileReviewItem] = []
    for row in review_rows:
        full = _inspection_review_to_response(row, db)
        reviews.append(
            inspector_schemas.InspectorProfileReviewItem(
                property_address=full.property_address,
                owner_name=full.owner_name,
                rating=full.rating,
                comment=full.comment,
                created_at=full.created_at,
            )
        )

    return inspector_schemas.InspectorProfileResponse(
        inspector=inspector_schemas.InspectorResponse.model_validate(inspector),
        job_summary=inspector_schemas.InspectorJobSummary(
            total_jobs=total_jobs,
            by_status=by_status,
            completed_inspections=int(completed_inspections),
        ),
        rating_summary=inspector_schemas.InspectorRatingSummary(
            average_rating=average_rating,
            review_count=int(review_count),
        ),
        reviews=reviews,
    )