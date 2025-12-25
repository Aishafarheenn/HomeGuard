from fastapi import FastAPI
from sqlalchemy import Column,Integer,String
from middleware.db import Base

class admin(Base):
    _tablename="admin"
    id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    name=column(string(100),nullable=false)
    email=column(string(150),unique=True,nullable=false)
    password_hash=column(string(255),nullable=false)
    phone=column(string(20))
    created_at=column(datetime(timezone=True),server_default=func.now())

class audit:
    _tablename="audit_log"
    id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    id=column(UUID(as_uuid=True),foreign_key=True,default=uuid.uuid4)
    action=column(string(255),nullable=false)
    timestamp=column(datetime(timezone=True),server_default=func.name())   