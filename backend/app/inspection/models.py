from fastapi import FastAPI
from sqlalchemy import Column,Integer,String
from middleware.db import Base

class Inspection_schedule:
   _tablename="inspection_schedule"
   id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
   user_id=column(UUID(as_uuid=True)default=uuid.uuid4)
   prop_id=column(UUID(as_uuid=True)default=uuid.uuid4)
   type=column(string(50),nullable=false)
   date=column(date(timezone=True),server_default=func.now())
   status=column(string(20),nullable=false)

class Inspection:
    _tablename="inspection"
    id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
   schedule_id=column(UUID(as_uuid=True)default=uuid.uuid4)
   inspector_id=column(UUID(as_uuid=True)default=uuid.uuid4)
   start_time=column(date(timezone=True),server_default=func.now())
   end_time=column(date(timezone=True),server_default=func.now())
   geo_verified=column(boolean(),nullable=false)

class Checklist:
   _tablename="checklist"
   id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
   inspection_id=column(UUID(as_uuid=True)default=uuid.uuid4)
   area_name=column(string(100),nullable=false)
   status=column(string(20),nullable=false)
   remark=column(text,nullable=false)

class Inspection_package:
   _tablename="inspection_package"
    id=column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    package_name=column(string(50),nullable=false)
    description=column(text(),nullable=false)
    price=column(integer(),nullable=false)  
   



