from fastapi import FastAPI
from sqlalchemy.orm import Session
from .models import Evidence
from .schemas import EvidenceCreate,EvidenceResponse

def create_Evidence(db:Session,data:EvidenceCreate):
    new_Evidence = Evidence(
       inspection_id = data.inspection_id,
       media_type = data.media_type,
       media_url = data.media_url,
       notes = data.notes,
    )
    db.add(new_Evidence)
    db.commit()
    db.refresh(new_Evidence)
    return new_Evidence

   def get_all_Evidence(db:Session):
    return db.query(Evidence).all() 
