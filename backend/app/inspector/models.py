from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid
from sqlalchemy.orm import relationship


class Inspector(Base):
    __tablename__ = "inspector"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(Text, nullable=True)  # nullable for backward compatibility; set via migration
    phone = Column(String(20))
    status = Column(String(20), nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("admins.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    admin = relationship("Admin", back_populates="inspectors")
    job_tickets = relationship("JobTickets", back_populates="inspector")



