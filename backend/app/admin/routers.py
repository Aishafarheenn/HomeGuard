from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.admin import schemas as admin_schemas
from app.admin import services as admin_services
from middleware.db import get_db



router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/create",response_model=admin_schemas.AdminResponse)
def add_admin(payload:admin_schemas.AdminCreate, db:Session=Depends(get_db)):
    try:
        return admin_services.create_admin(db,payload)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    

@router.get("/get",response_model= list[admin_schemas.AdminResponse])
def get_admin(db:Session=Depends(get_db)):
    try:
        return admin_services.get_all_admin(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


    