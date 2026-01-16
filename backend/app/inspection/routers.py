from fastapi import APIRouter, Depends, HTTPException, status
from app.inspection import schemas as inspection_schemas
from app.inspection import services as inspection_services
from sqlalchemy.orm import Session
from middleware.db import get_db
from uuid import UUID

router = APIRouter(prefix="/inspection", tags=["inspection"])

# InspectionPackage Routes
@router.get("/packages", response_model=list[inspection_schemas.InspectionPackageResponse])
def get_all_packages(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_packages(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/packages/{package_id}", response_model=inspection_schemas.InspectionPackageResponse)
def get_package(package_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_package_by_id(package_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/packages", response_model=inspection_schemas.InspectionPackageResponse, status_code=status.HTTP_201_CREATED)
def create_package(package_data: inspection_schemas.InspectionPackageCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_package(package_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# InspectionSchedule Routes
@router.get("/schedules", response_model=list[inspection_schemas.InspectionScheduleResponse])
def get_all_schedules(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_schedules(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/schedules/{schedule_id}", response_model=inspection_schemas.InspectionScheduleResponse)
def get_schedule(schedule_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_schedule_by_id(schedule_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/schedules", response_model=inspection_schemas.InspectionScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(schedule_data: inspection_schemas.InspectionScheduleCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_schedule(schedule_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# JobTickets Routes
@router.get("/jobtickets", response_model=list[inspection_schemas.JobTicketResponse])
def get_all_jobtickets(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_jobtickets(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/jobtickets/{ticket_id}", response_model=inspection_schemas.JobTicketResponse)
def get_jobticket(ticket_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_jobticket_by_id(ticket_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/jobtickets", response_model=inspection_schemas.JobTicketResponse, status_code=status.HTTP_201_CREATED)
def create_jobticket(ticket_data: inspection_schemas.JobTicketCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_jobticket(ticket_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Inspection Routes
@router.get("/inspections", response_model=list[inspection_schemas.InspectionResponse])
def get_all_inspections(db: Session = Depends(get_db)):
    try:
        return inspection_services.get_all_inspection(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/inspections/{inspection_id}", response_model=inspection_schemas.InspectionResponse)
def get_inspection(inspection_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspection_services.get_inspection_by_id(inspection_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/inspections", response_model=inspection_schemas.InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(inspection_data: inspection_schemas.InspectionCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_inspection(inspection_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/inspections/{inspection_id}", response_model=inspection_schemas.InspectionResponse)
def update_inspection(inspection_id: UUID, inspection_data: inspection_schemas.InspectionUpdate, db: Session = Depends(get_db)):
    try:
        inspection = inspection_services.update_inspection(inspection_id, inspection_data, db)
        if not inspection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
        return inspection
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/inspections/{inspection_id}")
def delete_inspection(inspection_id: UUID, db: Session = Depends(get_db)):
    try:
        result = inspection_services.delete_inspection(inspection_id, db)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
        return {"message": "Inspection deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

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
def create_checklist_result(result_data: inspection_schemas.InspectionChecklistResultCreate, db: Session = Depends(get_db)):
    try:
        return inspection_services.create_checklist_result(result_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

