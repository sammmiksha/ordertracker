import { Courier, DeliveryStatus, TrackingEvent } from '../types';
import { geocodeCity, INDIAN_HUBS } from '../data/hubs';

export interface TrackingApiResult {
  success: boolean;
  status: DeliveryStatus;
  currentHub: string;
  destinationCity: string;
  expectedDate: string;
  events: TrackingEvent[];
  providerName: string;
  isLiveTracking: boolean; // TRUE = real courier data, FALSE = demo simulation
  providerMode: 'live' | 'demo';
  error?: string;
  rawMessage?: string;
}

export interface TrackingProvider {
  id: string;
  name: string;
  isLive: boolean;
  description: string;
  track(trackingNumber: string, courier: Courier, destinationCity: string): Promise<TrackingApiResult>;
}

export type ApiProviderType = 'fastapi' | 'demo' | 'ship24' | 'trackcourier';

export const API_KEY_STORAGE_KEY = 'ordertracker_custom_api_key';
export const API_PROVIDER_STORAGE_KEY = 'ordertracker_api_provider';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(key: string, provider: ApiProviderType = 'fastapi'): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  localStorage.setItem(API_PROVIDER_STORAGE_KEY, provider);
}

export function getStoredApiProvider(): ApiProviderType {
  return (localStorage.getItem(API_PROVIDER_STORAGE_KEY) as ApiProviderType) || 'fastapi';
}

export function removeStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.setItem(API_PROVIDER_STORAGE_KEY, 'fastapi');
}

/**
 * 🟡 DEMO PROVIDER
 * Clearly marked as simulated data. No pretending to be live courier data.
 */
export class DemoTrackingProvider implements TrackingProvider {
  id = 'demo';
  name = 'Demo Provider';
  isLive = false;
  description = 'Simulated hub events for testing Leaflet maps and UI timelines';

  async track(trackingNumber: string, courier: Courier, destinationCity: string): Promise<TrackingApiResult> {
    const destInfo = geocodeCity(destinationCity);

    let originHub = INDIAN_HUBS.delhi;
    let transitHub = INDIAN_HUBS.bhiwandi;

    if (courier === 'xpressbees') {
      originHub = INDIAN_HUBS.surat;
      transitHub = INDIAN_HUBS.bhiwandi;
    } else if (courier === 'delhivery') {
      originHub = INDIAN_HUBS.jaipur;
      transitHub = INDIAN_HUBS.gurugram;
    } else if (courier === 'bluedart') {
      originHub = INDIAN_HUBS.bengaluru;
      transitHub = INDIAN_HUBS.nagpur;
    } else if (courier === 'valmo') {
      originHub = INDIAN_HUBS.surat;
      transitHub = INDIAN_HUBS.bhiwandi;
    }

    const events: TrackingEvent[] = [
      {
        id: `ev-demo-2-${Date.now()}`,
        timestamp: 'Today, 11:30 AM',
        timeAgo: '2 hrs ago',
        location: transitHub.name,
        hubName: `${transitHub.name} (Simulated)`,
        coordinates: transitHub.coords,
        status: 'in_transit',
        description: `[DEMO SIMULATION] Consignment entered test sorting hub ${transitHub.name}. Destined for ${destInfo.name}.`
      },
      {
        id: `ev-demo-1-${Date.now()}`,
        timestamp: 'Yesterday, 06:15 PM',
        timeAgo: '1 day ago',
        location: originHub.name,
        hubName: `${originHub.name} (Simulated)`,
        coordinates: originHub.coords,
        status: 'order_placed',
        description: `[DEMO SIMULATION] Package #${trackingNumber} manifested at origin test facility.`
      }
    ];

    return {
      success: true,
      status: 'in_transit',
      currentHub: transitHub.name,
      destinationCity: destInfo.name,
      expectedDate: 'Tomorrow, by 6:00 PM',
      events,
      providerName: 'Demo Provider (Simulated)',
      isLiveTracking: false,
      providerMode: 'demo',
    };
  }
}

/**
 * 🟢 REAL BACKEND PROVIDER (FastAPI -> TrackParcel / Official Carrier APIs)
 * Server-side tracking where API keys stay strictly off the frontend.
 * Never silently fabricates fake scans if the API has no data.
 */
export class FastApiBackendProvider implements TrackingProvider {
  id = 'fastapi';
  name = 'FastAPI Intelligence Backend (TrackParcel)';
  isLive = true;
  description = 'Queries real courier networks via server-side TrackParcel API';

