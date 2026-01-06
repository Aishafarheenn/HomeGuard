from fastapi import APIRouter,Depends,HTTPException,status
from app.inspection import schemas as inspection_schemas
from app.inspection import services as inspection_services
from app.inspection import schemas as inspection_schedule_schemas
from app.inspection import services as inspection_schedule_services
from app.inspection import schemas as checklist_schemas
from app.inspection import services as checklist_services
from sqlalchemy.orm import Session
from middleware.db import get_db
from uuid import UUID

#/inspection/get/12sfdgfdgdd

router = APIRouter(prefix="/inspection",tags=["inspection"])

@router.get("/inspection_all",response_model=list[inspection_schemas.InspectionResponse])
def get_inspection(db:Session=Depends(get_db)):
    try:
        return inspection_services.get_all_inspection(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    
@router.get("/inspection_get/{inspection_id}",response_model=inspection_schemas.InspectionResponse)
def get_inspection_by_id(inspection_id:UUID,db:Session=Depends(get_db)):
    try:
        return inspection_services.inspection_by_id(inspection_id,db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

@router.get("/inspection_schedule_all",response_model=list[inspection_schedule_schemas.InspectionResponse])
def get_user(db:Session=Depends(get_db)):
    try:
        return inspection_schedule_services.get_all_user(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/inspection_schedule_get/{user_id}",response_model=list[inspection_schedule_schemas.InspectionResponse])
def get_user_by_id(user_id:UUID,db:Session=Depends(get_db)):
    try:
        return inspection_schedule_services.user_by_id(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.put("/{inspection_id}", response_model=inspection_schemas.InspectionUpdate)
def update_inspection(
    inspection_id:str, 
    inspection_data:inspection_schedule_schemas.InspectionUpdate, 
    db:Session = Depends(get_db)):

    inspection=inspection_services.update_inspection_services(
        inspection_id=inspection_id,
        inspection_data=inspection_data,
        db=db
    )
    if not inspection:
        raise HTTPException(status_code=404,detail="inspection not found")
    return inspection

@router.delete("/{inspection_id}")
def delete_inspection(
    inspection_id: str,
    db:Session = Depends(get_db)
):
    result = inspection_services.delete_inspection_services(
        inspection_id=inspection_id,
        db=db
    )
    if not result:
        raise HTTPException(status_code=404, detail="inspection not found")
    return {"message":"inspection deleted successfully"}

@router.get("/checking",response_model=list[inspection_schemas.InspectionResponse])
def checklist_check(db:Session=Depends(get_db)):
    try:
        return inspection_services.get_checklist_check(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

