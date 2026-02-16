from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.users import schemas as user_schemas
from app.users import services as user_services
from middleware.db import get_db
from uuid import UUID

router = APIRouter(prefix="/owners", tags=["owners"])

@router.get("", response_model=list[user_schemas.OwnerResponse])
def get_all_owners(db: Session = Depends(get_db)):
    try:
        return user_services.get_all_owners(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{owner_id}", response_model=user_schemas.OwnerResponse)
def get_owner(owner_id: UUID, db: Session = Depends(get_db)):
    try:
        return user_services.get_owner_by_id(owner_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/create", response_model=user_schemas.OwnerResponse, status_code=status.HTTP_201_CREATED)
def create_owner(owner_data: user_schemas.OwnerCreate, db: Session = Depends(get_db)):
    try:
        return user_services.create_owner(owner_data, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{owner_id}", response_model=user_schemas.OwnerResponse)
def update_owner(owner_id: UUID, owner_data: user_schemas.OwnerUpdate, db: Session = Depends(get_db)):
    try:
        owner = user_services.update_owner(owner_id, owner_data, db)
        if not owner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")
        return owner
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{owner_id}")
def delete_owner(owner_id: UUID, db: Session = Depends(get_db)):
    try:
        result = user_services.delete_owner(owner_id, db)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")
        return {"message": "Owner deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    