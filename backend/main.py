import os
import hashlib
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import engine, get_db, Base
from backend.models import User, Order, TrackingEvent, TrackingCheck
from backend.schemas import OrderCreateSchema, OrderResponseSchema, UserResponseSchema
from backend.auth import get_current_user
from backend.providers.base import TrackingResult, NormalizedStatus
from backend.providers.registry import registry
from backend.intelligence.delay_detector import analyze_corridor_transit, DelayAnalysis
from backend.intelligence.geocoder import INDIAN_LOGISTICS_HUBS, geocode_location

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OrderTracker Persistent Logistics Platform",
    description="Multi-carrier tracking platform with PostgreSQL storage, Firebase auth, and route intelligence.",
    version="0.2.0"
)

# CORS middleware for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    active_prov = registry.get_active_provider()
    users_count = db.query(User).count()
    orders_count = db.query(Order).count()
    return {
        "status": "healthy",
        "version": "0.2.0 (PostgreSQL/SQLite Persistent)",
        "active_provider": active_prov.name,
        "database_connected": True,
        "total_users": users_count,
        "total_orders": orders_count,
        "supported_hubs": len(INDIAN_LOGISTICS_HUBS)
    }

@app.get("/api/me", response_model=UserResponseSchema)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile synced with Firebase."""
    return current_user

@app.get("/api/orders", response_model=List[OrderResponseSchema])
async def list_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all tracked orders for the authenticated user from the database.
    Replaces localStorage as the source of truth.
    """
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders

@app.post("/api/orders", response_model=OrderResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_and_track_order(
    req: OrderCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingests an order, queries the active carrier tracking provider,
    persists shipment & events in the database, and returns the tracked order.
    """
    dest_city = req.destination_city or "Mumbai"
    dest_coords = geocode_location(dest_city)

    # 1. Fetch live carrier tracking data
    provider = registry.providers["direct"] if req.force_demo else registry.get_active_provider()
    try:
        track_res: TrackingResult = await provider.track(req.tracking_number, courier=req.courier)
        is_live = track_res.is_live_data
        cur_city = track_res.current_city or dest_city
        cur_status = track_res.status.value
        est_delivery = track_res.expected_date or "In Transit"
        raw_events = track_res.events
    except Exception as err:
        # If live carrier query fails, register order in booked state
        is_live = False
        cur_city = f"{dest_city} Gateway"
        cur_status = "order_placed"
        est_delivery = "Pending Carrier Ingestion"
        raw_events = []

    # 2. Create Order in Database
    new_order = Order(
        user_id=current_user.id,
        tracking_number=req.tracking_number.strip(),
        courier=req.courier,
        store=req.store,
        product_name=req.product_name.strip(),
        status=cur_status,
        estimated_delivery=est_delivery,
        origin_city=raw_events[-1].location if raw_events else cur_city,
        current_city=cur_city,
        destination_city=dest_city,
        destination_pincode=req.destination_pincode,
        is_live_tracking=is_live,
        last_checked_at=datetime.utcnow()
    )
    db.add(new_order)
    db.flush() # Populate new_order.id

    # 3. Save Tracking Events
    if raw_events:
        for ev in raw_events:
            db_event = TrackingEvent(
                order_id=new_order.id,
                status=ev.status.value,
                location=ev.location,
                hub_name=ev.hub_name,
                latitude=ev.latitude,
                longitude=ev.longitude,
                event_time=str(ev.timestamp),
                description=ev.description,
                source="carrier_scan" if is_live else "simulation"
            )
            db.add(db_event)
    else:
        # Initial booking event
        init_event = TrackingEvent(
            order_id=new_order.id,
            status=cur_status,
            location=cur_city,
            hub_name=f"{req.courier.capitalize()} Hub",
            latitude=dest_coords[0],
            longitude=dest_coords[1],
            event_time=datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            description=f"Shipment #{req.tracking_number} recorded in OrderTracker.",
            source="manual"
        )
        db.add(init_event)

    # 4. Save Tracking Check Audit Record
    check_audit = TrackingCheck(
        order_id=new_order.id,
        provider=provider.name,
        success=True,
        response_hash=hashlib.md5(f"{req.tracking_number}_{cur_status}_{len(raw_events)}".encode()).hexdigest()
    )
    db.add(check_audit)

    db.commit()
    db.refresh(new_order)
    return new_order

@app.post("/api/orders/{order_id}/refresh", response_model=OrderResponseSchema)
async def refresh_order_status(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Re-queries the carrier network for an existing shipment.
    Saves new events without overwriting existing history.
    """
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    provider = registry.get_active_provider()
    try:
        track_res: TrackingResult = await provider.track(order.tracking_number, courier=order.courier)
        order.status = track_res.status.value
        order.current_city = track_res.current_city
        order.estimated_delivery = track_res.expected_date
        order.is_live_tracking = track_res.is_live_data
        order.last_checked_at = datetime.utcnow()

        # Check existing event descriptions to prevent duplicates
        existing_desc = {ev.description for ev in order.events}
        for ev in track_res.events:
            if ev.description not in existing_desc:
                new_ev = TrackingEvent(
                    order_id=order.id,
                    status=ev.status.value,
                    location=ev.location,
                    hub_name=ev.hub_name,
                    latitude=ev.latitude,
                    longitude=ev.longitude,
                    event_time=str(ev.timestamp),
                    description=ev.description,
                    source="carrier_scan" if track_res.is_live_data else "simulation"
                )
                db.add(new_ev)

        # Audit check
        db.add(TrackingCheck(
            order_id=order.id,
            provider=provider.name,
            success=True,
            response_hash=hashlib.md5(f"{order.tracking_number}_{order.status}".encode()).hexdigest()
        ))

        db.commit()
        db.refresh(order)
        return order
    except Exception as e:
        db.add(TrackingCheck(
            order_id=order.id,
            provider=provider.name,
            success=False
        ))
        db.commit()
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")

@app.delete("/api/orders/{order_id}")
async def delete_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a tracked shipment and its event history."""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"success": True, "message": "Order deleted"}

@app.get("/api/analytics/corridor", response_model=DelayAnalysis)
async def check_corridor_delay(
    origin: str = Query(..., description="Origin city / hub"),
    destination: str = Query(..., description="Destination city / hub"),
    hours_elapsed: float = Query(..., description="Hours since package dispatched")
):
    """Evaluates whether transit time exceeds standard freight linehaul benchmarks."""
    return analyze_corridor_transit(origin, destination, hours_elapsed)

@app.get("/api/hubs")
async def get_all_hubs():
    """Returns mapped Indian logistics sorting centers and geographic coordinates."""
    return {
        "hubs": [
            {"name": name.capitalize(), "latitude": coords[0], "longitude": coords[1]}
            for name, coords in INDIAN_LOGISTICS_HUBS.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
