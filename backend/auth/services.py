from sqlalchemy.orm import Session
from auth import schemas as auth_schemas
from app.admin import models as admin_models
from app.inspector import models as inspector_models
from app.user import models as user_models

def UserLogin(db: Session, userdata: auth_schemas.LoginData):
    # Check admin
    admin = db.query(admin_models.Admin).filter(
        admin_models.Admin.email == userdata.email,
        admin_models.Admin.password_hash == userdata.password
    ).first()
    if admin:
        return admin, "admin"
    
    # Check inspector
    inspector = db.query(inspector_models.Inspector).filter(
        inspector_models.Inspector.email == userdata.email,
        inspector_models.Inspector.password_hash == userdata.password
    ).first()
    if inspector:
        return inspector, "inspector"
    
    # Check user
    user = db.query(user_models.User).filter(
        user_models.User.email == userdata.email,
        user_models.User.password_hash == userdata.password
    ).first()
    if user:
        return user, "user"
    
    return None, None