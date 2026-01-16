from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.reports import schemas as reports_schemas
from app.reports import models as reports_models
from uuid import UUID

# Evidence Services
def get_all_evidence(db: Session):
    try:
        return db.query(reports_models.Evidence).options(
            selectinload(reports_models.Evidence.inspection),
            selectinload(reports_models.Evidence.checklist)
        ).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_evidence_by_id(evidence_id: UUID, db: Session):
    try:
        evidence = db.query(reports_models.Evidence).options(
            selectinload(reports_models.Evidence.inspection),
            selectinload(reports_models.Evidence.checklist)
        ).filter(reports_models.Evidence.id == evidence_id).first()
        if not evidence:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")
        return evidence
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_evidence(evidence_data: reports_schemas.EvidenceCreate, db: Session):
    try:
        new_evidence = reports_models.Evidence(**evidence_data.dict())
        db.add(new_evidence)
        db.commit()
        db.refresh(new_evidence)
        return new_evidence
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_evidence(evidence_id: UUID, evidence_data: reports_schemas.EvidenceUpdate, db: Session):
    try:
        evidence = db.query(reports_models.Evidence).filter(reports_models.Evidence.id == evidence_id).first()
        if not evidence:
            return None
        for field, value in evidence_data.dict(exclude_unset=True).items():
            setattr(evidence, field, value)
        db.commit()
        db.refresh(evidence)
        return evidence
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_evidence(evidence_id: UUID, db: Session):
    try:
        evidence = db.query(reports_models.Evidence).filter(reports_models.Evidence.id == evidence_id).first()
        if not evidence:
            return None
        db.delete(evidence)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# RedFlag Services
def get_all_red_flags(db: Session):
    try:
        return db.query(reports_models.RedFlag).options(selectinload(reports_models.RedFlag.inspection)).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_red_flag_by_id(red_flag_id: UUID, db: Session):
    try:
        red_flag = db.query(reports_models.RedFlag).options(selectinload(reports_models.RedFlag.inspection)).filter(reports_models.RedFlag.id == red_flag_id).first()
        if not red_flag:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Red flag not found")
        return red_flag
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_red_flag(red_flag_data: reports_schemas.RedFlagCreate, db: Session):
    try:
        new_red_flag = reports_models.RedFlag(**red_flag_data.dict())
        db.add(new_red_flag)
        db.commit()
        db.refresh(new_red_flag)
        return new_red_flag
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_red_flag(red_flag_id: UUID, red_flag_data: reports_schemas.RedFlagUpdate, db: Session):
    try:
        red_flag = db.query(reports_models.RedFlag).filter(reports_models.RedFlag.id == red_flag_id).first()
        if not red_flag:
            return None
        for field, value in red_flag_data.dict(exclude_unset=True).items():
            setattr(red_flag, field, value)
        db.commit()
        db.refresh(red_flag)
        return red_flag
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_red_flag(red_flag_id: UUID, db: Session):
    try:
        red_flag = db.query(reports_models.RedFlag).filter(reports_models.RedFlag.id == red_flag_id).first()
        if not red_flag:
            return None
        db.delete(red_flag)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# InspectionReport Services
def get_all_inspection_reports(db: Session):
    try:
        return db.query(reports_models.InspectionReport).options(selectinload(reports_models.InspectionReport.inspection)).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_inspection_report_by_id(report_id: UUID, db: Session):
    try:
        report = db.query(reports_models.InspectionReport).options(selectinload(reports_models.InspectionReport.inspection)).filter(reports_models.InspectionReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection report not found")
        return report
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_inspection_report(report_data: reports_schemas.InspectionReportCreate, db: Session):
    try:
        new_report = reports_models.InspectionReport(**report_data.dict())
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_inspection_report(report_id: UUID, report_data: reports_schemas.InspectionReportUpdate, db: Session):
    try:
        report = db.query(reports_models.InspectionReport).filter(reports_models.InspectionReport.id == report_id).first()
        if not report:
            return None
        for field, value in report_data.dict(exclude_unset=True).items():
            setattr(report, field, value)
        db.commit()
        db.refresh(report)
        return report
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_inspection_report(report_id: UUID, db: Session):
    try:
        report = db.query(reports_models.InspectionReport).filter(reports_models.InspectionReport.id == report_id).first()
        if not report:
            return None
        db.delete(report)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


