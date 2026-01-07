from fastapi import APIRouter,Depends,HTTPException,status
from auth import schemas as auth_schemas
from auth import services as auth_services
from middleware import utils as middleware_utils
from sqlalchemy.orm import Session
from middleware.db import get_db
from dotenv import load_dotenv 
import os
load_dotenv() 

router = APIRouter(prefix="/auth",tags=["auth"])

@router.post("/login")
def login(userdata:auth_schemas.LoginData,db:Session = Depends(get_db)):
    try:
        print(f"iam line no16")
        user,role=auth_services.UserLogin(db,userdata)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="user not found"
            )
        data={"id":str(user.id),"username":user.name,"role":role,"exp":os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")}
        access_token=middleware_utils.create_access_token(data) 
        return {"access_token":access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"************************login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e)
        )