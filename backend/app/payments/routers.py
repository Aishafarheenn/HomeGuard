from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session

from auth.dependencies import CurrentUser, get_current_admin, get_current_owner
from middleware.db import get_db

from app.payments import schemas as payment_schemas
from app.payments import services as payment_services

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=payment_schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
def submit_payment(
    schedule_id: UUID = Form(...),
    amount: int = Form(...),
    currency: str = Form("INR"),
    method: str = Form(...),
    reference_no: str | None = Form(None),
    notes: str | None = Form(None),
    proof_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_owner: CurrentUser = Depends(get_current_owner),
):
    try:
        return payment_services.submit_payment(
            owner_id=current_owner.user_id,
            schedule_id=schedule_id,
            amount=amount,
            currency=currency,
            method=method,
            reference_no=reference_no,
            notes=notes,
            proof_file=proof_file,
            proof_url=None,
            db=db,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/my", response_model=list[payment_schemas.PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_owner: CurrentUser = Depends(get_current_owner),
):
    try:
        return payment_services.get_my_payments(current_owner.user_id, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("", response_model=list[payment_schemas.PaymentResponse])
def get_all_payments(
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        return payment_services.get_all_payments(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{payment_id}/verify", response_model=payment_schemas.PaymentResponse)
def verify_payment(
    payment_id: UUID,
    update: payment_schemas.PaymentVerifyUpdate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        return payment_services.verify_payment(payment_id, current_admin.user_id, update, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{payment_id}/reject", response_model=payment_schemas.PaymentResponse)
def reject_payment(
    payment_id: UUID,
    update: payment_schemas.PaymentRejectUpdate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        return payment_services.reject_payment(payment_id, current_admin.user_id, update, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

