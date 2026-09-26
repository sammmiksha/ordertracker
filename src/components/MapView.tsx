import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Order } from '../types';
import { COURIER_META } from '../utils/courierDetector';
import { SHOP_META } from '../utils/shopMeta';
import { Layers, Maximize2, ShieldAlert } from 'lucide-react';

interface MapViewProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  onOpenTimeline: (order: Order) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onOpenTimeline,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of India
      const map = L.map(mapContainerRef.current, {
        center: [21.5, 78.9],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      // Free, open-source OpenStreetMap tiles (No API key required, zero watermarks)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      polylinesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance alive across renders, destroy on unmount
    };
  }, []);

  // Update Markers & Polylines when orders or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const polylinesLayer = polylinesLayerRef.current;

    if (!map || !markersLayer || !polylinesLayer) return;

    markersLayer.clearLayers();
    polylinesLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    orders.forEach((order) => {
      const isSelected = order.id === selectedOrderId;
      const courier = COURIER_META[order.courier] || COURIER_META.other;
      const shop = SHOP_META[order.shop] || SHOP_META.other;

      // Color based on status
      let pinColor = '#4F46E5'; // Indigo
      let pulseColor = 'rgba(79, 70, 229, 0.4)';
      let statusBadge = 'In Transit';

      if (order.status === 'out_for_delivery') {
        pinColor = '#059669'; // Emerald
        pulseColor = 'rgba(16, 185, 129, 0.4)';
        statusBadge = 'Out for Delivery';
      } else if (order.status === 'reached_hub') {
        pinColor = '#D97706'; // Amber
        pulseColor = 'rgba(245, 158, 11, 0.4)';
        statusBadge = 'At Hub';
      } else if (order.status === 'delivered') {
        pinColor = '#64748B'; // Slate
        pulseColor = 'transparent';
        statusBadge = 'Delivered';
      }

      // 1. Current Hub Pin
      const hubIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
          ${order.status !== 'delivered' ? `
            <div class="absolute -inset-2 rounded-full animate-ping opacity-75" style="background-color: ${pulseColor};"></div>
          ` : ''}
          <div class="w-9 h-9 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-white font-bold text-xs" style="background-color: ${pinColor}; box-shadow: 0 4px 12px ${pinColor}55;">
            <span>${courier.logoInitial}</span>
          </div>
          <div class="absolute -bottom-5 bg-slate-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shadow backdrop-blur-xs flex items-center gap-1 border border-slate-700/50">
            <span>${order.label.slice(0, 16)}</span>
          </div>
        </div>
      `;

      const hubIcon = L.divIcon({
        html: hubIconHtml,
        className: 'custom-hub-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const hubMarker = L.marker(order.currentCoords, { icon: hubIcon });

      // Interactive popup
      const popupHtml = `
        <div class="p-1 min-w-[220px] font-sans">
          <div class="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
            <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${shop.badgeBg}">
              ${shop.name}
            </span>
            <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              ${courier.name}
            </span>
          </div>
          <div class="mb-1.5">
            ${order.isLiveTracking 
              ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 Live tracking</span>'
              : '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">🟡 Demo data — not live</span>'
            }
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-tight mb-1">${order.label}</h4>
          <div class="text-[11px] text-slate-600 mb-2">
            <span class="font-medium text-slate-400">Tracking:</span> <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">${order.trackingId}</code>
          </div>
          <div class="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2 mb-2.5">
            <div class="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
              📍 Last Seen Scan:
            </div>
            <div class="text-[11px] text-amber-800 font-medium">
              ${order.currentCity}
            </div>
            <div class="text-[10px] text-amber-600">
              ${order.lastUpdated}
            </div>
          </div>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span class="text-slate-500">Expected:</span>
            <span class="font-semibold text-indigo-700">${order.expectedDate}</span>
          </div>
          <button id="btn-timeline-${order.id}" class="mt-2.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors text-center cursor-pointer">
            View Journey Timeline →
          </button>
        </div>
      `;

      hubMarker.bindPopup(popupHtml, { maxWidth: 280, className: 'custom-leaflet-popup' });

      hubMarker.on('click', () => {
        onSelectOrder(order.id);
      });

      hubMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-timeline-${order.id}`);
        if (btn) {
          btn.onclick = () => onOpenTimeline(order);
        }
      });

      markersLayer.addLayer(hubMarker);
      bounds.extend(order.currentCoords);

      // 2. Destination Marker (Flag / Home Pin)
      const destIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-md">
            🏁
          </div>
        </div>
      `;

      const destIcon = L.divIcon({
        html: destIconHtml,
        className: 'custom-dest-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const destMarker = L.marker(order.destinationCoords, { icon: destIcon });
      destMarker.bindTooltip(`Destination: ${order.destinationCity} (${order.destinationPincode})`, {
        direction: 'top',
        className: 'custom-tooltip',
      });
      markersLayer.addLayer(destMarker);
      bounds.extend(order.destinationCoords);

      // 3. Journey Route Polyline
      // Line from Origin -> Current Hub
      const passedLine = L.polyline([order.originCoords, order.currentCoords], {
        color: isSelected ? '#4338CA' : pinColor,
        weight: isSelected ? 4 : 2.5,
        opacity: isSelected ? 0.9 : 0.6,
      });

      // Line from Current Hub -> Destination (Dashed)
      const remainingLine = L.polyline([order.currentCoords, order.destinationCoords], {
        color: isSelected ? '#4338CA' : '#94A3B8',
        weight: isSelected ? 3.5 : 2,
        dashArray: '6, 8',
        opacity: isSelected ? 0.8 : 0.5,
      });

      polylinesLayer.addLayer(passedLine);
      polylinesLayer.addLayer(remainingLine);
    });

    // If an order is explicitly selected, zoom and pan to it
    if (selectedOrderId) {
      const selected = orders.find(o => o.id === selectedOrderId);
      if (selected) {
        const orderBounds = L.latLngBounds([selected.originCoords, selected.currentCoords, selected.destinationCoords]);
        map.fitBounds(orderBounds, { padding: [60, 60], maxZoom: 8, animate: true });
      }
    } else if (bounds.isValid() && orders.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [orders, selectedOrderId]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.5, 78.9], 5, { animate: true });
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current && orders.length > 0) {
      const allBounds = L.latLngBounds(orders.flatMap(o => [o.currentCoords, o.destinationCoords]));
      mapInstanceRef.current.fitBounds(allBounds, { padding: [50, 50], maxZoom: 7, animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Header Floating Overlay */}
      <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-sm border border-slate-200/70 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-800">
            India Logistics Hub Map
          </span>
        </div>
        <div className="h-4 w-[1px] bg-slate-200"></div>
        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
          {orders.length === 0 ? 'Ready for shipments • Add tracking ID below' : `${orders.length} active shipments mapped`}
        </span>
      </div>

      {/* Hub GPS Notice Overlay */}
      <div className="absolute bottom-3 left-3 z-20 max-w-xs bg-slate-900/85 backdrop-blur-md text-white text-[11px] px-3 py-2 rounded-xl shadow-md border border-slate-700/60 hidden sm:flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-tight">
          <span className="font-semibold text-amber-300">Courier Hub Scans:</span> Pins indicate the last scanned hub city (e.g. Jaipur, Bhiwandi), not real-time GPS.
        </div>
      </div>

      {/* Floating Action Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleFitAll}
          title="Fit all shipments"
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 p-2 rounded-xl shadow-sm border border-slate-200/80 transition-all text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
        <button
          onClick={handleResetView}
          title="Reset to India view"
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 p-2 rounded-xl shadow-sm border border-slate-200/80 transition-all text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Reset Map</span>
        </button>
      </div>

      {/* Status Legend */}
      <div className="absolute bottom-3 right-14 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/70 hidden md:flex items-center gap-3 text-[11px] font-medium text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Out for delivery</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
          <span>In transit</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>At hub</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span>Delivered</span>
        </div>
      </div>
    </div>
  );
};
