from fastapi import FastAPI,HTTPException,status
from sqlalchemy.orm import Session, selectinload
from app.inspection import models as inspection_models
from uuid import UUID
from app.inspection import models as inspection_schedule_models
from app.inspection import models as checklist_models


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

def get_all_user(db:Session):
    try:
        user_data = db.query(inspection_schedule_models.InspectionSchedule)\
            .options(selectinload(inspection_schedule_models.InspectionSchedule.users),\
             selectinload(inspection_schedule_models.InspectionSchedule.properties),\
             selectinload(inspection_schedule_models.InspectionSchedule.checklist)).all()
        return user_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
def user_by_id(user_id:UUID , db:Session):
    try:
        user_data= db.query(inspection_schedule_models.InspectionSchedule)\
            .options(selectinload(inspection_schedule_models.InspectionSchedule.users),\
             selectinload(inspection_schedule_models.InspectionSchedule.properties),\
             selectinload(inspection_schedule_models.InspectionSchedule.checklist)).filter(inspection_schedule_models.Inspection.id==user_id).first()
        return user_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
def get_all_checklist(db:Session):
    try:
        check_data = db.query(checklist_models.Checklist)\
        .options(selectinload(checklist_models.Checklist.inspection_schedule)).all()
        return check_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
def checklist_by_id(inspection_id:UUID , db:Session):
    try:
        check_data = db.query(checklist_models.Checklist)\
        .options(selectinload(checklist_models.Checklist.inspection_schedule)).filter(checklist_models.Checklist.id==inspection_id).first()
        return check_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    