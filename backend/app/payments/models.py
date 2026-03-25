from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from middleware.db import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Manual payments are tied to an inspection schedule.
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("inspection_schedules.id"), index=True, nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), index=True, nullable=False)

    amount = Column(Integer, nullable=False)
    currency = Column(String(10), nullable=False, server_default="INR")
    method = Column(String(30), nullable=False)  # e.g. cash, bank_transfer, upi
    reference_no = Column(String(100), nullable=True)

    # proof_url points to an uploaded document/image (optional).
    proof_url = Column(Text, nullable=True)

    # pending -> verified -> assigned
    # pending -> rejected -> owner can re-submit
    status = Column(String(20), nullable=False, server_default="pending")

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("admins.id"), nullable=True)

    notes = Column(Text, nullable=True)

    # relationships (no back_populates to keep coupling low)
    schedule = relationship("InspectionSchedule")
    owner = relationship("Owner")
    verified_by_admin = relationship("Admin", foreign_keys=[verified_by])

