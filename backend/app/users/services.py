from fastapi import FastAPI,HTTPException,status
from sqlalchemy.orm import Session
from app.user import schemas as user_schemas
from app.user import models as user_models



def create_user(db:Session,data:user_schemas.userCreate):
    try:
        new_user=user_models.user(
            name = data.name,
            email = data.email,
            password_hash = data.password_hash,
            phone = data.phone,
            country=data.country,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
def get_all_user(db:Session):
    try:
        return db.query(user_models.User).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

def update_user_services(user_id: str, user_data:user_schemas.UserUpdate, db:Session):
    user= db.query(user_models.User).filter(user_models.user.id == user_id).first()
    if not user:
        return None
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(user,field,value)

    db.commit()
    db.refresh(user)
    return user

def delete_user_services(user_id: str, db:Session):
    user= db.query(user_models.User).filter(user_models.user.id == user_id).first()
    if not user:
        return None
    
    db.delete(user)
    db.commit()
    return True

