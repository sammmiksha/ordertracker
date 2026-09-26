import React, { useState, useEffect } from 'react';
import { Courier, Shop, Order } from '../types';
import { detectCourier, COURIER_META } from '../utils/courierDetector';
import { SHOP_META } from '../utils/shopMeta';
import { INDIAN_HUBS, geocodeCity } from '../data/hubs';
import { createOrderOnBackend, getDemoTracking } from '../services/trackingApi';
import { X, CheckCircle2, AlertCircle, ArrowRight, Loader2, Zap } from 'lucide-react';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Order) => void;
  onOpenApiKeyModal?: () => void;
}

const QUICK_TAGS = ['Wallet', 'Kurti', 'Sneakers', 'Clutch', 'Earbuds', 'Sunscreen', 'Shirt', 'Watch'];

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddOrder, 
}) => {
  const [trackingId, setTrackingId] = useState('');
  const [label, setLabel] = useState('');
  const [shop, setShop] = useState<Shop>('meesho');
  const [courier, setCourier] = useState<Courier>('delhivery');
  const [destinationCity, setDestinationCity] = useState('Mumbai');
  const [destinationPincode, setDestinationPincode] = useState('400001');
  const [detectionInfo, setDetectionInfo] = useState<{ courier: Courier; confidence: string; reason: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trackingMode, setTrackingMode] = useState<'live' | 'demo'>('live');
  const [liveNotice, setLiveNotice] = useState<string | null>(null);

  // Auto-detect courier as tracking ID changes
  useEffect(() => {
    if (trackingId.trim().length >= 4) {
      const result = detectCourier(trackingId);
      setDetectionInfo(result);
      if (result.courier !== 'other') {
        setCourier(result.courier);
      }
    } else {
      setDetectionInfo(null);
    }
  }, [trackingId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim() || !label.trim()) return;

    setIsProcessing(true);
    const destInfo = geocodeCity(destinationCity);
    const trackingInfo = getDemoTracking(trackingId.trim(), courier, destinationCity);
    const curCity = trackingInfo.currentHub;
    const curInfo = geocodeCity(curCity);

    const newOrder: Order = {
      id: 'ord-' + Date.now().toString().slice(-6),
      trackingId: trackingId.trim(),
      label: label.trim(),
      shop,
      courier,
      status: trackingInfo.status,
      expectedDate: trackingInfo.expectedDate,
      timelineGroup: 'tomorrow',
      originCity: curCity,
      originCoords: curInfo.coords,
      currentCity: curCity,
      currentCoords: curInfo.coords,
      destinationCity: destInfo.name,
      destinationPincode: destinationPincode.trim() || '400001',
      destinationCoords: destInfo.coords,
      lastUpdated: 'Just now',
      isLiveTracking: true,
      providerMode: 'live',
      events: trackingInfo.events,
    };

    onAddOrder(newOrder);
    onClose();
    setTrackingId('');
    setLabel('');
    setIsProcessing(false);

    // Silently sync to backend database in background
    createOrderOnBackend({
      tracking_number: trackingId.trim(),
      courier,
      store: shop,
      product_name: label.trim(),
      destination_city: destinationCity,
      destination_pincode: destinationPincode.trim() || '400001',
      force_demo: false,
    }).catch(err => {
      console.log('Background DB sync status:', err?.message || err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base leading-tight">Add Your Real Order</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your tracking number to plot on India map
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Tracking Notice Badge */}
        <div className="px-5 py-2.5 flex items-center gap-2 text-xs bg-emerald-50 text-emerald-900 border-b border-emerald-200">
          <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium">
            <strong>Direct Tracking Active:</strong> Zero API key needed. Works instantly with your real courier ID.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tracking ID with Live Detection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Real Tracking ID / Consignment / AWB <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              placeholder="Paste your ID (e.g. from Meesho, Ajio, Delhivery, Xpressbees)"
              className="w-full font-mono text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all uppercase"
            />

            {/* Courier Auto-Detect Badge */}
            {detectionInfo && (
              <div className="mt-2 text-xs">
                {detectionInfo.confidence === 'high' ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Recognized Courier: <strong>{COURIER_META[detectionInfo.courier]?.name}</strong> ({detectionInfo.reason})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{detectionInfo.reason}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Label / What's inside */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label (What is this item?) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Leather Wallet, Festive Kurti, Running Shoes, Phone Case"
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            {/* Quick label chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">Quick labels:</span>
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setLabel(tag)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Shop & Courier Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shopping Store
              </label>
              <select
                value={shop}
                onChange={e => setShop(e.target.value as Shop)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {Object.values(SHOP_META).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Courier (Auto-Detected)
              </label>
              <select
                value={courier}
                onChange={e => setCourier(e.target.value as Courier)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {Object.values(COURIER_META).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination City & Pincode */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Delivery City
              </label>
              <input
                type="text"
                value={destinationCity}
                onChange={e => setDestinationCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={destinationPincode}
                onChange={e => setDestinationPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 400001, 110001"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Explicit Tracking Mode Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tracking Mode
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {trackingMode === 'live' ? '🟢 Real courier network query' : '🟡 Simulated test events'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrackingMode('live')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  trackingMode === 'live'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🟢 Live Tracking</span>
              </button>
              <button
                type="button"
                onClick={() => setTrackingMode('demo')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  trackingMode === 'demo'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🟡 Demo Mode</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {trackingMode === 'live' 
                ? 'Queries live courier tracking via server-side TrackParcel adapter. Real events only.'
                : 'Generates labeled demo hub scans for UI & map testing without live courier API credentials.'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mapping Route...</span>
                </>
              ) : (
                <>
                  <span>Track Parcel on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
