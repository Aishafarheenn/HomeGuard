from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid
from sqlalchemy.orm import relationship

class Admin(Base):
    __tablename__ = "admins"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    phone = Column(String(10), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    inspectors = relationship("Inspector", back_populates="admin")

