import os
import httpx
from typing import Optional, Dict, Any, List
from backend.providers.base import BaseTrackingProvider, TrackingResult, ProviderEvent, NormalizedStatus
from backend.intelligence.normalizer import normalize_status
from backend.intelligence.geocoder import geocode_location

DEFAULT_RAPIDAPI_KEY = "df094e98f4msh188dd686203ff64p1a0500jsn385282b18814"

class RapidApiCheapTrackerProvider(BaseTrackingProvider):
    """
    Adapter for Cheap Tracking Status API on RapidAPI (finestoreuk).
    Supports 1,000+ carriers with auto-detection.
    """
    RAPIDAPI_HOST = "cheap-tracking-status.p.rapidapi.com"
    RAPIDAPI_ENDPOINT = "https://cheap-tracking-status.p.rapidapi.com/TrackingGetTrackingDetails"

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("RAPIDAPI_KEY") or DEFAULT_RAPIDAPI_KEY
        super().__init__(name="RapidAPI Live Tracker", is_configured=bool(key))
        self.api_key = key

    async def track(self, tracking_number: str, courier: Optional[str] = None) -> TrackingResult:
        if not self.api_key:
            raise ValueError("RapidAPI key not configured.")

        headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": self.RAPIDAPI_HOST,
            "Content-Type": "application/json"
        }

        payload: Dict[str, Any] = {
            "TrackingCode": tracking_number.strip()
        }

        async with httpx.AsyncClient(timeout=35.0) as client:
            resp = await client.post(
                self.RAPIDAPI_ENDPOINT,
                json=payload,
                headers=headers
            )
            resp.raise_for_status()
            res_json = resp.json()

        # Parse RapidAPI carrier response
        payload_data = res_json.get("data") or {}
        raw_events = payload_data.get("events") or []

        detected_carrier = courier or "courier"
        events: List[ProviderEvent] = []

        for ev in raw_events:
            loc = ev.get("location") or "Transit Hub"
            status_text = ev.get("status") or ""
            desc = f"{status_text} recorded by carrier."
            courier_obj = ev.get("courier", {}).get("translation", {})
            if courier_obj.get("name"):
                detected_carrier = courier_obj["name"]
                desc = f"{status_text} ({detected_carrier})"

            coords = geocode_location(loc)
            date_time = ev.get("datetime") or ev.get("timestamp") or "Recent"

            events.append(ProviderEvent(
                timestamp=date_time,
                status=normalize_status(status_text, desc),
                location=loc if loc else f"{detected_carrier} Hub",
                hub_name=f"{detected_carrier} Sorting Facility",
                description=desc,
                latitude=coords[0],
                longitude=coords[1],
                raw_status=status_text
            ))

        dispatch_desc = payload_data.get("dispatch_code", {}).get("desc", "")
        primary_status = normalize_status(dispatch_desc or (events[0].raw_status if events else "in_transit"))

        current_city = events[0].location if events else "In Transit"
        current_coords = list(geocode_location(current_city))

        dest_city = "Destination Address"
        dest_coords = list(geocode_location(dest_city))

        return TrackingResult(
            tracking_number=tracking_number,
            courier=detected_carrier,
            status=primary_status,
            current_city=current_city,
            current_coords=current_coords,
            destination_city=dest_city,
            destination_coords=dest_coords,
            expected_date="Standard Courier ETA" if primary_status != NormalizedStatus.DELIVERED else "Delivered",
            events=events,
            provider_name=self.name,
            raw_payload=res_json,
            is_live_data=True
        )
