from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime

class NormalizedStatus(str, Enum):
    ORDER_PLACED = "order_placed"
    IN_TRANSIT = "in_transit"
    REACHED_HUB = "reached_hub"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    EXCEPTION_DELAY = "delayed"

class ProviderEvent(BaseModel):
    timestamp: str
    status: NormalizedStatus
    location: str
    hub_name: Optional[str] = None
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    raw_status: Optional[str] = None

class TrackingResult(BaseModel):
    tracking_number: str
    courier: str
    status: NormalizedStatus
    current_city: str
    current_coords: Optional[List[float]] = None
    destination_city: Optional[str] = None
    destination_coords: Optional[List[float]] = None
    expected_date: Optional[str] = None
    events: List[ProviderEvent] = Field(default_factory=list)
    provider_name: str
    raw_payload: Optional[Dict[str, Any]] = None
    is_live_data: bool = True

class BaseTrackingProvider(ABC):
    """
    Abstract Tracking Provider interface.
    Decouples OrderTracker from any single commercial or courier API.
    """
    def __init__(self, name: str, is_configured: bool = False):
        self.name = name
        self.is_configured = is_configured

    @abstractmethod
    async def track(self, tracking_number: str, courier: Optional[str] = None) -> TrackingResult:
        """
        Query courier tracking data and return a standardized TrackingResult.
        """
        pass
