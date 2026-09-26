import React from 'react';
import { Order } from '../types';
import { COURIER_META } from '../utils/courierDetector';
import { SHOP_META } from '../utils/shopMeta';
import { X, MapPin, CheckCircle2, Clock, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

interface TimelineModalProps {
  order: Order | null;
  onClose: () => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const courier = COURIER_META[order.courier] || COURIER_META.other;
  const shop = SHOP_META[order.shop] || SHOP_META.other;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md ${shop.badgeBg}`}>
                {shop.name}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${courier.badgeBg} ${courier.badgeColor}`}>
                {courier.name}
              </span>
            </div>
            <h3 className="font-bold text-lg leading-snug">{order.label}</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              AWB: {order.trackingId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
            <span className="font-bold text-indigo-900">Current Status:</span>
            <span className="text-indigo-700 capitalize font-medium">{order.status.replace(/_/g, ' ')}</span>
          </div>
          <div className="text-xs text-indigo-800 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Expected: {order.expectedDate}</span>
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Architecture Explanatory Notice */}
          <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Logistics Scan Note:</span> The map pin sits at the last scanned hub city (<strong>{order.currentCity}</strong>) and moves when new scan events are recorded by {courier.name}.
            </div>
          </div>

          {/* Timeline Vertical Track */}
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {order.events.map((event, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === order.events.length - 1;

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isFirst
                        ? 'bg-indigo-600 border-indigo-200 text-white shadow-md ring-4 ring-indigo-50'
                        : isLast
                        ? 'bg-emerald-600 border-emerald-200 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isFirst ? (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    )}
                  </div>

                  {/* Event Content Card */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        {event.location}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {event.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-400">
                      <span>Hub: {event.hubName}</span>
                      <span className="font-mono text-[10px] text-slate-500">{event.timeAgo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Route: <span className="font-semibold text-slate-700">{order.originCity.split(' ')[0]}</span> → <span className="font-semibold text-slate-700">{order.destinationCity}</span>
          </div>

          {courier.website && (
            <a
              href={courier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Official {courier.name} Tracking</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
