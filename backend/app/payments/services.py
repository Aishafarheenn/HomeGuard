import os
import uuid as uuid_lib
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.payments import schemas as payment_schemas
from app.payments import models as payment_models
from app.inspection import models as inspection_models
from app.admin import models as admin_models


PAYMENTS_UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads")) / "payments"


def _save_payment_proof_file(proof_file: UploadFile) -> str:
    if proof_file is None:
        return None

    ext = Path(proof_file.filename or "bin").suffix.lower()
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"}
    if ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid proof file type. Use image (JPG/PNG/WebP/GIF) or PDF.",
        )

    PAYMENTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid_lib.uuid4().hex}{ext}"
    file_path = PAYMENTS_UPLOAD_DIR / safe_name

    try:
        contents = proof_file.file.read()
        file_path.write_bytes(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save proof file: {str(e)}",
        )

    return f"/uploads/payments/{safe_name}"


def _payment_to_response(payment: payment_models.Payment) -> payment_schemas.PaymentResponse:
    schedule = payment.schedule
    owner = payment.owner
    admin = payment.verified_by_admin

    assigned_inspector_name = None
    # When admin assigns a job ticket, an inspection schedule will have at least one job ticket with inspector_id.
    # We use the most recently assigned job ticket.
    if schedule is not None:
        job_tickets = getattr(schedule, "job_tickets", None) or []
        assigned_jobs = [
            jt
            for jt in job_tickets
            if getattr(jt, "inspector_id", None) is not None
            and str((getattr(jt, "status", None) or "")).lower() != "pending"
        ]
        assigned_jobs.sort(
            key=lambda jt: getattr(jt, "assigned_at", None) or getattr(jt, "id", None),
            reverse=True,
        )
        if assigned_jobs:
            latest = assigned_jobs[0]
            inspector = getattr(latest, "inspector", None)
            assigned_inspector_name = getattr(inspector, "full_name", None) if inspector else None

    return payment_schemas.PaymentResponse(
        id=payment.id,
        schedule_id=payment.schedule_id,
        owner_id=payment.owner_id,
        owner_name=getattr(owner, "full_name", None),
        property_address=getattr(schedule.property, "address", None) if schedule and getattr(schedule, "property", None) else None,
        package_name=getattr(schedule.package, "name", None) if schedule and getattr(schedule, "package", None) else None,
        scheduled_date=getattr(schedule, "scheduled_date", None) if schedule else None,
        amount=payment.amount,
        currency=payment.currency,
        method=payment.method,
        reference_no=payment.reference_no,
        proof_url=payment.proof_url,
        status=payment.status,
        submitted_at=payment.submitted_at,
        verified_at=payment.verified_at,
        verified_by_name=getattr(admin, "full_name", None) if admin else None,
        notes=payment.notes,
        assigned_inspector_name=assigned_inspector_name,
    )


def submit_payment(
    *,
    owner_id,
    schedule_id,
    amount: int,
    currency: str,
    method: str,
    reference_no: Optional[str],
    notes: Optional[str],
    proof_file: Optional[UploadFile],
    proof_url: Optional[str],
    db: Session,
):
    try:
        schedule = (
            db.query(inspection_models.InspectionSchedule)
            .filter(inspection_models.InspectionSchedule.id == schedule_id)
            .first()
        )
        if not schedule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
        if schedule.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only pay for your own schedules")

        saved_proof_url = proof_url
        if proof_file is not None:
            saved_proof_url = _save_payment_proof_file(proof_file)

        payment = payment_models.Payment(
            schedule_id=schedule_id,
            owner_id=owner_id,
            amount=amount,
            currency=currency,
            method=method,
            reference_no=reference_no,
            notes=notes,
            proof_url=saved_proof_url,
            status="pending",
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Load related objects for response
        payment = (
            db.query(payment_models.Payment)
            .options(
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.property),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.package),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspector
                ),
                selectinload(payment_models.Payment.owner),
                selectinload(payment_models.Payment.verified_by_admin),
            )
            .filter(payment_models.Payment.id == payment.id)
            .first()
        )
        return _payment_to_response(payment)
    except HTTPException:
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def get_my_payments(owner_id, db: Session):
    try:
        payments = (
            db.query(payment_models.Payment)
            .options(
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.property),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.package),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspector
                ),
                selectinload(payment_models.Payment.owner),
                selectinload(payment_models.Payment.verified_by_admin),
            )
            .filter(payment_models.Payment.owner_id == owner_id)
            .order_by(payment_models.Payment.submitted_at.desc())
            .all()
        )
        return [_payment_to_response(p) for p in payments]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def get_all_payments(db: Session):
    try:
        payments = (
            db.query(payment_models.Payment)
            .options(
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.property),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.package),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspector
                ),
                selectinload(payment_models.Payment.owner),
                selectinload(payment_models.Payment.verified_by_admin),
            )
            .order_by(payment_models.Payment.submitted_at.desc())
            .all()
        )
        return [_payment_to_response(p) for p in payments]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def get_verified_payment_for_schedule(schedule_id, db: Session) -> Optional[payment_models.Payment]:
    try:
        return (
            db.query(payment_models.Payment)
            .filter(
                payment_models.Payment.schedule_id == schedule_id,
                payment_models.Payment.status == "verified",
            )
            .order_by(
                payment_models.Payment.verified_at.desc().nullslast(),
                payment_models.Payment.submitted_at.desc(),
            )
            .first()
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def verify_payment(payment_id, admin_id, update: payment_schemas.PaymentVerifyUpdate, db: Session):
    try:
        payment = db.query(payment_models.Payment).filter(payment_models.Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        payment.status = "verified"
        payment.verified_by = admin_id
        payment.verified_at = datetime.now(timezone.utc)
        if update and update.notes:
            payment.notes = update.notes

        db.commit()
        db.refresh(payment)

        payment = (
            db.query(payment_models.Payment)
            .options(
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.property),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.package),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspector
                ),
                selectinload(payment_models.Payment.owner),
                selectinload(payment_models.Payment.verified_by_admin),
            )
            .filter(payment_models.Payment.id == payment.id)
            .first()
        )
        return _payment_to_response(payment)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def reject_payment(payment_id, admin_id, update: payment_schemas.PaymentRejectUpdate, db: Session):
    try:
        payment = db.query(payment_models.Payment).filter(payment_models.Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        payment.status = "rejected"
        payment.verified_by = admin_id
        payment.verified_at = datetime.now(timezone.utc)
        if update and update.notes:
            payment.notes = update.notes

        db.commit()
        db.refresh(payment)

        payment = (
            db.query(payment_models.Payment)
            .options(
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.property),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.package),
                selectinload(payment_models.Payment.schedule).selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspector
                ),
                selectinload(payment_models.Payment.owner),
                selectinload(payment_models.Payment.verified_by_admin),
            )
            .filter(payment_models.Payment.id == payment.id)
            .first()
        )
        return _payment_to_response(payment)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

