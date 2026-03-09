from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.admin import schemas as admin_schemas
from app.admin import services as admin_services
from auth.dependencies import CurrentUser, get_current_admin
from middleware.db import get_db


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/create", response_model=admin_schemas.AdminResponse)
def add_admin(
    payload: admin_schemas.AdminCreate,
    db: Session = Depends(get_db),
):
    try:
        return admin_services.create_admin(db, payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/get", response_model=list[admin_schemas.AdminResponse])
def get_admin(
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        return admin_services.get_all_admin(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put("/{admin_id}", response_model=admin_schemas.AdminResponse)
def update_admin(
    admin_id: str,
    admin_data: admin_schemas.AdminUpdate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    admin = admin_services.update_admin_services(
        admin_id=admin_id,
        admin_data=admin_data,
        db=db,
    )
    if not admin:
        raise HTTPException(status_code=404, detail="admin not found")
    return admin


@router.delete("/{admin_id}")
def delete_admin(
    admin_id: str,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    result = admin_services.delete_admin_services(
        admin_id=admin_id,
        db=db,
    )
    if not result:
        raise HTTPException(status_code=404, detail="admin not found")
    return {"message": "Admin deleted successfully"}
