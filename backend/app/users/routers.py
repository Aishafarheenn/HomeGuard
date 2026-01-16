from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.user import schemas as user_schemas
from app.user import services as user_services
from middleware.db import get_db



router = APIRouter(prefix="/user", tags=["user"])

@router.post("/create",response_model=user_schemas.UserResponse)
def add_user(payload:user_schemas.UserCreate, db:Session=Depends(get_db)):
    try:
        return user_services.create_user(db,payload)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    

@router.get("/get",response_model= list[user_schemas.userResponse])
def get_user(db:Session=Depends(get_db)):
    try:
        return user_services.get_all_user(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{user_id}", response_model=user_schemas.userUpdate)
def update_user(
    user_id:str, 
    user_data:user_schemas.UserUpdate, 
    db:Session = Depends(get_db)):

    user=user_services.update_user_services(
        user_id=user_id,
        user_data=user_data,
        db=db
    )
    if not user:
        raise HTTPException(status_code=404,detail="user not found")
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db:Session = Depends(get_db)
):
    result = user_services.delete_user_services(
        user_id=user_id,
        db=db
    )
    if not result:
        raise HTTPException(status_code=404, detail="user not found")
        return {"message":"user deleted successfully"}

    