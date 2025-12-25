from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid

class InspectionSchedule(Base):
    __tablename__ = "inspection_schedule"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    prop_id = Column(UUID(as_uuid=True))
    type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)

class Inspection(Base):
    __tablename__ = "inspection"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True))
    inspector_id = Column(UUID(as_uuid=True))
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    geo_verified = Column(Boolean, nullable=False, default=False)

class Checklist(Base):
    __tablename__ = "checklist"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True))
    area_name = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)
    remark = Column(Text, nullable=False)

class InspectionPackage(Base):
    __tablename__ = "inspection_package"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    package_name = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)



