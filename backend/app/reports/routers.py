from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.reports import schemas as reports_schemas
from app.reports import services as reports_services
from auth.dependencies import CurrentUser, get_current_admin, get_current_user
from middleware.db import get_db

router = APIRouter(prefix="/reports", tags=["reports"])

# Evidence Routes
@router.get("/evidence", response_model=list[reports_schemas.EvidenceResponse])
def get_all_evidence(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Admin: all evidence.
    Other roles: currently also see all (data is not directly scoped to user here).
    """
    try:
        return reports_services.get_all_evidence(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.get("/evidence/{evidence_id}", response_model=reports_schemas.EvidenceResponse)
def get_evidence(evidence_id: UUID, db: Session = Depends(get_db)):
    try:
        return reports_services.get_evidence_by_id(evidence_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post(
    "/evidence",
    response_model=reports_schemas.EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_evidence(
    evidence_data: reports_schemas.EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin and inspectors can create evidence."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create evidence",
        )
    try:
        return reports_services.create_evidence(evidence_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.put("/evidence/{evidence_id}", response_model=reports_schemas.EvidenceResponse)
def update_evidence(
    evidence_id: UUID,
    evidence_data: reports_schemas.EvidenceUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin and inspectors can update evidence."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update evidence",
        )
    try:
        evidence = reports_services.update_evidence(evidence_id, evidence_data, db)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found"
            )
        return evidence
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.delete("/evidence/{evidence_id}")
def delete_evidence(
    evidence_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: delete evidence."""
    try:
        result = reports_services.delete_evidence(evidence_id, db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found"
            )
        return {"message": "Evidence deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# RedFlag Routes
@router.get("/red-flags", response_model=list[reports_schemas.RedFlagResponse])
def get_all_red_flags(db: Session = Depends(get_db)):
    try:
        return reports_services.get_all_red_flags(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/red-flags/{red_flag_id}", response_model=reports_schemas.RedFlagResponse)
def get_red_flag(red_flag_id: UUID, db: Session = Depends(get_db)):
    try:
        return reports_services.get_red_flag_by_id(red_flag_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post(
    "/red-flags",
    response_model=reports_schemas.RedFlagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_red_flag(
    red_flag_data: reports_schemas.RedFlagCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin and inspectors can create red flags."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create red flags",
        )
    try:
        return reports_services.create_red_flag(red_flag_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.put("/red-flags/{red_flag_id}", response_model=reports_schemas.RedFlagResponse)
def update_red_flag(
    red_flag_id: UUID,
    red_flag_data: reports_schemas.RedFlagUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin and inspectors can update red flags."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update red flags",
        )
    try:
        red_flag = reports_services.update_red_flag(red_flag_id, red_flag_data, db)
        if not red_flag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Red flag not found"
            )
        return red_flag
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.delete("/red-flags/{red_flag_id}")
def delete_red_flag(
    red_flag_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: delete red flags."""
    try:
        result = reports_services.delete_red_flag(red_flag_id, db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Red flag not found"
            )
        return {"message": "Red flag deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# InspectionReport Routes
@router.get("/inspection-reports", response_model=list[reports_schemas.InspectionReportResponse])
def get_all_inspection_reports(
    inspection_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
):
    try:
        return reports_services.get_all_inspection_reports(db, inspection_id=inspection_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/inspection-reports/{report_id}", response_model=reports_schemas.InspectionReportResponse)
def get_inspection_report(report_id: UUID, db: Session = Depends(get_db)):
    try:
        return reports_services.get_inspection_report_by_id(report_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post(
    "/inspection-reports",
    response_model=reports_schemas.InspectionReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inspection_report(
    report_data: reports_schemas.InspectionReportCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin and inspectors can create inspection reports."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create inspection reports",
        )
    try:
        return reports_services.create_inspection_report(report_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.put(
    "/inspection-reports/{report_id}",
    response_model=reports_schemas.InspectionReportResponse,
)
def update_inspection_report(
    report_id: UUID,
    report_data: reports_schemas.InspectionReportUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin and inspectors can update inspection reports."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update inspection reports",
        )
    try:
        report = reports_services.update_inspection_report(report_id, report_data, db)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection report not found",
            )
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.delete("/inspection-reports/{report_id}")
def delete_inspection_report(
    report_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: delete inspection reports."""
    try:
        result = reports_services.delete_inspection_report(report_id, db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection report not found",
            )
        return {"message": "Inspection report deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )