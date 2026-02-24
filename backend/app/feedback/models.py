from sqlalchemy import Column, Integer, String, DateTime,  Text 
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