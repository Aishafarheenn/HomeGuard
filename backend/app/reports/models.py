from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from middleware.db import Base
import uuid
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

class Evidence(Base):
    __tablename__ = "evidence_media"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"), index=True)
    checklist_item_id = Column(UUID(as_uuid=True), ForeignKey("checklist_items.id"), index=True)
    media_type = Column(String(150), nullable=False)
    media_url = Column(Text, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    inspection = relationship("Inspection", back_populates="evidence_media")
    checklist = relationship("Checklist", back_populates="evidence_media")

class RedFlag(Base):
    __tablename__ = "red_flags"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"), index=True)
    category = Column(String(50), nullable=False)
    severity = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)

    # relationships
    inspection = relationship("Inspection", back_populates="red_flags")

class InspectionReport(Base):
    __tablename__ = "inspection_reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"), index=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    report_url = Column(Text, nullable=True)
    report_notes = Column(Text, nullable=True)

    # relationships
    inspection = relationship("Inspection", back_populates="inspection_reports")