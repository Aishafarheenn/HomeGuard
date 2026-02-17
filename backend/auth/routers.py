from fastapi import APIRouter, Depends, HTTPException, status
from auth import schemas as auth_schemas
from auth import services as auth_services
from middleware import utils as middleware_utils
from sqlalchemy.orm import Session
from middleware.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(userdata: auth_schemas.LoginData, db: Session = Depends(get_db)):
    result = auth_services.UserLogin(db, userdata)
    user = result[0] if isinstance(result, (list, tuple)) else result
    role = result[1] if isinstance(result, (list, tuple)) and len(result) > 1 else None
    reason = result[2] if isinstance(result, (list, tuple)) and len(result) > 2 else None
    if not user:
        if reason == "pending_inspector":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your inspector account is pending admin approval. You can sign in after an admin approves you.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    data = {
        "sub": str(user.id),
        "username": auth_services.get_display_name(user),
        "role": role,
    }
    access_token = middleware_utils.create_access_token(data)
    return {"access_token": access_token, "token_type": "bearer"}