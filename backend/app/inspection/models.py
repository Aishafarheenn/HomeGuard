from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, Text,ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid
from sqlalchemy.orm import relationships

class InspectionSchedule(Base):
    __tablename__ = "inspection_schedule"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True),ForeignKey("user.id"),index=True)
    property_id = Column(UUID(as_uuid=True),ForeignKey("property.id"),index=True)
    type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)

    # relationships
    inspection=relationships("Inspection", back_populates="inspection_schedule")
    users=relationships("User",back_populates="inspection_schedule")
    properties=relationships("Property",back_populates="inspection_schedule")
    

class Inspection(Base):
    __tablename__ = "inspection"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("inspection_schedule.id"),index=True)
    inspector_id = Column(UUID(as_uuid=True), ForeignKey("inspector.id"),index=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    geo_verified = Column(Boolean, nullable=False, default=False)

    # relationships
    inspection_schedule = relationships("InspectionSchedule",back_populates="inspection")
    inspector=relationships("Inspector",back_populates="inspection")
    checklist=relationships("Checklist",back_populates="inspection")

class Checklist(Base):
    __tablename__ = "checklist"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True),ForeignKey("inspection.id"),index=True)
    area_name = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)
    remark = Column(Text, nullable=False)

    # relationships
    inspection=relationships("Inspection",back_populates="checklist")

class InspectionPackage(Base):
    __tablename__ = "inspection_package"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    package_name = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)



