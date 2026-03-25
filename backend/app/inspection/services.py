import os
from uuid import UUID
from datetime import datetime, timezone, date, timedelta
from math import radians, sin, cos, sqrt, atan2

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.inspection import models as inspection_models
from app.inspection import schemas as inspection_schemas
from app.payments import models as payment_models
from app.payments import services as payment_services

# Max distance (meters) from property for inspector to start inspection (GeoShield).
GEO_MAX_RADIUS_METERS = 10000


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in meters between two WGS84 points."""
    R = 6_371_000  # Earth radius in meters
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# InspectionPackage Services
def get_all_packages(db: Session):
    try:
        return db.query(inspection_models.InspectionPackage).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_package_by_id(package_id: UUID, db: Session):
    try:
        package = db.query(inspection_models.InspectionPackage).filter(inspection_models.InspectionPackage.id == package_id).first()
        if not package:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
        return package
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_package(package_data: inspection_schemas.InspectionPackageCreate, db: Session):
    try:
        new_package = inspection_models.InspectionPackage(**package_data.model_dump())
        db.add(new_package)
        db.commit()
        db.refresh(new_package)
        return new_package
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Package already exists or invalid data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# InspectionSchedule Services
def get_all_schedules(db: Session):
    try:
        return db.query(inspection_models.InspectionSchedule).all()
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def get_schedules_for_owner(owner_id: UUID, db: Session):
    """Schedules for a specific owner."""
    try:
        return (
            db.query(inspection_models.InspectionSchedule)
            .filter(inspection_models.InspectionSchedule.owner_id == owner_id)
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def get_owner_jobs(owner_id: UUID, db: Session):
    """Schedules for owner with job ticket and inspection status (for My Jobs view)."""
    try:
        schedules = (
            db.query(inspection_models.InspectionSchedule)
            .filter(inspection_models.InspectionSchedule.owner_id == owner_id)
            .options(
                selectinload(inspection_models.InspectionSchedule.property),
                selectinload(inspection_models.InspectionSchedule.package),
                selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspector
                ),
                selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                    inspection_models.JobTickets.inspections
                ),
            )
            .order_by(inspection_models.InspectionSchedule.scheduled_date.desc())
            .all()
        )
        result = []
        for s in schedules:
            item = {
                "schedule_id": s.id,
                "package_id": s.package_id,
                "scheduled_date": s.scheduled_date,
                "property_address": s.property.address if s.property else "",
                "package_name": s.package.name if s.package else "",
                "package_price": s.package.price if s.package else None,
                "schedule_status": s.status,
                "created_at": s.created_at,
                "job_ticket_id": None,
                "job_ticket_status": None,
                "inspector_name": None,
                "inspection_status": None,
                "assigned_at": None,
                "inspection_completed_at": None,
                "inspection_id": None,
                "inspector_id": None,
                "has_owner_review": False,
            }
            if s.job_tickets:
                jt = s.job_tickets[0]
                item["job_ticket_id"] = jt.id
                item["job_ticket_status"] = jt.status
                item["assigned_at"] = jt.assigned_at
                if jt.inspector_id:
                    item["inspector_id"] = jt.inspector_id
                if jt.inspector:
                    item["inspector_name"] = jt.inspector.full_name
                if jt.inspections:
                    _ts = lambda i: i.end_time or i.start_time or datetime(1970, 1, 1, tzinfo=timezone.utc)
                    latest = max(jt.inspections, key=_ts)
                    item["inspection_status"] = latest.overall_status
                    item["inspection_id"] = latest.id
                    if (latest.overall_status or "").lower() == "completed":
                        item["inspection_completed_at"] = latest.end_time or latest.start_time
            item["payment_status"] = None
            item["payment_submitted_at"] = None
            item["payment_verified_at"] = None
            result.append(item)

        # Latest payment status per schedule (manual/offline payments)
        schedule_ids = [it["schedule_id"] for it in result]
        if schedule_ids:
            payments = (
                db.query(payment_models.Payment)
                .filter(
                    payment_models.Payment.owner_id == owner_id,
                    payment_models.Payment.schedule_id.in_(schedule_ids),
                )
                .order_by(payment_models.Payment.submitted_at.desc())
                .all()
            )
            latest_by_schedule = {}
            for p in payments:
                sid = p.schedule_id
                if sid not in latest_by_schedule:
                    latest_by_schedule[sid] = p

            for it in result:
                p = latest_by_schedule.get(it["schedule_id"])
                if p:
                    it["payment_status"] = p.status
                    it["payment_submitted_at"] = p.submitted_at
                    it["payment_verified_at"] = p.verified_at
                else:
                    it["payment_status"] = "unpaid"
                    it["payment_submitted_at"] = None
                    it["payment_verified_at"] = None

        from app.feedback import models as feedback_models

        completed_inspection_ids = [
            it["inspection_id"]
            for it in result
            if it.get("inspection_id")
            and (it.get("inspection_status") or "").lower() == "completed"
        ]
        reviewed_set = set()
        if completed_inspection_ids:
            q = (
                db.query(feedback_models.InspectionReview.inspection_id)
                .filter(feedback_models.InspectionReview.inspection_id.in_(completed_inspection_ids))
                .all()
            )
            reviewed_set = {row[0] for row in q}

        for it in result:
            iid = it.get("inspection_id")
            if iid and (it.get("inspection_status") or "").lower() == "completed":
                it["has_owner_review"] = iid in reviewed_set

        return [inspection_schemas.OwnerJobItem(**item) for item in result]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def get_owner_job_report(schedule_id: UUID, owner_id: UUID, db: Session):
    """Inspection report for an owner's job (schedule). Returns 404 if no inspection yet."""
    schedule = (
        db.query(inspection_models.InspectionSchedule)
        .filter(
            inspection_models.InspectionSchedule.id == schedule_id,
            inspection_models.InspectionSchedule.owner_id == owner_id,
        )
        .options(
            selectinload(inspection_models.InspectionSchedule.job_tickets).selectinload(
                inspection_models.JobTickets.inspections
            ),
        )
        .first()
    )
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found or access denied",
        )
    inspection = None
    if schedule.job_tickets:
        jt = schedule.job_tickets[0]
        if jt.inspections:
            _ts = lambda i: i.end_time or i.start_time or datetime(1970, 1, 1, tzinfo=timezone.utc)
            inspection = max(jt.inspections, key=_ts)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No inspection report yet for this job",
        )
    results = (
        db.query(inspection_models.InspectionChecklistResults)
        .options(
            selectinload(inspection_models.InspectionChecklistResults.checklist),
        )
        .filter(inspection_models.InspectionChecklistResults.inspection_id == inspection.id)
        .all()
    )
    from app.reports import models as reports_models

    report_row = (
        db.query(reports_models.InspectionReport)
        .filter(reports_models.InspectionReport.inspection_id == inspection.id)
        .first()
    )
    checklist_items = [
        inspection_schemas.OwnerJobReportChecklistItem(
            area_name=r.checklist.area_name if r.checklist else "",
            status=r.status,
            remark=r.remark,
        )
        for r in results
    ]
    evidence_rows = (
        db.query(reports_models.Evidence)
        .options(selectinload(reports_models.Evidence.checklist))
        .filter(reports_models.Evidence.inspection_id == inspection.id)
        .all()
    )
    evidence_items = [
        inspection_schemas.OwnerJobReportEvidenceItem(
            id=e.id,
            media_type=e.media_type,
            media_url=e.media_url,
            area_name=e.checklist.area_name if e.checklist else None,
        )
        for e in evidence_rows
    ]
    red_flag_rows = (
        db.query(reports_models.RedFlag)
        .filter(reports_models.RedFlag.inspection_id == inspection.id)
        .all()
    )
    red_flag_items = [
        inspection_schemas.OwnerJobReportRedFlagItem(
            id=rf.id,
            category=rf.category,
            severity=rf.severity,
            description=rf.description,
        )
        for rf in red_flag_rows
    ]
    return inspection_schemas.OwnerJobReportResponse(
        inspection_id=inspection.id,
        start_time=inspection.start_time,
        end_time=inspection.end_time,
        overall_status=inspection.overall_status or "",
        checklist_results=checklist_items,
        report_notes=report_row.report_notes if report_row else None,
        report_url=report_row.report_url if report_row else None,
        evidence=evidence_items,
        red_flags=red_flag_items,
    )

