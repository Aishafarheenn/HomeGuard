from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from middleware.db import Base
import uuid


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InspectionReview(Base):
    """Owner rating + comment after inspection completes; admin can reply."""

    __tablename__ = "inspection_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id"), unique=True, nullable=False, index=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), nullable=False, index=True)
    inspector_id = Column(UUID(as_uuid=True), ForeignKey("inspector.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    admin_reply = Column(Text, nullable=True)
    admin_reply_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())