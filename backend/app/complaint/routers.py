from  fastapi import APIRouter, Depends, HTTPException, status
from app.complaint import schemas as complaint_schemas
from app.complaint import services as complaint_services
from sqlalchemy.orm import Session
from middleware.db import get_db


router = APIRouter(prefix="/complaint", tags=["complaint"])

@router.post("/complaint", response_model=complaint_schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(complaint_data: complaint_schemas.ComplaintCreate, db: Session = Depends(get_db)):
    try:
        return complaint_services.create_complaint(complaint_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/complaints", response_model=list[complaint_schemas.ComplaintResponse])
def get_all_complaints(db: Session = Depends(get_db)):
    try:
        return complaint_services.get_all_complaints(db)
    except Exception as e:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))    