def get_schedule_by_id(schedule_id: UUID, db: Session):
    try:
        schedule = db.query(inspection_models.InspectionSchedule).filter(inspection_models.InspectionSchedule.id == schedule_id).first()
        if not schedule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
        return schedule
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_schedule(schedule_data: inspection_schemas.InspectionScheduleCreate, db: Session):
    try:
        new_schedule = inspection_models.InspectionSchedule(**schedule_data.model_dump())
        db.add(new_schedule)
        db.flush()
        pending_ticket = inspection_models.JobTickets(
            schedule_id=new_schedule.id,
            inspector_id=None,
            status="pending",
        )
        db.add(pending_ticket)
        db.commit()
        db.refresh(new_schedule)
        return new_schedule
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# JobTickets Services
def _jobticket_list_options():
    """Eager load schedule (with property, owner, package), inspector, and inspections for list/detail."""
    return [
        selectinload(inspection_models.JobTickets.schedule).selectinload(inspection_models.InspectionSchedule.property),
        selectinload(inspection_models.JobTickets.schedule).selectinload(inspection_models.InspectionSchedule.owner),
        selectinload(inspection_models.JobTickets.schedule).selectinload(inspection_models.InspectionSchedule.package),
        selectinload(inspection_models.JobTickets.inspector),
        selectinload(inspection_models.JobTickets.inspections).selectinload(
            inspection_models.Inspection.geo_verification_logs
        ),
    ]


