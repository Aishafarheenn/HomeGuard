from sqlalchemy.orm import Session
from auth import schemas as auth_schemas
from app.admin import models as admin_models
from app.inspector import models as inspector_models
from app.users import models as user_models
from core.security import verify_password


def get_display_name(user):
    """Get display name from admin/inspector/owner (all use full_name)."""
    return getattr(user, "full_name", None) or getattr(user, "name", None) or ""


def UserLogin(db: Session, userdata: auth_schemas.LoginData):
    # Check admin
    admin = db.query(admin_models.Admin).filter(admin_models.Admin.email == userdata.email).first()
    if admin and verify_password(userdata.password, admin.password_hash):
        return admin, "admin"

    # Check inspector (only approved inspectors can login)
    inspector = db.query(inspector_models.Inspector).filter(
        inspector_models.Inspector.email == userdata.email
    ).first()
    if inspector and getattr(inspector, "password_hash", None) and verify_password(
        userdata.password, inspector.password_hash
    ):
        if getattr(inspector, "status", None) != "approved":
            return None, None, "pending_inspector"  # So router can return 403 with specific message
        return inspector, "inspector"

    # Check owner (User/Owner)
    user = db.query(user_models.Owner).filter(user_models.Owner.email == userdata.email).first()
    if user and verify_password(userdata.password, user.password_hash):
        return user, "owner"

    return None, None, None
