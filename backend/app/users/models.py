from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid
from sqlalchemy.orm import relationship

class Owner(Base):
    __tablename__ = "owners"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20))
    country = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    properties = relationship("Property", back_populates="owner")
    inspection_schedules = relationship("InspectionSchedule", back_populates="owner")

