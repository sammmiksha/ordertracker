import re
from backend.providers.base import NormalizedStatus

def normalize_status(raw_status: str, scan_description: str = "") -> NormalizedStatus:
    """
    Intelligent status normalization across Delhivery, XpressBees, Blue Dart,
    Shadowfax, Valmo, TrackParcel, etc.
    """
    combined = f"{raw_status} {scan_description}".lower()

    if any(k in combined for k in ["delivered", "handed over", "shipment delivered", "successfully delivered"]):
        return NormalizedStatus.DELIVERED

    if any(k in combined for k in ["out for delivery", "ofd", "with delivery agent", "van dispatched", "dispatched for delivery"]):
        return NormalizedStatus.OUT_FOR_DELIVERY

    if any(k in combined for k in ["reached", "arrived at hub", "bag received", "inbound scan", "sorting facility", "mother hub"]):
        return NormalizedStatus.REACHED_HUB

    if any(k in combined for k in ["delay", "failed delivery", "undelivered", "rescheduled", "customer not available", "rto", "address issue"]):
        return NormalizedStatus.EXCEPTION_DELAY

    if any(k in combined for k in ["in transit", "departed", "linehaul", "dispatched", "forwarded", "manifested"]):
        return NormalizedStatus.IN_TRANSIT

    return NormalizedStatus.ORDER_PLACED
