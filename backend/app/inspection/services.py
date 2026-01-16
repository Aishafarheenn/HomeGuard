from fastapi import FastAPI,HTTPException,status
from sqlalchemy.orm import Session, selectinload
from app.inspection import models as inspection_models
from uuid import UUID


from app.inspection import schemas as inspection_schemas



def get_all_inspection(db:Session):
    try:
        inspections_data =db.query(inspection_models.Inspection)\
            .options(selectinload(inspection_models.Inspection.inspection_schedule),\
             selectinload(inspection_models.Inspection.inspector)).all()
        return inspections_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    

def inspection_by_id(inspection_id:UUID ,db:Session):
    try:
        inspections_data =db.query(inspection_models.Inspection)\
            .options(selectinload(inspection_models.Inspection.inspection_schedule),\
             selectinload(inspection_models.Inspection.inspector)).filter(inspection_models.Inspection.id==inspection_id).first()
        return inspections_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

def get_all_jobtickets(db:Session):
    try:
        check_data = db.query(inspection_models.JobTickets)\
        .options(selectinload(inspection_models.JobTickets.inspection_schedule)).all()
        return check_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
def jobtickets_by_id(job_ticket_id:UUID , db:Session):
    try:
        check_data = db.query(inspection_models.JobTickets)\
        .options(selectinload(inspection_models.JobTickets.inspection_schedule)).filter(inspection_models.JobTickets.id==job_ticket_id).first()
        return check_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

def update_inspection_services(inspection_id: str , inspection_data:inspection_schemas.InspectionUpdate, db:Session):
    inspection=db.query(inspection_models.Inspection).filter(inspection_models.Inspection.id == inspection_id).first()
    if not inspection:
        return None
    for field, value in inspection_data.dict(exclude_unset=True).items():
        setattr(inspection,field,value)
    
    db.commit()
    db.refresh(inspection)
    return inspection

def delete_inspection_services(inspection_id: str, db:Session):
    inspection= db.query(inspection_models.Inspection).filter(inspection_models.Inspection.id == inspection_id).first()
    if not inspection:
        return None
    
    db.delete(inspection)
    db.commit()
    return True

