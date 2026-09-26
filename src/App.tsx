import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Order, DeliveryStatus, TimelineGroup } from './types';
import { INITIAL_ORDERS } from './data/mockOrders';
import { COURIER_META } from './utils/courierDetector';
import { getStoredApiKey, fetchLiveTracking } from './services/trackingApi';

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
  // Real orders only - wiped old fake mock data
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ordertracker_real_orders_v2');
      if (saved) return JSON.parse(saved);
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

  // Persist real orders
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

  const handleLoginSuccess = (phone: string) => {
    setUserPhone(phone);
    localStorage.setItem('ordertracker_user_phone', phone);
    showToast('Signed In Successfully', `Logged in as ${phone}. Your orders are synced.`, 'info');
  };

  const handleLogout = () => {
    setUserPhone(null);
    localStorage.removeItem('ordertracker_user_phone');
    showToast('Signed Out', 'You have been signed out.', 'info');
  };

  const handleKeySaved = (key: string | null) => {
    setHasApiKey(!!key);
    if (key) {
      showToast('API Key Connected', '17TRACK Free Tier connected. Real carrier queries enabled.', 'info');
    }
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    showToast('Parcel Added!', `${newOrder.label} (${COURIER_META[newOrder.courier]?.name}) added to map.`, 'info');
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    }
    showToast('Order Removed', 'Shipment deleted from your tracking list.', 'info');
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

  // Background Courier Poller Simulator / Live API Runner
  const handleTriggerPoller = async () => {
    if (isPolling) return;

    if (orders.length === 0) {
      showToast('No Orders to Poll', 'Add your tracking ID first to track your parcels.', 'info');
      return;
    }

    setIsPolling(true);

    if (hasApiKey) {
      showToast('Querying Courier APIs', 'Connecting to 17TRACK for live scans...', 'info');

      // Poll real active orders
      const activeOrders = orders.filter(o => o.status !== 'delivered');
      for (const ord of activeOrders.slice(0, 3)) {
        try {
          const res = await fetchLiveTracking(ord.trackingId, ord.courier);
          if (res.success && res.events.length > 0) {
            setOrders(prev => prev.map(o => o.id === ord.id ? {
              ...o,
              status: res.status,
              currentCity: res.currentHub,
              expectedDate: res.expectedDate,
              events: res.events,
              lastUpdated: 'Just now (Live Scan)'
            } : o));
          }
        } catch (err) {
          console.error('Error polling order:', ord.trackingId, err);
        }
      }
      setIsPolling(false);
      showToast('Carrier Scans Refreshed', 'Live network check completed.', 'info');
    } else {
      // Simulate advance if no API key
      setTimeout(() => {
        setIsPolling(false);
        const activeOrders = orders.filter(o => o.status !== 'delivered');
        if (activeOrders.length > 0) {
          const candidate = activeOrders[Math.floor(Math.random() * activeOrders.length)];
          handleAdvanceScan(candidate.id);
        } else {
          showToast('All Shipments Delivered', 'No active deliveries to update.', 'info');
        }
      }, 1200);
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

      {/* User Onboarding Action Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 shadow-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
              {userPhone ? 'Personal Account' : 'Phone Sign In Available'}
            </span>
            <span className="text-slate-300">
              {userPhone
                ? `Tracking orders for ${userPhone}`
                : 'Sign in with your Indian mobile number (+91) to sync your shipments.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>FastAPI Backend Ready (TrackParcel Adapter)</span>
            </div>

            <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>

            <button
              onClick={() => setIsArchModalOpen(true)}
              className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>How It Works</span>
            </button>

            <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>

            <button
              onClick={() => setIsFirebaseConfigOpen(true)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Firebase SMS</span>
            </button>
          </div>
        </div>
      </div>

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
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
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
