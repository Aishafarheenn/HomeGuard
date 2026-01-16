from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, Text,ForeignKey,Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid
from sqlalchemy.orm import relationship

class InspectionSchedule(Base):
    __tablename__ = "inspection_schedules"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True),ForeignKey("owners.id"),index=True)
    property_id = Column(UUID(as_uuid=True),ForeignKey("properties.id"),index=True)
    package_id = Column(UUID(as_uuid=True),ForeignKey("inspection_packages.id"),index=True)
    scheduled_date = Column(Date, nullable=False)
    frequency = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    created_at =  Column(DateTime(timezone=True), server_default=func.now())

    # relationship
    owner=relationship("User",back_populates="inspection_schedule", Foreign_keys=[owner_id])
    property=relationship("Property",back_populates="inspection_schedule", Foreign_keys=[property_id])
    inspectionPackage=relationship("InspectionPackage",back_populates="inspection_schedule", Foreign_keys=[package_id])
    

class JobTickets(Base):
    __tablename__ = "job_tickets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True),ForeignKey("inspection_schedules.id"),index=True)
    status = Column(String(20), nullable=False)
    assigned_at =  Column(DateTime(timezone=True), server_default=func.now())

    #relationship
    inspectionSchedule=relationship("InspectionSchedule",back_populates="job_tickets", Foreign_keys=[schedule_id])



class Inspection(Base):
    __tablename__ = "inspections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_ticket_id = Column(UUID(as_uuid=True), ForeignKey("job_tickets.id"),index=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    overall_status = Column(String(20), nullable=False)


    # relationship
    jobTickets = relationship("JobTickets",back_populates="inspections", Foreign_keys=[job_ticket_id])


class GeoVerification(Base):
    __tablename__ = "geo_verification_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"),index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    distance_from_property = Column(Float, nullable=True) 
    verified = Column(Boolean, nullable=False)
    verified_at =  Column(DateTime(timezone=True), server_default=func.now())

    
    # relationship
    inspection= relationship("Inspection",back_populates="geo_verification_logs",Foreign_keys=[inspection_id] )


class Checklist(Base):
    __tablename__ = "checklist_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    package_id = Column(UUID(as_uuid=True),ForeignKey("inspection_packages.id"),index=True)
    area_name = Column(String(100), nullable=False)
    
    # relationship
    inspectionPackage=relationship("InspectionPackage",back_populates="checklist_items", Foreign_keys=[package_id])

class InspectionChecklistResults(Base):
    __tablename__ = "inspection_checklist_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"),index=True)
    checklist_item_id = Column(UUID(as_uuid=True), ForeignKey("checklist_items.id"),index=True)
    status = Column(String(20), nullable=False)
    remark = Column(Text, nullable=False)

    # relationship
    inspection=relationship("Inspection",back_populates="inspection_checklist_results", Foreign_keys=[inspection_id])
    checklist=relationship("Checklist",back_populates="inspection_checklist_results", Foreign_keys=[checklist_item_id])



class InspectionPackage(Base):
    __tablename__ = "inspection_packages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)

class InspectionReports(Base):
    __tablename__ ="inspection_reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"),index=True) 
    genarated_at = Column(DateTime(timezone=True), server_default=func.now())
    report_url = Column(Text, nullable=False)

    # relationship
    inspection=relationship("Inspection",back_populates="inspection_reports", Foreign_keys=[inspection_id])

    
    