def get_all_jobtickets(db: Session):
    try:
        return db.query(inspection_models.JobTickets).options(
            *_jobticket_list_options()
        ).all()
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def get_jobtickets_for_inspector(inspector_id: UUID, db: Session):
    """Job tickets assigned to a specific inspector."""
    try:
        return (
            db.query(inspection_models.JobTickets)
            .options(*_jobticket_list_options())
            .filter(inspection_models.JobTickets.inspector_id == inspector_id)
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

def get_jobticket_by_id(job_ticket_id: UUID, db: Session):
    try:
        ticket = (
            db.query(inspection_models.JobTickets)
            .options(*_jobticket_list_options())
            .filter(inspection_models.JobTickets.id == job_ticket_id)
            .first()
        )
        if not ticket:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job ticket not found")
        return ticket
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_jobticket(ticket_data: inspection_schemas.JobTicketCreate, db: Session):
    try:
        schedule_id = ticket_data.schedule_id
        inspector_id = getattr(ticket_data, "inspector_id", None)

        # Workflow gate: assign inspector only after payment is verified for the schedule.
        if inspector_id is not None:
            verified_payment = payment_services.get_verified_payment_for_schedule(
                schedule_id, db
            )
            if not verified_payment:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Payment not verified for this schedule. Please ask the owner to submit payment and admin to verify before assigning an inspector.",
                )

        existing_pending = (
            db.query(inspection_models.JobTickets)
            .filter(
                inspection_models.JobTickets.schedule_id == schedule_id,
                inspection_models.JobTickets.inspector_id.is_(None),
            )
            .first()
        )
        existing_assigned = (
            db.query(inspection_models.JobTickets)
            .filter(
                inspection_models.JobTickets.schedule_id == schedule_id,
                inspection_models.JobTickets.inspector_id.isnot(None),
            )
            .order_by(inspection_models.JobTickets.assigned_at.desc())
            .first()
        )

        if existing_assigned and inspector_id:
            if (existing_assigned.status or "").lower() == "completed":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Job is completed and cannot be reassigned.",
                )
            existing_assigned.inspector_id = inspector_id
            existing_assigned.status = (
                ticket_data.status
                if getattr(ticket_data, "status", None)
                else existing_assigned.status
            ) or "assigned"
            db.commit()
            db.refresh(existing_assigned)
            new_ticket = existing_assigned
        elif existing_pending and inspector_id:
            existing_pending.inspector_id = inspector_id
            existing_pending.status = (
                ticket_data.status
                if getattr(ticket_data, "status", None)
                else "assigned"
            )
            db.commit()
            db.refresh(existing_pending)
            new_ticket = existing_pending
        else:
            payload = ticket_data.model_dump()
            if inspector_id is None:
                payload["status"] = payload.get("status") or "pending"
            new_ticket = inspection_models.JobTickets(**payload)
            db.add(new_ticket)
            db.commit()
            db.refresh(new_ticket)
        if new_ticket.inspector_id and new_ticket.status and (new_ticket.status or "").lower() != "pending":
            schedule = (
                db.query(inspection_models.InspectionSchedule)
                .options(selectinload(inspection_models.InspectionSchedule.property))
                .filter(inspection_models.InspectionSchedule.id == new_ticket.schedule_id)
                .first()
            )
            if schedule and schedule.property:
                from app.notifications import services as notification_services
                notification_services.notify_inspector_assignment(
                    new_ticket.inspector_id,
                    new_ticket.id,
                    schedule.property.address or "Property",
                    db,
                )
                from app.inspector import models as inspector_models
                inspector = (
                    db.query(inspector_models.Inspector)
                    .filter(inspector_models.Inspector.id == new_ticket.inspector_id)
                    .first()
                )
                inspector_name = inspector.full_name if inspector else "Inspector"
                notification_services.notify_owner_inspector_assigned(
                    schedule.owner_id,
                    schedule.property.address or "Property",
                    inspector_name,
                    db,
                )
        return new_ticket
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# Inspection Services
def get_all_inspection(db: Session):
    try:
        return db.query(inspection_models.Inspection).options(
            selectinload(inspection_models.Inspection.job_ticket)
        ).all()
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

