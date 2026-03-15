import os
import uuid as uuid_lib
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.reports import schemas as reports_schemas
from app.reports import models as reports_models
from uuid import UUID

EVIDENCE_UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads")) / "evidence"
REPORT_HTML_DIR = Path(os.getenv("UPLOAD_DIR", "uploads")) / "reports"

# Evidence Services
def get_all_evidence(db: Session, inspection_id: Optional[UUID] = None):
    try:
        q = db.query(reports_models.Evidence).options(
            selectinload(reports_models.Evidence.inspection),
            selectinload(reports_models.Evidence.checklist)
        )
        if inspection_id is not None:
            q = q.filter(reports_models.Evidence.inspection_id == inspection_id)
        return q.all()
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
        new_evidence = reports_models.Evidence(**evidence_data.model_dump())
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


def upload_evidence_file(
    file: UploadFile,
    inspection_id: UUID,
    checklist_item_id: UUID,
    media_type: str,
    db: Session,
) -> reports_models.Evidence:
    """Save uploaded file to disk and create Evidence record. media_type should be 'photo' or 'video'."""
    ext = Path(file.filename or "bin").suffix.lower() or ".bin"
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Use image (JPEG, PNG, WebP, GIF) or video (MP4, WebM).",
        )
    EVIDENCE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid_lib.uuid4().hex}{ext}"
    file_path = EVIDENCE_UPLOAD_DIR / safe_name
    try:
        contents = file.file.read()
        file_path.write_bytes(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )
    media_url = f"/uploads/evidence/{safe_name}"
    evidence_data = reports_schemas.EvidenceCreate(
        inspection_id=inspection_id,
        checklist_item_id=checklist_item_id,
        media_type=media_type,
        media_url=media_url,
    )
    return create_evidence(evidence_data, db)

def update_evidence(evidence_id: UUID, evidence_data: reports_schemas.EvidenceUpdate, db: Session):
    try:
        evidence = db.query(reports_models.Evidence).filter(reports_models.Evidence.id == evidence_id).first()
        if not evidence:
            return None
        for field, value in evidence_data.model_dump(exclude_unset=True).items():
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
def get_all_red_flags(db: Session, inspection_id: Optional[UUID] = None):
    try:
        q = db.query(reports_models.RedFlag).options(selectinload(reports_models.RedFlag.inspection))
        if inspection_id is not None:
            q = q.filter(reports_models.RedFlag.inspection_id == inspection_id)
        return q.all()
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
        new_red_flag = reports_models.RedFlag(**red_flag_data.model_dump())
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
        for field, value in red_flag_data.model_dump(exclude_unset=True).items():
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
def get_all_inspection_reports(db: Session, inspection_id: Optional[UUID] = None):
    try:
        q = db.query(reports_models.InspectionReport).options(
            selectinload(reports_models.InspectionReport.inspection)
        )
        if inspection_id is not None:
            q = q.filter(reports_models.InspectionReport.inspection_id == inspection_id)
        return q.all()
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
        new_report = reports_models.InspectionReport(**report_data.model_dump())
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
        for field, value in report_data.model_dump(exclude_unset=True).items():
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


def generate_inspection_report_html(inspection_id: UUID, db: Session, base_url: str = "") -> str:
    """
    Build HTML report for an inspection (checklist, evidence, red flags) and save to uploads/reports.
    Creates or updates InspectionReport with report_url. Returns the report URL path.
    """
    from app.inspection import models as inspection_models

    inspection = (
        db.query(inspection_models.Inspection)
        .options(
            selectinload(inspection_models.Inspection.job_ticket).selectinload(
                inspection_models.JobTickets.schedule
            ).selectinload(inspection_models.InspectionSchedule.property),
            selectinload(inspection_models.Inspection.job_ticket).selectinload(
                inspection_models.JobTickets.schedule
            ).selectinload(inspection_models.InspectionSchedule.owner),
        )
        .filter(inspection_models.Inspection.id == inspection_id)
        .first()
    )
    if not inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")

    schedule = inspection.job_ticket.schedule if inspection.job_ticket else None
    property_addr = schedule.property.address if schedule and schedule.property else "—"
    owner_name = schedule.owner.full_name if schedule and schedule.owner else "—"

    results = (
        db.query(inspection_models.InspectionChecklistResults)
        .options(selectinload(inspection_models.InspectionChecklistResults.checklist))
        .filter(inspection_models.InspectionChecklistResults.inspection_id == inspection_id)
        .all()
    )
    evidence_list = get_all_evidence(db, inspection_id=inspection_id)
    red_flags = db.query(reports_models.RedFlag).filter(
        reports_models.RedFlag.inspection_id == inspection_id
    ).all()
    report_row = (
        db.query(reports_models.InspectionReport)
        .filter(reports_models.InspectionReport.inspection_id == inspection_id)
        .first()
    )
    report_notes = report_row.report_notes if report_row else ""

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    rows_html = "".join(
        f"<tr><td>{esc(r.checklist.area_name if r.checklist else '')}</td><td>{esc(r.status)}</td><td>{esc(r.remark)}</td></tr>"
        for r in results
    )
    evidence_html = "".join(
        f'<li><a href="{base_url}{esc(e.media_url)}">{esc(e.media_type)}</a></li>'
        for e in evidence_list
    )
    red_flags_html = "".join(
        f"<li><strong>{esc(rf.category)}</strong> ({esc(rf.severity)}): {esc(rf.description)}</li>"
        for rf in red_flags
    )

    start_str = inspection.start_time.strftime("%Y-%m-%d %H:%M") if inspection.start_time else "—"
    end_str = inspection.end_time.strftime("%Y-%m-%d %H:%M") if inspection.end_time else "—"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Inspection Report {inspection_id}</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 2rem; color: #1e293b; }}
h1 {{ font-size: 1.5rem; border-bottom: 2px solid #6366f1; padding-bottom: 0.5rem; }}
table {{ border-collapse: collapse; width: 100%; margin: 1rem 0; }}
th, td {{ border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }}
th {{ background: #f1f5f9; }}
ul {{ margin: 0.5rem 0; padding-left: 1.5rem; }}
.red {{ background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }}
</style>
</head>
<body>
<h1>HomeGuard Inspection Report</h1>
<p><strong>Property:</strong> {esc(property_addr)}</p>
<p><strong>Owner:</strong> {esc(owner_name)}</p>
<p><strong>Status:</strong> {esc(inspection.overall_status or '')}</p>
<p><strong>Started:</strong> {start_str} &nbsp; <strong>Ended:</strong> {end_str}</p>

<h2>Checklist</h2>
<table><thead><tr><th>Area</th><th>Status</th><th>Remark</th></tr></thead><tbody>{rows_html}</tbody></table>

<h2>Evidence</h2>
<ul>{evidence_html if evidence_html else '<li>None</li>'}</ul>

<h2>Red flags</h2>
<div class="red"><ul>{red_flags_html if red_flags_html else '<li>None</li>'}</ul></div>

<h2>Summary</h2>
<p>{esc(report_notes) or '—'}</p>
</body>
</html>
"""
    REPORT_HTML_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORT_HTML_DIR / f"{inspection_id}.html"
    path.write_text(html, encoding="utf-8")
    report_url = f"/uploads/reports/{inspection_id}.html"
    if report_row:
        report_row.report_url = report_url
        db.commit()
        db.refresh(report_row)
    else:
        new_report = reports_models.InspectionReport(
            inspection_id=inspection_id,
            report_url=report_url,
            report_notes=report_notes,
        )
        db.add(new_report)
        db.commit()
    return report_url


