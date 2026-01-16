from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.inspector import schemas as inspector_schemas
from app.inspector import services as inspector_services
from middleware.db import get_db
from uuid import UUID

router = APIRouter(prefix="/inspectors", tags=["inspectors"])

@router.get("", response_model=list[inspector_schemas.InspectorResponse])
def get_all_inspectors(db: Session = Depends(get_db)):
    try:
        return inspector_services.get_all_inspectors(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{inspector_id}", response_model=inspector_schemas.InspectorResponse)
def get_inspector(inspector_id: UUID, db: Session = Depends(get_db)):
    try:
        return inspector_services.get_inspector_by_id(inspector_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("", response_model=inspector_schemas.InspectorResponse, status_code=status.HTTP_201_CREATED)
def create_inspector(inspector_data: inspector_schemas.InspectorCreate, db: Session = Depends(get_db)):
    try:
        return inspector_services.create_inspector(inspector_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{inspector_id}", response_model=inspector_schemas.InspectorResponse)
def update_inspector(inspector_id: UUID, inspector_data: inspector_schemas.InspectorUpdate, db: Session = Depends(get_db)):
    try:
        inspector = inspector_services.update_inspector(inspector_id, inspector_data, db)
        if not inspector:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found")
        return inspector
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{inspector_id}")
def delete_inspector(inspector_id: UUID, db: Session = Depends(get_db)):
    try:
        result = inspector_services.delete_inspector(inspector_id, db)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found")
        return {"message": "Inspector deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