def get_inspection_by_id(inspection_id: UUID, db: Session):
    try:
        inspection = (
            db.query(inspection_models.Inspection)
            .options(selectinload(inspection_models.Inspection.job_ticket))
            .filter(inspection_models.Inspection.id == inspection_id)
            .first()
        )
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found"
            )
        return inspection
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

def _next_recurring_date(scheduled_date: date, frequency: str) -> date:
    """Return next occurrence date for weekly/monthly/yearly."""
    if frequency == "weekly":
        return scheduled_date + timedelta(days=7)
    if frequency == "monthly":
        if scheduled_date.month == 12:
            return scheduled_date.replace(year=scheduled_date.year + 1, month=1)
        return scheduled_date.replace(month=scheduled_date.month + 1)
    if frequency == "yearly":
        return scheduled_date.replace(year=scheduled_date.year + 1)
    return scheduled_date


def _create_next_recurring_schedule(job_ticket, db: Session) -> None:
    """If schedule has recurring frequency, create next schedule and pending job ticket."""
    if not job_ticket or not job_ticket.schedule:
        return
    schedule = job_ticket.schedule
    freq = (schedule.frequency or "").lower()
    if freq not in ("weekly", "monthly", "yearly"):
        return
    next_date = _next_recurring_date(schedule.scheduled_date, freq)
    new_schedule = inspection_models.InspectionSchedule(
        owner_id=schedule.owner_id,
        property_id=schedule.property_id,
        package_id=schedule.package_id,
        scheduled_date=next_date,
        frequency=schedule.frequency,
        status="scheduled",
    )
    db.add(new_schedule)
    db.flush()
    pending_ticket = inspection_models.JobTickets(
        schedule_id=new_schedule.id,
        inspector_id=None,
        status="pending",
    )
    db.add(pending_ticket)
    db.commit()


def _notify_owner_if_completed(inspection, db: Session):
    """If inspection overall_status is completed, notify owner (in-app + WhatsApp) and create next recurring if applicable."""
    if not inspection or (inspection.overall_status or "").lower() != "completed":
        return
    job_ticket = (
        db.query(inspection_models.JobTickets)
        .options(
            selectinload(inspection_models.JobTickets.schedule).selectinload(inspection_models.InspectionSchedule.owner),
            selectinload(inspection_models.JobTickets.schedule).selectinload(inspection_models.InspectionSchedule.property),
        )
        .filter(inspection_models.JobTickets.id == inspection.job_ticket_id)
        .first()
    )
    if not job_ticket or not job_ticket.schedule:
        return
    owner_id = job_ticket.schedule.owner_id
    property_address = (job_ticket.schedule.property and job_ticket.schedule.property.address) or "Property"
    report_url = None
    base_url = os.getenv("BASE_URL", "").rstrip("/")
    try:
        from app.reports import models as reports_models
        report_row = (
            db.query(reports_models.InspectionReport)
            .filter(reports_models.InspectionReport.inspection_id == inspection.id)
            .first()
        )
        if report_row and report_row.report_url:
            report_url = report_row.report_url
    except Exception:
        pass
    from app.notifications import services as notification_services
    notification_services.notify_owner_inspection_complete(
        owner_id, property_address, db, report_url=report_url, base_url=base_url
    )
    _create_next_recurring_schedule(job_ticket, db)


