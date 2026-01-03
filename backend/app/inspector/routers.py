from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.inspector import schemas as inspector_schemas
from app.inspection import services as inspector_services
from middleware.db import get_db


router = APIRouter(prefix="/inspector", tags=["Inspector"])

@router.post("/create", response_model=inspector_schemas.InspectorResponse)
def add_inspector(payload:inspector_schemas.InspectorCreate, db:Session=Depends(get_db)):
    try:
        return inspector_services.create_inspector(db,payload)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

@router.get("/get",response_model= list[inspector_schemas.InspectorCreate])
def get_inspector(db:Session =Depends(get_db)):
    try:
        return inspector_services.get_all_inspector(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{inspector_id}", response_model=inspector_schemas.InspectorUpdate)
def update_inspector(
    inspector_id:str, 
    inspector_data:inspector_schemas.InspectorUpdate, 
    db:Session = Depends(get_db)):

    inspector=inspector_services.update_inspector_services(
        inspector_id=inspector_id,
        inspector_data=inspector_data,
        db=db
    )
    if not inspector:
        raise HTTPException(status_code=404,detail="inspector not found")
    return inspector

@router.delete("/{inspector_id}")
def delete_inspector(
    inspector_id: str,
    db:Session = Depends(get_db)
):
    result = inspector_services.delete_inspector_services(
        inspector_id=inspector_id,
        db=db
    )
    if not result:
        raise HTTPException(status_code=404, detail="inspector not found")
        return {"message":"inspector deleted successfully"}



