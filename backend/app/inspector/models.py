from fastapi import FastAPI
from sqlalchemy import Column,Integer,String
from middleware.db import Base

class Inspector:
    _tablename="inspector"
    id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    name=column(string(100),nullable=false)
    email=column(string(150),unique=True,nullable=false)
    password_hash=Column(String,unique=True,nullable=False)
    phone=column(string(20))
    status=column(string(20),nullable=false)
    created_at=column(datetime(timezone=True),server_default=func.now())