def create_inspection(inspection_data: inspection_schemas.InspectionCreate, db: Session):
    try:
        lat = getattr(inspection_data, "latitude", None)
        lon = getattr(inspection_data, "longitude", None)
        payload = inspection_data.model_dump(exclude={"latitude", "longitude"})

        # GeoShield: if location provided, verify inspector is within radius of property before allowing start
        if lat is not None and lon is not None:
            job_ticket = (
                db.query(inspection_models.JobTickets)
                .options(
                    selectinload(inspection_models.JobTickets.schedule).selectinload(
                        inspection_models.InspectionSchedule.property
                    ),
                )
                .filter(inspection_models.JobTickets.id == inspection_data.job_ticket_id)
                .first()
            )
            if not job_ticket or not job_ticket.schedule or not job_ticket.schedule.property:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Job ticket or property not found",
                )
            prop = job_ticket.schedule.property
            if prop.latitude is not None and prop.longitude is not None:
                distance_m = _haversine_meters(
                    prop.latitude, prop.longitude, lat, lon
                )
                if distance_m > GEO_MAX_RADIUS_METERS:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"You must be within {GEO_MAX_RADIUS_METERS}m of the property to start this inspection. Current distance: {distance_m:.0f}m.",
                    )
            else:
                distance_m = 0.0
        else:
            distance_m = None

        new_inspection = inspection_models.Inspection(**payload)
        db.add(new_inspection)
        db.flush()
        job_ticket = (
            db.query(inspection_models.JobTickets)
            .filter(inspection_models.JobTickets.id == new_inspection.job_ticket_id)
            .first()
        )
        if job_ticket and (job_ticket.status or "").lower() not in ("in_progress", "completed"):
            job_ticket.status = "in_progress"
        # Record geo verification when location was provided
        if lat is not None and lon is not None and new_inspection.id:
            geo = inspection_models.GeoVerification(
                inspection_id=new_inspection.id,
                latitude=lat,
                longitude=lon,
                distance_from_property=distance_m if distance_m is not None else 0.0,
                verified=True,
            )
            db.add(geo)
        db.commit()
        db.refresh(new_inspection)

        _notify_owner_if_completed(new_inspection, db)
        return new_inspection
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def update_inspection(inspection_id: UUID, inspection_data: inspection_schemas.InspectionUpdate, db: Session):
    try:
        inspection = db.query(inspection_models.Inspection).filter(inspection_models.Inspection.id == inspection_id).first()
        if not inspection:
            return None
        new_status = (inspection_data.overall_status or inspection.overall_status or "").lower()
        if new_status == "completed":
            checklist_count = db.query(inspection_models.InspectionChecklistResults).filter(
                inspection_models.InspectionChecklistResults.inspection_id == inspection_id
            ).count()
            from app.reports import models as reports_models
            report_row = (
                db.query(reports_models.InspectionReport)
                .filter(reports_models.InspectionReport.inspection_id == inspection_id)
                .first()
            )
            has_report_notes = bool(report_row and report_row.report_notes and report_row.report_notes.strip())
            if checklist_count < 1 and not has_report_notes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Add at least one checklist item or report note before completing.",
                )
        for field, value in inspection_data.model_dump(exclude_unset=True).items():
            setattr(inspection, field, value)
        if (inspection.overall_status or "").lower() == "completed" and inspection.job_ticket_id:
            job_ticket = (
                db.query(inspection_models.JobTickets)
                .filter(inspection_models.JobTickets.id == inspection.job_ticket_id)
                .first()
            )
            if job_ticket:
                job_ticket.status = "completed"
        db.commit()
        db.refresh(inspection)
        if new_status == "completed":
            try:
                from app.reports import services as reports_services
                reports_services.generate_inspection_report_html(inspection_id, db, base_url="")
            except Exception:
                pass
        _notify_owner_if_completed(inspection, db)
        return inspection
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_inspection(inspection_id: UUID, db: Session):
    try:
        inspection = db.query(inspection_models.Inspection).filter(inspection_models.Inspection.id == inspection_id).first()
        if not inspection:
            return None
        db.delete(inspection)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# GeoVerification Services
