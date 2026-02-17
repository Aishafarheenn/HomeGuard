# Notification System Implementation

## Model Changes
- `user_id`: UUID - Can be owner_id or inspector_id
- `user_type`: String - 'owner' or 'inspector'
- `is_read`: Boolean - Track read status
- Removed foreign key constraint to support multiple user types

## API Endpoints

### GET /notifications/my-notifications
Get all notifications for current user (from token)

### GET /notifications/unread
Get unread notifications for current user (from token)

### PUT /notifications/{notification_id}/read
Mark specific notification as read

### PUT /notifications/mark-all-read
Mark all notifications as read for current user

### DELETE /notifications/{notification_id}
Delete notification (only own notifications)

### POST /notifications
Create notification (admin use)

## Usage in Job Assignment

When assigning job to inspector in JobTickets service:
```python
from app.notifications import services as notification_services

# After creating job ticket
notification_services.notify_inspector_assignment(
    inspector_id=job_ticket.inspector_id,
    job_ticket_id=job_ticket.id,
    property_address=property.address,
    db=db
)
```

When inspection is completed:
```python
notification_services.notify_owner_inspection_complete(
    owner_id=schedule.owner_id,
    property_address=property.address,
    db=db
)
```

## TODO
Implement get_current_user_id() and get_current_user_type() from JWT token in routers.py
