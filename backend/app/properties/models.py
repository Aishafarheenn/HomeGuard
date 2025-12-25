from sqlalchemy import Column, Integer, String, DateTime
from middleware.db import Base
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
import uuid
from sqlalchemy.sql import func

class Property(Base):
    __tablename__ = "property"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    address = Column(String, nullable=False)
    lattitude = Column(Geography(geometry_type='POINT', srid=4326))
    longitude = Column(Geography(geometry_type='POINT', srid=4326))
    created_at = Column(DateTime(timezone=True), server_default=func.now())