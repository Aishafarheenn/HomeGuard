from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.admin import models as admin_models
from app.admin import schemas as admin_schemas
from core.security import hash_password


def create_admin(db: Session, data: admin_schemas.AdminCreate):
    existing_admin = db.query(admin_models.Admin).filter(
        (admin_models.Admin.email == data.email) | (admin_models.Admin.phone == data.phone)
    ).first()

    if existing_admin:
        if existing_admin.email == data.email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        if existing_admin.phone == data.phone:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone already registered")

    new_Admin = admin_models.Admin(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
    )
    db.add(new_Admin)
    db.commit()
    db.refresh(new_Admin)
    
    return new_Admin
def get_all_admin(db:Session):
    try:
        return db.query(admin_models.Admin).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

def update_admin_services(admin_id: str, admin_data:admin_schemas.AdminUpdate, db:Session):
    admin= db.query(admin_models.Admin).filter(admin_models.Admin.id == admin_id).first()
    if not admin:
        return None
    for field, value in admin_data.model_dump(exclude_unset=True).items():
        setattr(admin,field,value)

    db.commit()
    db.refresh(admin)
    return admin

def delete_admin_services(admin_id: str, db:Session):
    admin= db.query(admin_models.Admin).filter(admin_models.Admin.id == admin_id).first()
    if not admin:
        return None
    
    db.delete(admin)
    db.commit()
    return True

