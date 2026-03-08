from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.inspection import schemas as inspection_schemas
from app.inspection import services as inspection_services
from auth.dependencies import CurrentUser, get_current_admin, get_current_user
from middleware.db import get_db

router = APIRouter(prefix="/inspection", tags=["inspection"])

# InspectionPackage Routes
@router.get("/packages", response_model=list[inspection_schemas.InspectionPackageResponse])
def get_all_packages(db: Session = Depends(get_db)):
    """Packages are readable by all authenticated roles."""
    try:
        return inspection_services.get_all_packages(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.get("/packages/{package_id}", response_model=inspection_schemas.InspectionPackageResponse)
def get_package(package_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_package_by_id(package_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/packages/{package_id}/checklist-items",
    response_model=list[inspection_schemas.ChecklistResponse],
)
def get_checklist_items_by_package(
    package_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Checklist items (areas) for a package. Authenticated users only."""
    try:
        return inspection_services.get_checklist_items_by_package(package_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post(
    "/packages",
    response_model=inspection_schemas.InspectionPackageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_package(
    package_data: inspection_schemas.InspectionPackageCreate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: create inspection packages."""
    try:
        return inspection_services.create_package(package_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# InspectionSchedule Routes
@router.get("/schedules", response_model=list[inspection_schemas.InspectionScheduleResponse])
def get_all_schedules(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Admin: all schedules.
    Owner: only own schedules.
    Other roles: all for now.
    """
    try:
        if current_user.role == "owner":
            return inspection_services.get_schedules_for_owner(current_user.user_id, db)
        return inspection_services.get_all_schedules(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.get(
    "/my-jobs",
    response_model=list[inspection_schemas.OwnerJobItem],
)
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Owner only: list own schedules with job ticket and inspection status."""
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can view their jobs",
        )
    try:
        return inspection_services.get_owner_jobs(current_user.user_id, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/owner/job-report",
    response_model=inspection_schemas.OwnerJobReportResponse,
)
def get_owner_job_report(
    schedule_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Owner only: inspection report (checklist + notes) for one of their jobs."""
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can view job reports",
        )
    try:
        return inspection_services.get_owner_job_report(
            schedule_id, current_user.user_id, db
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/schedules/{schedule_id}", response_model=inspection_schemas.InspectionScheduleResponse)
def get_schedule(
    schedule_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        schedule = inspection_services.get_schedule_by_id(schedule_id, db)
        if current_user.role == "owner" and schedule.owner_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this schedule",
            )
        return schedule
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post(
    "/schedules",
    response_model=inspection_schemas.InspectionScheduleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_schedule(
    schedule_data: inspection_schemas.InspectionScheduleCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Admin: can create schedules for any owner.
    Owner: can only create schedules for themselves (owner_id is forced).
    """
    try:
        if current_user.role == "owner":
            schedule_data.owner_id = current_user.user_id
        return inspection_services.create_schedule(schedule_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# JobTickets Routes
@router.get("/jobtickets", response_model=list[inspection_schemas.JobTicketResponseWithRelations])
def get_all_jobtickets(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Admin: all job tickets.
    Inspector: only their assigned tickets.
    Others: forbidden.
    """
    try:
        if current_user.role == "admin":
            return inspection_services.get_all_jobtickets(db)
        if current_user.role == "inspector":
            return inspection_services.get_jobtickets_for_inspector(
                current_user.user_id, db
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view job tickets",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.get("/jobtickets/{ticket_id}", response_model=inspection_schemas.JobTicketResponseWithRelations)
def get_jobticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin: any ticket. Inspector: only their assigned ticket."""
    try:
        ticket = inspection_services.get_jobticket_by_id(ticket_id, db)
        if current_user.role == "inspector" and ticket.inspector_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this job ticket",
            )
        return ticket
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post(
    "/jobtickets",
    response_model=inspection_schemas.JobTicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_jobticket(
    ticket_data: inspection_schemas.JobTicketCreate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: create job tickets and assign inspectors."""
    try:
        return inspection_services.create_jobticket(ticket_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# Inspection Routes
@router.get("/inspections", response_model=list[inspection_schemas.InspectionResponse])
def get_all_inspections(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Admin: all inspections.
    Inspector: inspections for their job tickets.
    Owner: inspections for their schedules.
    """
    try:
        inspections = inspection_services.get_all_inspection(db)
        if current_user.role == "admin":
            return inspections

        filtered: list[inspection_schemas.InspectionResponse] = []
        for ins in inspections:
            jt = ins.job_ticket
            if not jt or not jt.schedule:
                continue
            if current_user.role == "inspector" and jt.inspector_id == current_user.user_id:
                filtered.append(ins)
            elif (
                current_user.role == "owner"
                and jt.schedule.owner_id == current_user.user_id
            ):
                filtered.append(ins)
        return filtered
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.get("/inspections/{inspection_id}", response_model=inspection_schemas.InspectionResponse)
def get_inspection(inspection_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_inspection_by_id(inspection_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def _inspector_can_access_inspection(inspection, current_user: CurrentUser) -> bool:
    """Admin can access any; inspector only their own."""
    if current_user.role == "admin":
        return True
    if current_user.role != "inspector":
        return False
    return (
        inspection
        and inspection.job_ticket
        and inspection.job_ticket.inspector_id == current_user.user_id
    )


@router.get(
    "/inspections/{inspection_id}/checklist-results",
    response_model=list[inspection_schemas.InspectionChecklistResultWithItemResponse],
)
def get_inspection_checklist_results(
    inspection_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Inspector: only their inspection. Admin: any."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view checklist results",
        )
    inspection = inspection_services.get_inspection_by_id(inspection_id, db)
    if not _inspector_can_access_inspection(inspection, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to access this inspection",
        )
    results = inspection_services.get_checklist_results_by_inspection_id(inspection_id, db)
    return [
        inspection_schemas.InspectionChecklistResultWithItemResponse(
            id=r.id,
            inspection_id=r.inspection_id,
            checklist_item_id=r.checklist_item_id,
            status=r.status,
            remark=r.remark,
            checklist_item=(
                inspection_schemas.ChecklistItemSummary(
                    id=r.checklist.id, area_name=r.checklist.area_name
                )
                if r.checklist
                else None
            ),
        )
        for r in results
    ]


@router.post(
    "/inspections",
    response_model=inspection_schemas.InspectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inspection(
    inspection_data: inspection_schemas.InspectionCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Admin/Inspector: create inspections.
    Owner is not allowed to create inspections directly.
    """
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create inspections",
        )
    try:
        return inspection_services.create_inspection(inspection_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.put("/inspections/{inspection_id}", response_model=inspection_schemas.InspectionResponse)
def update_inspection(
    inspection_id: UUID,
    inspection_data: inspection_schemas.InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin/Inspector: update inspection details."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update inspections",
        )
    try:
        inspection = inspection_services.update_inspection(
            inspection_id, inspection_data, db
        )
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found"
            )
        return inspection
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.delete("/inspections/{inspection_id}")
def delete_inspection(
    inspection_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: delete inspections."""
    try:
        result = inspection_services.delete_inspection(inspection_id, db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found"
            )
        return {"message": "Inspection deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# GeoVerification Routes
@router.get("/geo-verifications", response_model=list[inspection_schemas.GeoVerificationResponse])
def get_all_geo_verifications(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_geo_verifications(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/geo-verifications/{geo_id}", response_model=inspection_schemas.GeoVerificationResponse)
def get_geo_verification(geo_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_geo_verification_by_id(geo_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/geo-verifications", response_model=inspection_schemas.GeoVerificationResponse, status_code=status.HTTP_201_CREATED)
def create_geo_verification(geo_data: inspection_schemas.GeoVerificationCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_geo_verification(geo_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Checklist Routes
@router.get("/checklists", response_model=list[inspection_schemas.ChecklistResponse])
def get_all_checklists(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_checklists(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/checklists/{checklist_id}", response_model=inspection_schemas.ChecklistResponse)
def get_checklist(checklist_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_checklist_by_id(checklist_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/checklists", response_model=inspection_schemas.ChecklistResponse, status_code=status.HTTP_201_CREATED)
def create_checklist(checklist_data: inspection_schemas.ChecklistCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_checklist(checklist_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# InspectionChecklistResults Routes
@router.get("/checklist-results", response_model=list[inspection_schemas.InspectionChecklistResultResponse])
def get_all_checklist_results(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_checklist_results(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/checklist-results/{result_id}", response_model=inspection_schemas.InspectionChecklistResultResponse)
def get_checklist_result(result_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_checklist_result_by_id(result_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/checklist-results", response_model=inspection_schemas.InspectionChecklistResultResponse, status_code=status.HTTP_201_CREATED)
def create_checklist_result(
    result_data: inspection_schemas.InspectionChecklistResultCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin/Inspector: create checklist result for an inspection they can access."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create checklist results",
        )
    try:
        return inspection_services.create_checklist_result(result_data, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put(
    "/checklist-results/{result_id}",
    response_model=inspection_schemas.InspectionChecklistResultResponse,
)
def update_checklist_result(
    result_id: UUID,
    result_data: inspection_schemas.InspectionChecklistResultUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin/Inspector: update checklist result; inspector only for their inspection."""
    if current_user.role not in {"admin", "inspector"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update checklist results",
        )
    existing = inspection_services.get_checklist_result_by_id(result_id, db)
    inspection = (
        inspection_services.get_inspection_by_id(existing.inspection_id, db)
        if existing
        else None
    )
    if not _inspector_can_access_inspection(inspection, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this checklist result",
        )
    try:
        return inspection_services.update_checklist_result(result_id, result_data, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

