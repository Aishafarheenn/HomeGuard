from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from middleware.db import Base




class Complaint(Base):
    __tablename__ = "Complaint"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    admin_response = Column(Text, nullable=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    responded_by = Column(UUID(as_uuid=True), ForeignKey("admins.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
