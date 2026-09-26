import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    firebase_uid = Column(String, unique=True, nullable=False, index=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tracking_number = Column(String, nullable=False, index=True)
    courier = Column(String, nullable=False)
    store = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    status = Column(String, default="order_placed")
    estimated_delivery = Column(String, nullable=True)
    origin_city = Column(String, nullable=True)
    current_city = Column(String, nullable=True)
    destination_city = Column(String, nullable=True)
    destination_pincode = Column(String, nullable=True)
    is_live_tracking = Column(Boolean, default=False)
    last_checked_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="orders")
    events = relationship("TrackingEvent", back_populates="order", cascade="all, delete-orphan", order_by="desc(TrackingEvent.event_time)")
    checks = relationship("TrackingCheck", back_populates="order", cascade="all, delete-orphan")

class TrackingEvent(Base):
    __tablename__ = "tracking_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, nullable=False)
    location = Column(String, nullable=False)
    hub_name = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    event_time = Column(String, nullable=False) # e.g. "2026-05-30T19:51:00Z"
    description = Column(Text, nullable=False)
    source = Column(String, default="carrier_scan") # carrier_scan | simulation | manual

    # Relationships
    order = relationship("Order", back_populates="events")

class TrackingCheck(Base):
    __tablename__ = "tracking_checks"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    checked_at = Column(DateTime, default=datetime.utcnow)
    provider = Column(String, nullable=False)
    success = Column(Boolean, default=True)
    response_hash = Column(String, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="checks")
