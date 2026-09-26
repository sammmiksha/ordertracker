import React, { useState } from 'react';
import { Order, TimelineGroup } from '../types';
import { COURIER_META } from '../utils/courierDetector';
import { SHOP_META } from '../utils/shopMeta';
import { 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Truck, 
  CheckCircle2, 
  Package, 
  Navigation,
  Trash2,
  AlertCircle,
  Plus
} from 'lucide-react';

interface DeliveryListProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  onOpenTimeline: (order: Order) => void;
  onAdvanceScan: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenAddModal: () => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onOpenTimeline,
  onAdvanceScan,
  onDeleteOrder,
  onOpenAddModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'tomorrow' | 'later' | 'delivered'>('all');

  const handleCopy = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(trackingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groupLabels: Record<TimelineGroup, { title: string; subtitle: string; icon: React.ReactNode; color: string }> = {
    today: {
      title: 'Arriving Today',
      subtitle: 'Expected at your doorstep today',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    tomorrow: {
      title: 'Arriving Tomorrow',
      subtitle: 'In local transit for delivery tomorrow',
      icon: <Clock className="w-4 h-4 text-indigo-600" />,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    later: {
      title: 'Later this Week',
      subtitle: 'Moving through trunk linehaul hubs',
      icon: <Truck className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    delivered: {
      title: 'Delivered Packages',
      subtitle: 'Successfully handed over to recipient',
      icon: <CheckCircle2 className="w-4 h-4 text-slate-500" />,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const groups: TimelineGroup[] = ['today', 'tomorrow', 'later', 'delivered'];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.timelineGroup === activeTab);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Out for Delivery
          </span>
        );
      case 'reached_hub':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Reached Local Hub
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Delivered
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3 h-3" />
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            In Transit
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-lg">Delivery Timeline</h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {orders.length} Parcels
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-white text-emerald-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today ({orders.filter(o => o.timelineGroup === 'today').length})
          </button>
          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tomorrow'
                ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tomorrow ({orders.filter(o => o.timelineGroup === 'tomorrow').length})
          </button>
          <button
            onClick={() => setActiveTab('later')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'later'
                ? 'bg-white text-amber-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Later ({orders.filter(o => o.timelineGroup === 'later').length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'delivered'
                ? 'bg-white text-slate-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered ({orders.filter(o => o.timelineGroup === 'delivered').length})
          </button>
        </div>
      </div>

      {/* When no orders exist in list */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No Shipments Tracked Yet</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Add your tracking ID from <strong>Ajio, Meesho, Nike, Delhivery, Xpressbees, Blue Dart</strong>, or any Indian courier to see it plotted on the map.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-5 px-6 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Track Your First Order</span>
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No parcels found in this timeline tab.</p>
          <p className="text-xs text-slate-400 mt-1">Switch to "All" to view all your shipments.</p>
        </div>
      ) : (
        groups.map(group => {
          const groupOrders = filteredOrders.filter(o => o.timelineGroup === group);
          if (groupOrders.length === 0) return null;

          const meta = groupLabels[group];

          return (
            <div key={group} className="space-y-3">
              {/* Group Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {meta.icon}
                  <h4 className="font-bold text-slate-900 text-base">{meta.title}</h4>
                  <span className="text-xs text-slate-500 font-normal">({groupOrders.length})</span>
                </div>
                <span className="text-xs text-slate-500 hidden sm:inline">{meta.subtitle}</span>
              </div>

              {/* Grid of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupOrders.map(order => {
                  const courier = COURIER_META[order.courier] || COURIER_META.other;
                  const shop = SHOP_META[order.shop] || SHOP_META.other;
                  const isSelected = order.id === selectedOrderId;

                  return (
                    <div
                      key={order.id}
                      className={`relative bg-white rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Top Meta: Shop Badge & Courier Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md ${shop.badgeBg}`}>
                              {shop.name}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${courier.badgeBg} ${courier.badgeColor}`}>
                              {courier.name}
                            </span>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        {/* Order Label & Expected Time */}
                        <div className="mb-2">
                          <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                            {order.label}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-700">Expected:</span>
                            <span className="text-indigo-600 font-semibold">{order.expectedDate}</span>
                          </div>
                        </div>

                        {/* Hub Scan Info */}
                        <div className="bg-slate-50 rounded-xl p-2.5 mb-3 border border-slate-100">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                                <span className="truncate">Last Seen Hub:</span>
                                <span className="text-[10px] font-normal text-slate-500 shrink-0">{order.lastUpdated}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {order.currentCity}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                Destination: {order.destinationCity}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tracking ID with 1-click Copy */}
                        <div className="flex items-center justify-between text-xs bg-slate-50/70 border border-slate-200/60 rounded-lg px-2.5 py-1.5 mb-3 font-mono">
                          <span className="text-slate-400 text-[10px] font-sans uppercase tracking-wider">AWB:</span>
                          <span className="text-slate-800 font-medium select-all">{order.trackingId}</span>
                          <button
                            onClick={() => handleCopy(order.trackingId)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 cursor-pointer"
                            title="Copy Tracking ID"
                          >
                            {copiedId === order.trackingId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectOrder(order.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                          >
                            <Navigation className="w-3 h-3" />
                            <span>{isSelected ? 'Focused' : 'Map'}</span>
                          </button>
                          
                          <button
                            onClick={() => onOpenTimeline(order)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Events ({order.events.length})</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => onAdvanceScan(order.id)}
                              title="Advance Scan"
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                            >
                              + Next Scan
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            title="Remove Parcel"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
