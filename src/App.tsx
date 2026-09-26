import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Order, DeliveryStatus, TimelineGroup } from './types';
import { INITIAL_ORDERS } from './data/mockOrders';
import { COURIER_META } from './utils/courierDetector';
import { geocodeCity } from './data/hubs';
import { 
  getStoredApiKey, 
  fetchOrdersFromBackend, 
  refreshOrderOnBackend, 
  deleteOrderOnBackend, 
  setStoredAuthToken, 
  removeStoredAuthToken 
} from './services/trackingApi';

import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { DeliveryList } from './components/DeliveryList';
import { AddOrderModal } from './components/AddOrderModal';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { TimelineModal } from './components/TimelineModal';
import { ArchitectureModal } from './components/ArchitectureModal';

import { 
  Info, 
  Sparkles, 
  MapPin, 
  Bell, 
  X, 
  Cpu,
  Key,
  ShieldCheck,
  Plus,
  Flame
} from 'lucide-react';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'delivered' | 'info';
}

export const App: React.FC = () => {
  // Sanitize coordinates for existing orders (replaces outdated Nagpur fallbacks)
  const sanitizeOrderCoordinates = (orderList: Order[]): Order[] => {
    return orderList.map(o => {
      const isNagpurDefault = Math.abs(o.destinationCoords[0] - 21.1458) < 0.01 && Math.abs(o.destinationCoords[1] - 79.0882) < 0.01;
      const destCityNorm = (o.destinationCity || '').toLowerCase();
      if (isNagpurDefault && !destCityNorm.includes('nagpur')) {
        const correctGeo = geocodeCity(o.destinationCity);
        return {
          ...o,
          destinationCoords: correctGeo.coords,
          currentCoords: (o.status === 'delivered' || o.status === 'out_for_delivery') ? correctGeo.coords : o.currentCoords
        };
      }
      return o;
    });
  };

  // Real orders only
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ordertracker_real_orders_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeOrderCoordinates(parsed);
      }
    } catch (e) {
      console.error('Failed to load saved orders:', e);
    }
    return INITIAL_ORDERS; // empty array []
  });

  // User Phone Auth State
  const [userPhone, setUserPhone] = useState<string | null>(() => {
    return localStorage.getItem('ordertracker_user_phone');
  });

  // API Key State
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => {
    return !!getStoredApiKey();
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [timelineOrder, setTimelineOrder] = useState<Order | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Load orders from Database via FastAPI on mount & auth change
  useEffect(() => {
    let isMounted = true;
    const loadBackendOrders = async () => {
      try {
        const dbOrders = await fetchOrdersFromBackend();
        if (isMounted && dbOrders && dbOrders.length > 0) {
          setOrders(sanitizeOrderCoordinates(dbOrders));
        }
      } catch (err) {
        console.warn('Backend orders unavailable or empty, keeping local state:', err);
      }
    };
    loadBackendOrders();
    return () => { isMounted = false; };
  }, [userPhone]);

  // Persist real orders to local cache as resilience fallback
  useEffect(() => {
    try {
      localStorage.setItem('ordertracker_real_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }, [orders]);

  const showToast = (title: string, message: string, type: 'update' | 'delivered' | 'info' = 'update') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleLoginSuccess = async (phone: string, token?: string) => {
    setUserPhone(phone);
    localStorage.setItem('ordertracker_user_phone', phone);
    if (token) {
      setStoredAuthToken(token);
    }
    showToast('Signed In Successfully', `Logged in as ${phone}. Database sync active.`, 'info');

    // Reload orders for this authenticated user
    try {
      const userOrders = await fetchOrdersFromBackend(token);
      setOrders(userOrders);
    } catch (err) {
      console.warn('Could not load user orders from DB:', err);
    }
  };

  const handleLogout = () => {
    setUserPhone(null);
    localStorage.removeItem('ordertracker_user_phone');
    removeStoredAuthToken();
    showToast('Signed Out', 'You have been signed out.', 'info');
  };

  const handleKeySaved = (key: string | null) => {
    setHasApiKey(!!key);
    if (key) {
      showToast('RapidAPI Key Active', 'Multi-Carrier Live Tracker connected.', 'info');
    }
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id && o.trackingId !== newOrder.trackingId)]);
    setSelectedOrderId(newOrder.id);
    showToast('Parcel Added!', `${newOrder.label} (${COURIER_META[newOrder.courier]?.name || 'Courier'}) saved to database.`, 'info');
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    }
    try {
      await deleteOrderOnBackend(orderId);
    } catch (err) {
      console.warn('Delete on backend failed:', err);
    }
    showToast('Order Removed', 'Shipment deleted from your tracking list and database.', 'info');
  };

  // Advance scan for a single order
  const handleAdvanceScan = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      if (order.status === 'order_placed' || order.status === 'in_transit') {
        const nextStatus: DeliveryStatus = 'reached_hub';
        const updatedEvents = [
          {
            id: 'ev-adv-' + Date.now(),
            timestamp: 'Today, Just now',
            timeAgo: 'Just now',
            location: `${order.destinationCity} Gateway Hub`,
            hubName: `${order.destinationCity} Hub`,
            coordinates: order.destinationCoords,
            status: nextStatus,
            description: `Consignment arrived at destination sorting facility (${order.destinationCity}). Outbound dispatch scheduled.`
          },
          ...order.events
        ];

        showToast('Hub Scan Updated!', `${order.label} reached destination terminal: ${order.destinationCity}`, 'update');

        return {
          ...order,
          status: nextStatus,
          currentCity: `${order.destinationCity} Gateway Hub`,
          currentCoords: order.destinationCoords,
          lastUpdated: 'Just now',
          timelineGroup: 'today' as TimelineGroup,
          events: updatedEvents,
        };
      } else if (order.status === 'reached_hub') {
        const nextStatus: DeliveryStatus = 'out_for_delivery';
        const updatedEvents = [
          {
            id: 'ev-adv-' + Date.now(),
            timestamp: 'Today, Just now',
            timeAgo: 'Just now',
            location: order.destinationCity,
            hubName: `${order.destinationCity} Local Delivery Center`,
            coordinates: order.destinationCoords,
            status: nextStatus,
            description: `Out for delivery with delivery agent. Keep OTP ready at doorstep.`
          },
          ...order.events
        ];

        showToast('Out for Delivery!', `${order.label} is on its way to your doorstep!`, 'update');

        return {
          ...order,
          status: nextStatus,
          timelineGroup: 'today' as TimelineGroup,
          expectedDate: 'Today by 7:30 PM',
          lastUpdated: 'Just now',
          events: updatedEvents,
        };
      } else if (order.status === 'out_for_delivery') {
        const nextStatus: DeliveryStatus = 'delivered';
        const updatedEvents = [
          {
            id: 'ev-adv-' + Date.now(),
            timestamp: 'Today, Just now',
            timeAgo: 'Delivered',
            location: order.destinationCity,
            hubName: 'Customer Doorstep',
            coordinates: order.destinationCoords,
            status: nextStatus,
            description: `Delivered safely to recipient at address. Delivery verified.`
          },
          ...order.events
        ];

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }

        showToast('Delivered! 🎉', `${order.label} was handed over at your doorstep.`, 'delivered');

        return {
          ...order,
          status: nextStatus,
          timelineGroup: 'delivered' as TimelineGroup,
          expectedDate: 'Delivered Today',
          lastUpdated: 'Just now',
          events: updatedEvents,
        };
      }

      return order;
    }));
  };

  // Mark an order as delivered with doorstep event and confetti celebration
  const handleMarkDelivered = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updatedEvents = [
        {
          id: 'ev-deliv-' + Date.now(),
          timestamp: 'Today, Just now',
          timeAgo: 'Just now',
          location: order.destinationCity,
          hubName: 'Customer Doorstep',
          coordinates: order.destinationCoords,
          status: 'delivered' as DeliveryStatus,
          description: `Package handed over at ${order.destinationCity}. Delivered verified.`
        },
        ...order.events
      ];

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      showToast('Delivered! 🎉', `${order.label} was marked as delivered.`, 'delivered');

      return {
        ...order,
        status: 'delivered' as DeliveryStatus,
        timelineGroup: 'delivered' as TimelineGroup,
        expectedDate: 'Delivered Today',
        currentCity: order.destinationCity,
        currentCoords: order.destinationCoords,
        lastUpdated: 'Delivered Today',
        events: updatedEvents,
      };
    }));
  };

  // Background Courier Poller Simulator / Live API Runner
  const handleTriggerPoller = async () => {
    if (isPolling) return;

    if (orders.length === 0) {
      showToast('No Orders to Poll', 'Add your tracking ID first to track your parcels.', 'info');
      return;
    }

    setIsPolling(true);
    showToast('Querying Carrier Network', 'Checking live carrier scans via RapidAPI backend...', 'info');

    try {
      const activeOrders = orders.filter(o => o.status !== 'delivered');
      for (const ord of activeOrders.slice(0, 3)) {
        try {
          const updated = await refreshOrderOnBackend(ord.id);
          setOrders(prev => prev.map(o => o.id === ord.id ? updated : o));
        } catch (e) {
          console.warn('Backend refresh failed for order:', ord.id, e);
        }
      }
      showToast('Carrier Scans Refreshed', 'Shipment status and database updated.', 'info');
    } catch (err) {
      console.error('Poller error:', err);
    } finally {
      setIsPolling(false);
    }
  };

  // Metrics
  const activeCount = orders.filter(o => o.status === 'in_transit' || o.status === 'reached_hub').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-top-4 duration-300 ${
              toast.type === 'delivered'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : toast.type === 'info'
                ? 'bg-indigo-950 text-indigo-100 border-indigo-800'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'delivered' ? (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-indigo-400" />
              ) : (
                <Bell className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white leading-tight">{toast.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main App Header */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onTriggerPoller={handleTriggerPoller}
        isPolling={isPolling}
        userPhone={userPhone}
        onLogout={handleLogout}
        hasApiKey={hasApiKey}
        activeCount={activeCount}
        outForDeliveryCount={outForDeliveryCount}
        deliveredCount={deliveredCount}
      />



      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Interactive Map View */}
        <section className="h-[380px] md:h-[450px] w-full">
          <MapView
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={(id) => setSelectedOrderId(id)}
            onOpenTimeline={(order) => setTimelineOrder(order)}
          />
        </section>

        {/* Selected Order Focused Banner */}
        {selectedOrderId && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                📍
              </div>
              <div className="truncate">
                <span className="text-xs text-indigo-600 font-semibold block uppercase tracking-wider">
                  Focused Shipment on Map
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {orders.find(o => o.id === selectedOrderId)?.label}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  (Last Seen: {orders.find(o => o.id === selectedOrderId)?.currentCity})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const ord = orders.find(o => o.id === selectedOrderId);
                  if (ord) setTimelineOrder(ord);
                }}
                className="bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Journey Details
              </button>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Delivery Timeline and Sorted List View */}
        <section>
          <DeliveryList
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={(id) => setSelectedOrderId(id)}
            onOpenTimeline={(order) => setTimelineOrder(order)}
            onAdvanceScan={handleAdvanceScan}
            onDeleteOrder={handleDeleteOrder}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onMarkDelivered={handleMarkDelivered}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-12 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-800">OrderTracker</span> • Designed for Indian E-Commerce Shoppers (Delhivery, XpressBees, Blue Dart, Shadowfax, DTDC, India Post)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Free 17TRACK API Ready</span>
            <span>•</span>
            <span>Leaflet Map Engine</span>
            <span>•</span>
            <span>Hub Geocoding</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PhoneAuthModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
        onConfigSaved={() => showToast('Firebase Connected', 'Real Firebase Phone Auth is ready for SMS OTP.', 'info')}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={handleKeySaved}
      />

      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddOrder={handleAddOrder}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <TimelineModal
        order={timelineOrder}
        onClose={() => setTimelineOrder(null)}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};

export default App;
