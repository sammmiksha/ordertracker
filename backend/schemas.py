from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TrackingEventSchema(BaseModel):
    id: str
    status: str
    location: str
    hub_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    event_time: str
    description: str
    source: str = "carrier_scan"

    class Config:
        from_attributes = True

class OrderCreateSchema(BaseModel):
    tracking_number: str
    courier: str
    store: str = "other"
    product_name: str
    destination_city: str = "Mumbai"
    destination_pincode: Optional[str] = "400001"
    force_demo: bool = False

class OrderResponseSchema(BaseModel):
    id: str
    user_id: str
    tracking_number: str
    courier: str
    store: str
    product_name: str
    status: str
    estimated_delivery: Optional[str] = None
    origin_city: Optional[str] = None
    current_city: Optional[str] = None
    destination_city: Optional[str] = None
    destination_pincode: Optional[str] = None
    is_live_tracking: bool
    last_checked_at: Optional[datetime] = None
    created_at: datetime
    events: List[TrackingEventSchema] = []

    class Config:
        from_attributes = True

class UserResponseSchema(BaseModel):
    id: str
    firebase_uid: str
    phone_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