  async track(trackingNumber: string, courier: Courier, destinationCity: string): Promise<TrackingApiResult> {
    try {
      const response = await fetch('http://localhost:8000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingNumber, courier }),
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned error ${response.status}`);
      }

      const data = await response.json();
      const events: TrackingEvent[] = (data.events || []).map((ev: any, idx: number) => ({
        id: `ev-live-${idx}-${Date.now()}`,
        timestamp: ev.timestamp,
        timeAgo: 'Live Scan',
        location: ev.location,
        hubName: ev.hub_name || ev.location,
        coordinates: [ev.latitude || 20.5937, ev.longitude || 78.9629],
        status: ev.status,
        description: ev.description,
      }));

      return {
        success: true,
        status: data.status,
        currentHub: data.current_city,
        destinationCity: data.destination_city || destinationCity,
        expectedDate: data.expected_date || 'Standard Courier ETA',
        events,
        providerName: data.provider_name || 'TrackParcel API (Live)',
        isLiveTracking: !!data.is_live_data,
        providerMode: data.is_live_data ? 'live' : 'demo',
      };
    } catch (err: any) {
      // HONEST ERROR HANDLING: Do NOT silently make up fake scans!
      return {
        success: false,
        status: 'order_placed',
        currentHub: 'Awaiting Hub Scan',
        destinationCity,
        expectedDate: 'Awaiting Courier Updates',
        events: [],
        providerName: 'FastAPI Backend',
        isLiveTracking: false,
        providerMode: 'live',
        error: err?.message || 'Failed to reach courier tracking network. Ensure FastAPI backend is running.',
      };
    }
  }
}

/**
 * Real Ship24 Provider (When user explicitly configures Ship24)
 * Honest error handling: Never falls back to fake hub events if empty.
 */
export class Ship24TrackingProvider implements TrackingProvider {
  id = 'ship24';
  name = 'Ship24 Live API';
  isLive = true;
  description = 'Live multi-carrier global tracking via Ship24';

  async track(trackingNumber: string, courier: Courier, destinationCity: string): Promise<TrackingApiResult> {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      return {
        success: false,
        status: 'order_placed',
        currentHub: 'Unknown',
        destinationCity,
        expectedDate: 'N/A',
        events: [],
        providerName: 'Ship24 API',
        isLiveTracking: false,
        providerMode: 'live',
        error: 'Ship24 API key not configured.',
      };
    }

    try {
      const response = await fetch('https://api.ship24.com/public/v1/trackers/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        throw new Error(`Ship24 API error: HTTP ${response.status}`);
      }

      const data = await response.json();
      const trackings = data?.data?.trackings || [];
      if (trackings.length === 0) {
        return {
          success: false,
          status: 'order_placed',
          currentHub: 'No Courier Scan Found',
          destinationCity,
          expectedDate: 'Pending Carrier Ingestion',
          events: [],
          providerName: 'Ship24 API',
          isLiveTracking: true,
          providerMode: 'live',
          error: 'Courier network has not registered any physical scans for this tracking ID yet.',
        };
      }

      const item = trackings[0];
      const eventsRaw = item.events || [];
      const events: TrackingEvent[] = eventsRaw.map((ev: any, idx: number) => {
        const loc = ev.location || ev.status || 'Hub';
        const geocoded = geocodeCity(loc);
        return {
          id: `ev-s24-${idx}-${Date.now()}`,
          timestamp: ev.datetime || 'Recently',
          timeAgo: 'Live',
          location: loc,
          hubName: loc,
          coordinates: geocoded.coords,
          status: ev.status_milestone === 'delivered' ? 'delivered' : 'in_transit',
          description: ev.status || 'Shipment scan',
        };
      });

      return {
        success: true,
        status: item.delivery?.status === 'delivered' ? 'delivered' : 'in_transit',
        currentHub: events[0]?.location || 'Transit Hub',
        destinationCity,
        expectedDate: item.delivery?.estimated_delivery_date || 'In transit',
        events,
        providerName: 'Ship24 API (Live)',
        isLiveTracking: true,
        providerMode: 'live',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'order_placed',
        currentHub: 'Connection Error',
        destinationCity,
        expectedDate: 'N/A',
        events: [],
        providerName: 'Ship24 API',
        isLiveTracking: false,
        providerMode: 'live',
        error: err?.message || 'Failed to query Ship24 tracking service.',
      };
    }
  }
}

export const DEFAULT_RAPIDAPI_KEY = 'df094e98f4msh188dd686203ff64p1a0500jsn385282b18814';

/**
 * 🟢 RapidAPI Cheap Tracking Provider (Live Multi-Carrier)
 */
export class RapidApiTrackingProvider implements TrackingProvider {
  id = 'rapidapi';
  name = 'RapidAPI Live Tracker';
  isLive = true;
  description = 'Live multi-carrier tracking with carrier auto-detection via RapidAPI';

  async track(trackingNumber: string, courier: Courier, destinationCity: string): Promise<TrackingApiResult> {
    const apiKey = getStoredApiKey() || DEFAULT_RAPIDAPI_KEY;

    try {
      const response = await fetch('https://cheap-tracking-status.p.rapidapi.com/TrackingGetTrackingDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'cheap-tracking-status.p.rapidapi.com',
        },
        body: JSON.stringify({
          TrackingCode: trackingNumber.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`RapidAPI returned HTTP ${response.status}`);
      }

      const resJson = await response.json();
      const payloadData = resJson?.data || {};
      const rawEvents = payloadData.events || [];

      let detectedCarrier = courier || 'courier';
      const events: TrackingEvent[] = rawEvents.map((ev: any, idx: number) => {
        const loc = ev.location || 'Transit Hub';
        const statusText = ev.status || 'Scan recorded';
        let desc = `${statusText} recorded by carrier.`;
        if (ev.courier?.translation?.name) {
          detectedCarrier = ev.courier.translation.name;
          desc = `${statusText} (${detectedCarrier})`;
        }
        const coords = geocodeCity(loc || destinationCity);

        return {
          id: `ev-rapid-${idx}-${Date.now()}`,
          timestamp: ev.datetime ? new Date(ev.datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Live Scan',
          timeAgo: 'Live Scan',
          location: loc || `${detectedCarrier} Hub`,
          hubName: `${detectedCarrier} Logistics Terminal`,
          coordinates: coords.coords,
          status: statusText.toLowerCase().includes('delivered') ? 'delivered' : statusText.toLowerCase().includes('out') ? 'out_for_delivery' : 'in_transit',
          description: desc,
        };
      });

      const isDelivered = payloadData.dispatch_code?.desc?.toLowerCase().includes('delivered') || events[0]?.status === 'delivered';
      const latestHub = events[0]?.location || 'Courier Gateway';

      return {
        success: true,
        status: isDelivered ? 'delivered' : (events[0]?.status || 'in_transit'),
        currentHub: latestHub,
        destinationCity,
        expectedDate: isDelivered ? 'Delivered' : 'In Transit via Courier',
        events,
        providerName: `RapidAPI (${detectedCarrier})`,
        isLiveTracking: true,
        providerMode: 'live',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'order_placed',
        currentHub: 'Connection Error',
        destinationCity,
        expectedDate: 'N/A',
        events: [],
        providerName: 'RapidAPI Tracking',
        isLiveTracking: false,
        providerMode: 'live',
        error: err?.message || 'Failed to query RapidAPI tracking service.',
      };
    }
  }
}

// Active provider registry on the frontend
const PROVIDERS: Record<string, TrackingProvider> = {
  rapidapi: new RapidApiTrackingProvider(),
  fastapi: new FastApiBackendProvider(),
  demo: new DemoTrackingProvider(),
  ship24: new Ship24TrackingProvider(),
};

export function getActiveTrackingProvider(): TrackingProvider {
  const provType = getStoredApiProvider();
  if (provType === 'demo') return PROVIDERS.demo;
  return PROVIDERS.rapidapi;
}

export function setActiveTrackingProvider(type: ApiProviderType): void {
  localStorage.setItem(API_PROVIDER_STORAGE_KEY, type);
}

/**
 * Universal Tracker Entry Point
 */
export async function fetchLiveTracking(
  trackingNumber: string,
  courier: Courier,
  destinationCity: string = 'Mumbai',
  forceDemo: boolean = false
): Promise<TrackingApiResult> {
  if (forceDemo) {
    return PROVIDERS.demo.track(trackingNumber, courier, destinationCity);
  }

  const provider = getActiveTrackingProvider();
  const result = await provider.track(trackingNumber, courier, destinationCity);

  // If real provider failed (e.g. backend offline or invalid credentials),
  // return the honest result without silently pretending fake data is live!
  return result;
}
