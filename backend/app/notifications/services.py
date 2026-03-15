from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.notifications import models as notifications_models
from app.notifications import schemas as notifications_schemas
from uuid import UUID

def create_notification(notification_data: notifications_schemas.NotificationCreate, db: Session):
    try:
        new_notification = notifications_models.Notification(**notification_data.model_dump())
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return new_notification
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_user_notifications(user_id: UUID, user_type: str, db: Session):
    try:
        return db.query(notifications_models.Notification).filter(
            notifications_models.Notification.user_id == user_id,
            notifications_models.Notification.user_type == user_type
        ).order_by(notifications_models.Notification.sent_at.desc()).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def get_unread_notifications(user_id: UUID, user_type: str, db: Session):
    try:
        return db.query(notifications_models.Notification).filter(
            notifications_models.Notification.user_id == user_id,
            notifications_models.Notification.user_type == user_type,
            notifications_models.Notification.is_read == False
        ).order_by(notifications_models.Notification.sent_at.desc()).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def mark_as_read(notification_id: UUID, user_id: UUID, db: Session):
    try:
        notification = db.query(notifications_models.Notification).filter(
            notifications_models.Notification.id == notification_id,
            notifications_models.Notification.user_id == user_id
        ).first()
        if not notification:
            return None
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def mark_all_as_read(user_id: UUID, user_type: str, db: Session):
    try:
        stmt = (
            update(notifications_models.Notification)
            .where(
                notifications_models.Notification.user_id == user_id,
                notifications_models.Notification.user_type == user_type,
                notifications_models.Notification.is_read.is_(False),
            )
            .values(is_read=True)
        )
        db.execute(stmt)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

def delete_notification(notification_id: UUID, user_id: UUID, db: Session):
    try:
        notification = db.query(notifications_models.Notification).filter(
            notifications_models.Notification.id == notification_id,
            notifications_models.Notification.user_id == user_id
        ).first()
        if not notification:
            return None
        db.delete(notification)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

# Helper function to create notification when job is assigned
def notify_inspector_assignment(inspector_id: UUID, job_ticket_id: UUID, property_address: str, db: Session):
    notification_data = notifications_schemas.NotificationCreate(
        user_id=inspector_id,
        user_type="inspector",
        message=f"New inspection job assigned for property: {property_address}",
    )
    create_notification(notification_data, db)
    try:
        from app.notifications.whatsapp import send_whatsapp
        from app.inspector import models as inspector_models
        inspector = db.query(inspector_models.Inspector).filter(inspector_models.Inspector.id == inspector_id).first()
        if inspector and inspector.phone:
            body = f"HomeGuard: New inspection job assigned for {property_address}. Log in to view details."
            send_whatsapp(inspector.phone, body)
    except Exception:
        pass

# Helper function to create notification for owner when inspector is assigned
def notify_owner_inspector_assigned(owner_id: UUID, property_address: str, inspector_name: str, db: Session):
    notification_data = notifications_schemas.NotificationCreate(
        user_id=owner_id,
        user_type="owner",
        message=f"Inspector {inspector_name} assigned for property: {property_address}"
    )
    return create_notification(notification_data, db)

# Helper function to create notification for owner when inspection is completed
def notify_owner_inspection_complete(
    owner_id: UUID,
    property_address: str,
    db: Session,
    report_url: str | None = None,
    base_url: str = "",
):
    notification_data = notifications_schemas.NotificationCreate(
        user_id=owner_id,
        user_type="owner",
        message=f"Inspection completed for property: {property_address}",
    )
    create_notification(notification_data, db)
    try:
        from app.notifications.whatsapp import send_report_ready
        from app.users import models as user_models
        owner = db.query(user_models.Owner).filter(user_models.Owner.id == owner_id).first()
        if owner and owner.phone and report_url:
            send_report_ready(owner.phone, property_address, report_url, base_url)
    except Exception:
        pass

