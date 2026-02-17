from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.notifications import schemas as notifications_schemas
from app.notifications import services as notifications_services
from auth.dependencies import CurrentUser, get_current_user
from middleware.db import get_db
from uuid import UUID

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/my-notifications", response_model=list[notifications_schemas.NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return notifications_services.get_user_notifications(
        current_user.user_id, current_user.role, db
    )


@router.get("/unread", response_model=list[notifications_schemas.NotificationResponse])
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return notifications_services.get_unread_notifications(
        current_user.user_id, current_user.role, db
    )


@router.put("/{notification_id}/read", response_model=notifications_schemas.NotificationResponse)
def mark_notification_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    notification = notifications_services.mark_as_read(
        notification_id, current_user.user_id, db
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification


@router.put("/mark-all-read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    notifications_services.mark_all_as_read(
        current_user.user_id, current_user.role, db
    )
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    result = notifications_services.delete_notification(
        notification_id, current_user.user_id, db
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Notification deleted successfully"}


# Admin endpoint to create notifications (consider protecting with admin-only dependency)
@router.post("", response_model=notifications_schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_data: notifications_schemas.NotificationCreate,
    db: Session = Depends(get_db),
):
    return notifications_services.create_notification(notification_data, db)

    
