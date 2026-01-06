from fastapi import FastAPI,HTTPException,status
from sqlalchemy.orm import Session
from app.inspector import models as inspector_models
from app.inspector import schemas as inspector_schemas



def create_inspector(db:Session,data:inspector_schemas.InspectorCreate):
    try:
        new_inspector=inspector_models.Inspector(
            name= data.name,
            email= data.email,
            password_hash= data.password_hash,
            phone= data.phone,
        )
        db.add(new_inspector)
        db.commit()
        db.refresh(new_inspector)

        return new_inspector
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
def get_all_inspector(db:Session):
    try:
        return db.query(inspector_models.Inspector).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

def update_inspector_services(inspector_id: str,inspector_data:inspector_schemas.InspectorUpdate, db:Session):
    inspector= db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == inspector_id).first()
    if not inspector:
        return None
    for field, value in inspector_data.dict(exclude_unset=True).items():
        setattr(inspector,field,value)

        db.commit()
        db.refresh(inspector)
        return inspector

def delete_inspector_services(inspector_id: str, db:Session):
    inspector= db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == inspector_id).first()
    if not inspector:
        return None
    
    db.delete(inspector)
    db.commit()
    return True

def get_inactive_inspector(db:Session):
    try:
        inspector_data=db.query(inspector_models.Inspector).filter(inspector_models.Inspector.status == False).all()
        return inspector_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))