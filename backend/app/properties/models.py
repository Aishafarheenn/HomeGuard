from sqlalchemy import Column, Text, DateTime, Float, ForeignKey
from middleware.db import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class Property(Base):
    __tablename__ = "properties"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), index=True)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    owner = relationship("Owner", back_populates="properties")
    inspection_schedules = relationship("InspectionSchedule", back_populates="property") 