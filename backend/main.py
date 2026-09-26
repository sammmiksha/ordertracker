from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from backend.providers.base import TrackingResult
from backend.providers.registry import registry
from backend.intelligence.delay_detector import analyze_corridor_transit, DelayAnalysis
from backend.intelligence.geocoder import INDIAN_LOGISTICS_HUBS

app = FastAPI(
    title="OrderTracker Logistics Intelligence API",
    description="Multi-carrier tracking abstraction layer with hub geocoding and delay intelligence.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrackRequest(BaseModel):
    tracking_number: str
    courier: Optional[str] = None
    provider: Optional[str] = None

class SetKeyRequest(BaseModel):
    api_key: str

@app.get("/api/health")
async def health_check():
    active_prov = registry.get_active_provider()
    return {
        "status": "healthy",
        "active_provider": active_prov.name,
        "is_trackparcel_configured": registry.providers["trackparcel"].is_configured,
        "supported_hubs_count": len(INDIAN_LOGISTICS_HUBS)
    }

@app.post("/api/track", response_model=TrackingResult)
async def track_shipment(req: TrackRequest):
    """
    Standardized tracking endpoint.
    Routes to the active provider (TrackParcel when key present, or Direct Engine).
    """
    provider = registry.get_active_provider()
    try:
        result = await provider.track(
            tracking_number=req.tracking_number.strip(),
            courier=req.courier
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/config/trackparcel")
async def configure_trackparcel(req: SetKeyRequest):
    """
    Hot-swap / configure the TrackParcel API key without restarting the server.
    """
    registry.set_trackparcel_key(req.api_key.strip())
    return {
        "success": True,
        "message": "TrackParcel API key successfully activated.",
        "active_provider": registry.get_active_provider().name
    }

@app.get("/api/analytics/corridor", response_model=DelayAnalysis)
async def check_corridor_delay(
    origin: str = Query(..., description="Origin city / hub"),
    destination: str = Query(..., description="Destination city / hub"),
    hours_elapsed: float = Query(..., description="Hours since package dispatched")
):
    """
    Evaluates whether transit time exceeds standard freight linehaul benchmarks.
    """
    return analyze_corridor_transit(origin, destination, hours_elapsed)

@app.get("/api/hubs")
async def get_all_hubs():
    """
    Returns mapped Indian logistics sorting centers and geographic coordinates.
    """
    return {
        "hubs": [
            {"name": name.capitalize(), "latitude": coords[0], "longitude": coords[1]}
            for name, coords in INDIAN_LOGISTICS_HUBS.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
