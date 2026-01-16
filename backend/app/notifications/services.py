from fastapi import FastAPI,HTTPException,status
from sqlalchemy.orm import Session
from app.notifications import models as notifications_models
from app.notifications import schemas as notifications_schemas



def create_notification(db:Session,data:notifications_schemas.NotificationCreate):
    try:
        new_notification=notifications_models.Notification(
            owner_id= data.owner_id,
            message= data.message,
            status= data.status,
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        
        return new_notification
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    
def get_all_notification(db:Session):
    try:
        return db.query(notifications_models.Notification).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))

def update_notification_services(notification_id: str, notification_data:notifications_schemas.NotificationUpdate, db:Session):
    notification= db.query(notifications_models.Notification).filter(notifications_models.Notification.id == notification_id).first()
    if not notification:
        return None
    for field, value in notification_data.dict(exclude_unset=True).items():
        setattr(notification,field,value)

    db.commit()
    db.refresh(notification)
    return notification

def delete_notification_services(notification_id: str, db:Session):
    notification = db.query(notifications_models.Notification).filter(notifications_models.Notification.id == notification_id).first()
    if not notification:
        return None
    
    db.delete(notification)
    db.commit()
    return True

