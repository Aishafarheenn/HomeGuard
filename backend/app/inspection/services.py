from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.inspection import models as inspection_models
from app.inspection import schemas as inspection_schemas
from uuid import UUID

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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

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
def get_all_jobtickets(db: Session):
    try:
        return db.query(inspection_models.JobTickets).options(selectinload(inspection_models.JobTickets.inspectionSchedule)).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_jobticket_by_id(job_ticket_id: UUID, db: Session):
    try:
        ticket = db.query(inspection_models.JobTickets).options(selectinload(inspection_models.JobTickets.inspectionSchedule)).filter(inspection_models.JobTickets.id == job_ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job ticket not found")
        return ticket
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_jobticket(ticket_data: inspection_schemas.JobTicketCreate, db: Session):
    try:
        new_ticket = inspection_models.JobTickets(**ticket_data.model_dump())
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
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
        return db.query(inspection_models.Inspection).options(selectinload(inspection_models.Inspection.jobTickets)).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_inspection_by_id(inspection_id: UUID, db: Session):
    try:
        inspection = db.query(inspection_models.Inspection).options(selectinload(inspection_models.Inspection.jobTickets)).filter(inspection_models.Inspection.id == inspection_id).first()
        if not inspection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
        return inspection
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def create_inspection(inspection_data: inspection_schemas.InspectionCreate, db: Session):
    try:
        new_inspection = inspection_models.Inspection(**inspection_data.model_dump())
        db.add(new_inspection)
        db.commit()
        db.refresh(new_inspection)
        return new_inspection
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
        for field, value in inspection_data.model_dump(exclude_unset=True).items():
            setattr(inspection, field, value)
        db.commit()
        db.refresh(inspection)
        return inspection
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

