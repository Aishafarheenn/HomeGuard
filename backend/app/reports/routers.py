from fastapi import APIRouter
from sqlalchemy.orm import Session
from .services import create_Evidence,get_all_Evidence
from .schemas import EvidenceCreate,EvidenceResponse

from middleware.db import get_db

router = APIRouter(prifix="/Evidence",tags=["Evidence"])

@router.post("/",respons_model = EvidenceResponse)
def add_Evidence(payload:EvidenceCreate,db:Session=Depends(get_db)):
    return create_Evidence(db,payload)

@router.get("/Evidence",respons_model = list[EvidenceResponse]) 
def get_Evidence(db:Session=Depends(get_db)):
    return get_Evidence(db)   