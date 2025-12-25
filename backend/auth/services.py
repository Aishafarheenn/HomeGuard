from fastapi import FastAPI
from sqlalchemy.orm import Session
from auth import schemas as auth_schemas
from app.admin import models as admin_models
from app.inspector import models as inspector_models
from app.user import models as user_models

def UserLogin(db:Session,userdata:auth_schemas.LoginData):
    admin=db.query(admin_models.admin).filter(admin_models.admin.email==userdata.email, admin_models.admin.password_hash==userdata.password).first()
    if admin:
        return admin
    inspector=db.query(inspector_models.Inspector).filter(inspector_models.Inspector.email==userdata.email, inspector_models.Inspector.password_hash==userdata.password).first()
    if inspector:
        return inspector
    user=db.query(user_models.User).filter(user_models.User.email==userdata.email,user_models.User.password_hash==userdata.password).first()
    if user:
        return user


    