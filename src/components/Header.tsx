import React from 'react';
import { 
  Package, 
  Plus, 
  Smartphone, 
  Zap, 
  LogOut, 
  UserCheck, 
  Truck, 
  CheckCircle, 
  RefreshCw,
  Key 
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenPhoneModal: () => void;
  onOpenApiKeyModal: () => void;
  onTriggerPoller: () => void;
  isPolling: boolean;
  userPhone: string | null;
  onLogout: () => void;
  hasApiKey: boolean;
  activeCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenPhoneModal,
  onOpenApiKeyModal,
  onTriggerPoller,
  isPolling,
  userPhone,
  onLogout,
  hasApiKey,
  activeCount,
  outForDeliveryCount,
  deliveredCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  OrderTracker
                </h1>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  🇮🇳 India Hubs
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real parcel tracking for Ajio, Meesho, Nykaa, Nike & more
              </p>
            </div>
          </div>

          {/* Metrics Pills */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">Today:</span>
              <span className="font-bold text-emerald-700">{outForDeliveryCount}</span>
            </div>
            <div className="h-3 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500">In Transit:</span>
              <span className="font-bold text-slate-800">{activeCount}</span>
            </div>
            <div className="h-3 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Delivered:</span>
              <span className="font-bold text-slate-800">{deliveredCount}</span>
            </div>
          </div>

          {/* Action & Auth Controls */}
          <div className="flex items-center gap-2 flex-wrap">


            {/* Refresh / Poller Button */}
            <button
              onClick={onTriggerPoller}
              disabled={isPolling}
              title="Refresh tracking status"
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* User Auth (Phone Login) */}
            {userPhone ? (
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 px-2 py-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{userPhone}</span>
                </span>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenPhoneModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sign In (+91)</span>
              </button>
            )}

            {/* Add Real Order Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Order</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
