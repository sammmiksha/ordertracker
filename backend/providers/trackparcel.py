import os
import httpx
from typing import Optional, Dict, Any, List
from backend.providers.base import BaseTrackingProvider, TrackingResult, ProviderEvent, NormalizedStatus
from backend.intelligence.normalizer import normalize_status
from backend.intelligence.geocoder import geocode_location

class TrackParcelProvider(BaseTrackingProvider):
    """
    Adapter for TrackParcel API (250 free calls/month, Indian multi-carrier focus).
    """
    BASE_URL = "https://api.trackparcel.org/v1" # TrackParcel API endpoint

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("TRACKPARCEL_API_KEY")
        super().__init__(name="TrackParcel", is_configured=bool(key))
        self.api_key = key

    async def track(self, tracking_number: str, courier: Optional[str] = None) -> TrackingResult:
        if not self.api_key:
            raise ValueError("TrackParcel API key not configured. Awaiting key approval.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload: Dict[str, Any] = {
            "tracking_number": tracking_number,
        }
        if courier:
            payload["carrier"] = courier

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(f"{self.BASE_URL}/track", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        # Parse vendor response
        raw_events = data.get("checkpoints", []) or data.get("events", [])
        events: List[ProviderEvent] = []

        for ev in raw_events:
            loc = ev.get("location") or ev.get("city") or "India Hub"
            raw_stat = ev.get("status") or ev.get("message") or ""
            desc = ev.get("message") or ev.get("details") or raw_stat
            coords = geocode_location(loc)

            events.append(ProviderEvent(
                timestamp=ev.get("time") or ev.get("timestamp") or "Recent",
                status=normalize_status(raw_stat, desc),
                location=loc,
                hub_name=f"{loc} Sorting Terminal",
                description=desc,
                latitude=coords[0],
                longitude=coords[1],
                raw_status=raw_stat
            ))

        primary_status = normalize_status(data.get("status", "in_transit"))
        current_city = data.get("current_city") or (events[0].location if events else "In Transit")
        current_coords = list(geocode_location(current_city))

        dest_city = data.get("destination_city") or "Destination Hub"
        dest_coords = list(geocode_location(dest_city))

        return TrackingResult(
            tracking_number=tracking_number,
            courier=courier or data.get("carrier", "auto_detected"),
            status=primary_status,
            current_city=current_city,
            current_coords=current_coords,
            destination_city=dest_city,
            destination_coords=dest_coords,
            expected_date=data.get("estimated_delivery") or "Standard Delivery",
            events=events,
            provider_name=self.name,
            raw_payload=data,
            is_live_data=True
        )
