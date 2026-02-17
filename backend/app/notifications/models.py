from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from middleware.db import Base
import uuid
from sqlalchemy.orm import relationship


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # owner or inspector id
    user_type = Column(String(20), nullable=False)  # 'owner' or 'inspector'
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False, nullable=False)
    # Legacy: keep for backward compatibility; can be removed after migration
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), index=True, nullable=True)
    status = Column(String(20), nullable=True)

    # relationships
    owner = relationship("Owner", back_populates="notifications", foreign_keys=[owner_id])
