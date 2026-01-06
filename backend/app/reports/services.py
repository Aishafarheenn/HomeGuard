from fastapi import FastAPI,HTTPException,status
from sqlalchemy.orm import Session
from app.reports import schemas as reports_schemas
from app.reports import models as reports_models

def create_Evidence(db:Session,data:reports_schemas.EvidenceCreate):
    try:

        new_Evidence = reports_models.Evidence(
        inspection_id = data.inspection_id,
        media_type = data.media_type,
        media_url = data.media_url,
        notes = data.notes,
        )
        db.add(new_Evidence)
        db.commit()
        db.refresh(new_Evidence)
        return new_Evidence
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

def get_all_Evidence(db:Session):
    try:
     return db.query(reports_models.Evidence).all() 
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

def update_Evidence_services(Evidence_id: str, Evidence_data:reports_schemas.EvidenceUpdate, db:Session):
    Evidence= db.query(reports_models.Evidence).filter(reports_models.Evidence.id == Evidence_id).first()
    if not Evidence:
        return None
    for field, value in Evidence_data.dict(exclude_unset=True).items():
        setattr(Evidence,field,value)

    db.commit()
    db.refresh(Evidence)
    return Evidence

def delete_Evidence_services(Evidence_id: str, db:Session):
    Evidence= db.query(reports_models.Evidence).filter(reports_models.Evidence.id == Evidence_id).first()
    if not Evidence:
        return None
    
    db.delete(Evidence)
    db.commit()
    return True


