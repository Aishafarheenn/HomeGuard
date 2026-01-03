from fastapi import APIRouter ,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.notifications import schemas as notifications_schemas
from app.notifications import services as notifications_services
from middleware.db import get_db



router = APIRouter(prefix="notification", tags=["Notification"])

@router.post("/create",response_model=notifications_schemas.NotificationResponse)
def add_notification(payload:notifications_schemas.NotificationCreate, db:Session=Depends(get_db)):
    try:
        return notifications_services.create_notification(db,payload)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    

@router.get("/get",response_model= list[notifications_schemas.NotificationResponse])
def get_notification(db:Session=Depends(get_db)):
    try:
        return notifications_services.get_all_notification(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{notification_id}", response_model=notifications_schemas.NotificationUpdate)
def update_notification(
    notification_id:str, 
    notification_data:notifications_schemas.NotificationUpdate, 
    db:Session = Depends(get_db)):

    notification=notifications_services.update_notification_services(
        notification_id=notification_id,
        notification_data=notification_data,
        db=db
    )
    if not notification:
        raise HTTPException(status_code=404,detail="notification not found")
    return notification

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    db:Session = Depends(get_db)
):
    result = notifications_services.delete_notification_services(
        notification_id=notification_id,
        db=db
    )
    if not result:
        raise HTTPException(status_code=404, detail="notification not found")
        return {"message":"notification deleted successfully"}

    
