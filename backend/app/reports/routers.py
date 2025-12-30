from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .services import create_Evidence,get_all_Evidence
from .schemas import EvidenceCreate,EvidenceResponse

from middleware.db import get_db

router = APIRouter(prefix="/Evidence",tags=["Evidence"])

@router.post("/",response_model = EvidenceResponse)
def add_Evidence(payload:EvidenceCreate,db:Session=Depends(get_db)):
    return create_Evidence(db,payload)

@router.get("/Evidence",response_model = list[EvidenceResponse]) 
def get_Evidence(db:Session=Depends(get_db)):
    return get_all_Evidence(db)   