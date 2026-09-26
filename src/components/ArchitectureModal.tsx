import React, { useState } from 'react';
import { X, Layers, Database, Cpu, MapPin, Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'tables' | 'couriers' | 'phases'>('flow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">OrderTracker Architecture</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical pipeline, data models, and courier integration design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-5 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('flow')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'flow'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Pipeline & How It Works
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Database Schema
          </button>
          <button
            onClick={() => setActiveTab('couriers')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'couriers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Courier Detection & Geocoding
          </button>
          <button
            onClick={() => setActiveTab('phases')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'phases'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Roadmap (Phases 1-3)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Step-by-Step Data Flow</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    Step 1: Order Ingestion
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Manual Entry or Email/SMS</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    User enters a label (e.g. "Wallet", "Kurti") + tracking ID, or connects read-only Gmail to import shipping confirmation emails from Meesho, Ajio, Nike, etc.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    Step 2: Processing Engine
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Parser & Courier Detector</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Regex courier detector identifies Delhivery, Xpressbees, Shadowfax, Blue Dart, or India Post by consignment pattern.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    Step 3: Background Poller & Hub Geocoder
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Scheduled Polling & Geocoding</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Background worker polls aggregator APIs (AfterShip/17TRACK) every 1-2 hours. Geocoder maps hub cities (Jaipur, Bhiwandi, Bilaspur) to coordinates. Stops once delivered.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    Step 4: Smart Presentation
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Leaflet Map + Timeline Buckets</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pins display on India map at the last scanned hub with route lines to destination. Delivery list groups by "Arriving Today", "Tomorrow", or "Later".
                  </p>
                </div>
              </div>

              {/* Realistic Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">No Live GPS Limitation:</span> Couriers only record scan events when bags enter transit hubs. The UI clearly displays "Last seen: Jaipur hub, 2 hrs ago" rather than pseudo-GPS.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Relational Database Models</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-slate-200">Table</th>
                      <th className="p-3 border-b border-slate-200">Key Fields</th>
                      <th className="p-3 border-b border-slate-200">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-mono font-bold text-indigo-600">Users</td>
                      <td className="p-3 font-mono text-slate-600">id, email, notification_settings, created_at</td>
                      <td className="p-3 text-slate-600">Account profiles and push notification tokens</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-indigo-600">Orders</td>
                      <td className="p-3 font-mono text-slate-600">id, user_id, label, shop, courier, tracking_id, dest_pincode, status, expected_date</td>
                      <td className="p-3 text-slate-600">Active and archived customer shipments</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-indigo-600">Events</td>
                      <td className="p-3 font-mono text-slate-600">id, order_id, timestamp, location, status_text, lat, lng, raw_payload</td>
                      <td className="p-3 text-slate-600">Hub scan audit logs with geocoded coordinates</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'couriers' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Courier Auto-Detection Regex</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900">Delhivery:</span>
                  <div className="font-mono text-indigo-600 mt-1">/^\d&#123;12,14&#125;$/</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">12-14 digits starting with 1, 2, 3 or DLV</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900">Xpressbees:</span>
                  <div className="font-mono text-indigo-600 mt-1">/^(14|13)\d&#123;12&#125;$/</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">14 digits beginning with series 14...</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900">Blue Dart:</span>
                  <div className="font-mono text-indigo-600 mt-1">/^\d&#123;8,11&#125;$/</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Standard 8-11 digit Airway Bill (AWB)</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900">Shadowfax:</span>
                  <div className="font-mono text-indigo-600 mt-1">/^SF[A-Z0-9]&#123;8,12&#125;$/</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Starts with SF prefix</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900">India Post:</span>
                  <div className="font-mono text-indigo-600 mt-1">/^[A-Z]&#123;2&#125;\d&#123;9&#125;IN$/</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">13 chars ending in IN (Speed Post)</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900">Ecom Express:</span>
                  <div className="font-mono text-indigo-600 mt-1">/^[89]\d&#123;8,9&#125;$/</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">9-10 digits starting with 8 or 9</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Development Roadmap</h4>
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Phase 1: Manual Prototype (Implemented)</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Paste ID + label, instant courier detection, interactive India Leaflet map, hub scan coordinates, and delivery list grouped by today/tomorrow/later.
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Phase 2: Auto-Import (Implemented Demo)</span>
                  </div>
                  <p className="text-xs text-indigo-800">
                    Email parser extracting Ajio, Meesho, and Nike shipping confirmations + SMS parser. Ready for Google OAuth Gmail read-only connection.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-1">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>Phase 3: Polish & Alerts</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Web push notifications on "Out for delivery", WhatsApp bot forwarder, delay alerts, and family parcel sharing ("Mom's package").
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
