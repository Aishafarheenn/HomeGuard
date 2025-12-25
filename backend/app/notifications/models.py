from fastapi import FastAPI
from sqlalchemy import Column,Integer,String
from middleware.db import Base

class Notification:
    _tablename="notification"
    id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    user_id=column(UUID(as_uuid=True),default=uuid.uuid4)
    message=column(text(),nullable=false)
    password_hash=column(string(255),nullable=false)
    sent_at=column(datetime(timezone=True),server_default=func.now())
    status=column(string(20),nullable=false)
