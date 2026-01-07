from fastapi import APIRouter, Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.reports import schemas as reports_schemas
from app.reports import services as reports_services

from middleware.db import get_db
router = APIRouter(prefix="/Evidence",tags=["Evidence"])

@router.post("/",response_model = reports_schemas.EvidenceResponse)
def add_Evidence(payload:reports_schemas.EvidenceCreate,db:Session=Depends(get_db)):
    try:
        return reports_services.create_Evidence(db,payload)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

@router.get("/Evidence",response_model = list[reports_schemas.EvidenceResponse]) 
def get_Evidence(db:Session=Depends(get_db)):
    try:
        return reports_services.get_all_Evidence(db)   
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    
@router.put("/{evidence_id}",response_model=reports_schemas.EvidenceUpdate)
def update_evidence(
    evidence_id:str,
    evidence_data:reports_schemas.EvidenceUpdate,
    db:Session=Depends(get_db)):

    evidence_id=reports_services.update_Evidence_services(
        evidence_id=evidence_id,
        evidence_data=evidence_data,
        db=db,
    )
    if not evidence_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="invalid id")
    return evidence_id

@router.delete("/{evidence_id}")
def delete_evidence(
    evidence_id:str,
    db:Session = Depends(get_db)
):
    result=reports_services.delete_Evidence_services(
        evidence_id=evidence_id,
        db=db
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="data not found")
    return{"message":"Evidence deleted successfully"}

@router.get("/Evidencecheck",response_model=list[reports_schemas.EvidenceResponse])
def evidence_checking(db:Session=Depends(get_db)):
    try:
        return reports_services.get_evidence_checking(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))