def get_all_geo_verifications(db: Session):
    try:
        return db.query(inspection_models.GeoVerification).options(selectinload(inspection_models.GeoVerification.inspection)).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_geo_verification_by_id(geo_id: UUID, db: Session):
    try:
        geo = db.query(inspection_models.GeoVerification).options(selectinload(inspection_models.GeoVerification.inspection)).filter(inspection_models.GeoVerification.id == geo_id).first()
        if not geo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Geo verification not found")
        return geo
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_geo_verification(geo_data: inspection_schemas.GeoVerificationCreate, db: Session):
    try:
        new_geo = inspection_models.GeoVerification(**geo_data.model_dump())
        db.add(new_geo)
        db.commit()
        db.refresh(new_geo)
        return new_geo
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# Checklist Services
def get_all_checklists(db: Session):
    try:
        return db.query(inspection_models.Checklist).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_checklist_by_id(checklist_id: UUID, db: Session):
    try:
        checklist = db.query(inspection_models.Checklist).filter(inspection_models.Checklist.id == checklist_id).first()
        if not checklist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")
        return checklist
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def get_checklist_items_by_package(package_id: UUID, db: Session):
    """Checklist items (areas) for a package."""
    try:
        return (
            db.query(inspection_models.Checklist)
            .filter(inspection_models.Checklist.package_id == package_id)
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

def create_checklist(checklist_data: inspection_schemas.ChecklistCreate, db: Session):
    try:
        new_checklist = inspection_models.Checklist(**checklist_data.model_dump())
        db.add(new_checklist)
        db.commit()
        db.refresh(new_checklist)
        return new_checklist
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def update_checklist(
    checklist_id: UUID,
    update_data: inspection_schemas.ChecklistUpdate,
    db: Session,
):
    try:
        checklist = (
            db.query(inspection_models.Checklist)
            .filter(inspection_models.Checklist.id == checklist_id)
            .first()
        )
        if not checklist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found")
        data = update_data.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
        if "area_name" in data and data["area_name"] is not None:
            name = data["area_name"].strip() if isinstance(data["area_name"], str) else str(data["area_name"])
            if not name:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="area_name cannot be empty")
            checklist.area_name = name
        db.commit()
        db.refresh(checklist)
        return checklist
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def delete_checklist(checklist_id: UUID, db: Session):
    """Delete a checklist template item if no inspection results or evidence reference it."""
    from app.reports import models as reports_models

    try:
        checklist = (
            db.query(inspection_models.Checklist)
            .filter(inspection_models.Checklist.id == checklist_id)
            .first()
        )
        if not checklist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found")

        result_count = (
            db.query(inspection_models.InspectionChecklistResults)
            .filter(inspection_models.InspectionChecklistResults.checklist_item_id == checklist_id)
            .count()
        )
        evidence_count = (
            db.query(reports_models.Evidence)
            .filter(reports_models.Evidence.checklist_item_id == checklist_id)
            .count()
        )
        if result_count > 0 or evidence_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete: this checklist item is used in inspection results or evidence. Remove or archive those first.",
            )

        db.delete(checklist)
        db.commit()
        return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# InspectionChecklistResults Services
def get_all_checklist_results(db: Session):
    try:
        return db.query(inspection_models.InspectionChecklistResults).options(
            selectinload(inspection_models.InspectionChecklistResults.inspection),
            selectinload(inspection_models.InspectionChecklistResults.checklist)
        ).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_checklist_result_by_id(result_id: UUID, db: Session):
    try:
        result = db.query(inspection_models.InspectionChecklistResults).options(
            selectinload(inspection_models.InspectionChecklistResults.inspection),
            selectinload(inspection_models.InspectionChecklistResults.checklist)
        ).filter(inspection_models.InspectionChecklistResults.id == result_id).first()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist result not found")
        return result
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_checklist_results_by_inspection_id(inspection_id: UUID, db: Session):
    """Checklist results for an inspection, with checklist item (area_name) loaded."""
    try:
        return (
            db.query(inspection_models.InspectionChecklistResults)
            .options(
                selectinload(inspection_models.InspectionChecklistResults.inspection),
                selectinload(inspection_models.InspectionChecklistResults.checklist),
            )
            .filter(inspection_models.InspectionChecklistResults.inspection_id == inspection_id)
            .all()
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


def create_checklist_result(result_data: inspection_schemas.InspectionChecklistResultCreate, db: Session):
    try:
        new_result = inspection_models.InspectionChecklistResults(**result_data.model_dump())
        db.add(new_result)
        db.commit()
        db.refresh(new_result)
        return new_result
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key or duplicate data")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


def update_checklist_result(
    result_id: UUID,
    update_data: inspection_schemas.InspectionChecklistResultUpdate,
    db: Session,
):
    try:
        result = (
            db.query(inspection_models.InspectionChecklistResults)
            .filter(inspection_models.InspectionChecklistResults.id == result_id)
            .first()
        )
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Checklist result not found",
            )
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(result, field, value)
        db.commit()
        db.refresh(result)
        return result
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )

