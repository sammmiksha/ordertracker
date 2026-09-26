# OrderTracker Logistics Intelligence Engine (Backend)

A multi-carrier personal logistics intelligence platform for Indian e-commerce (FastAPI + Python).

## 🏛️ Architecture Overview

```
                      Raw Carrier Data
                             │
                             ▼
                ┌─────────────────────────┐
                │ BaseTrackingProvider    │ (Abstract Interface)
                └────────────┬────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     TrackParcelProvider           DirectSimulationProvider
   (api.trackparcel.org)           (Development Engine)
              │
              ▼
   ┌──────────────────────────────────────────────┐
   │         LOGISTICS INTELLIGENCE LAYER         │
   ├──────────────────────────────────────────────┤
   │ 1. Normalization (status standardization)    │
   │ 2. Hub Geocoding (Bhiwandi, Sitapura, etc.)  │
   │ 3. Delay & Transit Analytics (Corridor ETA)  │
   └──────────────────────────────────────────────┘
                             │
                             ▼
                Unified REST API (FastAPI)
                             │
                             ▼
                 React + Leaflet Frontend
```

## 🚀 Running the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 🔑 Plugging in TrackParcel API Key

When approved by TrackParcel, simply set the environment variable:

```bash
export TRACKPARCEL_API_KEY=your_key_here
```

Or make a POST request without restarting the server:

```bash
POST /api/config/trackparcel
{
  "api_key": "your_key_here"
}
```

The system automatically switches from the direct developmental engine to **TrackParcelProvider** in real-time.
