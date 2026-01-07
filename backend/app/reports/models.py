from sqlalchemy import Column, Integer, String, DateTime,ForeignKey
from middleware.db import Base
import uuid
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspection.id"),index=True)
    media_type = Column(String(150), nullable=False)
    media_url = Column(String, nullable=False)
    notes = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    #relationship
    inspection=relationship("Inspection",back_populates="evidence",foreign_keys=[inspection_id])
