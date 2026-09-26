import { Courier, DeliveryStatus, TrackingEvent, Order, Shop, TimelineGroup } from '../types';
import { geocodeCity, INDIAN_HUBS } from '../data/hubs';

export const DEFAULT_RAPIDAPI_KEY = 'df094e98f4msh188dd686203ff64p1a0500jsn385282b18814';
export const API_KEY_STORAGE_KEY = 'ordertracker_custom_api_key';
export const API_PROVIDER_STORAGE_KEY = 'ordertracker_api_provider';
export const AUTH_TOKEN_STORAGE_KEY = 'ordertracker_auth_token';

export const BACKEND_URL = 'http://localhost:8000';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || DEFAULT_RAPIDAPI_KEY;
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
}

export function removeStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function getStoredAuthToken(): string {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) return token;
  const userPhone = localStorage.getItem('ordertracker_user_phone');
  if (userPhone) return `test-${userPhone}`;
  return 'guest';
}

export function setStoredAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function removeStoredAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export interface BackendHealthResponse {
  status: string;
  version: string;
  active_provider: string;
  database_connected: boolean;
  total_users: number;
  total_orders: number;
  supported_hubs: number;
}

/**
 * Checks FastAPI backend & Database health
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Maps Backend OrderResponseSchema to Frontend Order type
 */
export function mapApiOrderToOrder(apiOrder: any): Order {
  const destCity = apiOrder.destination_city || 'Mumbai';
  const destInfo = geocodeCity(destCity);
  const curCity = apiOrder.current_city || destCity;
  const curInfo = geocodeCity(curCity);
  const origCity = apiOrder.origin_city || curCity;
  const origInfo = geocodeCity(origCity);

  const status: DeliveryStatus = (apiOrder.status as DeliveryStatus) || 'in_transit';
  let timelineGroup: TimelineGroup = 'later';
  if (status === 'delivered') {
    timelineGroup = 'delivered';
  } else if (status === 'out_for_delivery') {
    timelineGroup = 'today';
  } else if (status === 'reached_hub') {
    timelineGroup = 'tomorrow';
  }

  const events: TrackingEvent[] = (apiOrder.events || []).map((ev: any, idx: number) => {
    const loc = ev.location || curCity;
    const geo = geocodeCity(loc);
    const coords: [number, number] = (ev.latitude && ev.longitude) 
      ? [ev.latitude, ev.longitude] 
      : geo.coords;

    return {
      id: ev.id || `ev-${idx}-${Date.now()}`,
      timestamp: ev.event_time || 'Recent Scan',
      timeAgo: 'Live',
      location: loc,
      hubName: ev.hub_name || loc,
      coordinates: coords,
      status: (ev.status as DeliveryStatus) || 'in_transit',
      description: ev.description || 'Tracking scan recorded.',
    };
  });

  return {
    id: apiOrder.id,
    trackingId: apiOrder.tracking_number,
    label: apiOrder.product_name,
    shop: (apiOrder.store as Shop) || 'other',
    courier: (apiOrder.courier as Courier) || 'other',
    status,
    expectedDate: apiOrder.estimated_delivery || 'In Transit',
    timelineGroup,
    originCity: origCity,
    originCoords: origInfo.coords,
    currentCity: curCity,
    currentCoords: curInfo.coords,
    destinationCity: destCity,
    destinationPincode: apiOrder.destination_pincode || '400001',
    destinationCoords: destInfo.coords,
    lastUpdated: apiOrder.last_checked_at ? 'Synced from Database' : 'Just now',
    isLiveTracking: !!apiOrder.is_live_tracking,
    providerMode: apiOrder.is_live_tracking ? 'live' : 'demo',
    events,
  };
}

/**
 * Fetches user orders from PostgreSQL/SQLite via FastAPI
 */
export async function fetchOrdersFromBackend(token?: string): Promise<Order[]> {
  const authToken = token || getStoredAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/orders`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Failed to load orders: HTTP ${res.status}`);
  }

  const apiOrders = await res.json();
  return (apiOrders || []).map(mapApiOrderToOrder);
}

/**
 * Ingests & tracks an order through FastAPI backend (queries RapidAPI / carriers server-side)
 */
export async function createOrderOnBackend(
  data: {
    tracking_number: string;
    courier: Courier;
    store: Shop;
    product_name: string;
    destination_city?: string;
    destination_pincode?: string;
    force_demo?: boolean;
  },
  token?: string
): Promise<Order> {
  const authToken = token || getStoredAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(35000), // Carrier queries may take 10-25s
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server returned ${res.status}`);
  }

  const createdOrder = await res.json();
  return mapApiOrderToOrder(createdOrder);
}

/**
 * Refreshes tracking status via FastAPI
 */
export async function refreshOrderOnBackend(orderId: string, token?: string): Promise<Order> {
  const authToken = token || getStoredAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(35000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Refresh failed: HTTP ${res.status}`);
  }

  const updatedOrder = await res.json();
  return mapApiOrderToOrder(updatedOrder);
}

/**
 * Deletes an order from the database
 */
export async function deleteOrderOnBackend(orderId: string, token?: string): Promise<boolean> {
  const authToken = token || getStoredAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  });

  return res.ok;
}

export interface TrackingApiResult {
  success: boolean;
  status: DeliveryStatus;
  currentHub: string;
  destinationCity: string;
  expectedDate: string;
  events: TrackingEvent[];
  providerName: string;
  isLiveTracking: boolean;
  providerMode: 'live' | 'demo';
  error?: string;
}

/**
 * Demo Simulation Provider for testing
 */
export function getDemoTracking(
  trackingNumber: string,
  courier: Courier,
  destinationCity: string = 'Mumbai'
): TrackingApiResult {
  const destInfo = geocodeCity(destinationCity);

  let originHub = INDIAN_HUBS.delhi;
  let transitHub = INDIAN_HUBS.bhiwandi;

  if (courier === 'xpressbees' || courier === 'valmo') {
    originHub = INDIAN_HUBS.surat;
    transitHub = INDIAN_HUBS.bhiwandi;
  } else if (courier === 'delhivery') {
    originHub = INDIAN_HUBS.jaipur;
    transitHub = INDIAN_HUBS.gurugram;
  } else if (courier === 'bluedart') {
    originHub = INDIAN_HUBS.bengaluru;
    transitHub = INDIAN_HUBS.nagpur;
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
