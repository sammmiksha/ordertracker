import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Zap, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Server, 
  Database, 
  Radio, 
  RefreshCw 
} from 'lucide-react';
import { 
  getStoredApiKey, 
  setStoredApiKey, 
  removeStoredApiKey, 
  DEFAULT_RAPIDAPI_KEY,
  checkBackendHealth
} from '../services/trackingApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string | null) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; provider: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const existing = getStoredApiKey() || DEFAULT_RAPIDAPI_KEY;
    setApiKey(existing);

    // Check backend health
    checkHealth();
  }, [isOpen]);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const health = await checkBackendHealth();
      setBackendStatus({
        connected: health?.database_connected || false,
        provider: health?.active_provider || 'RapidAPI Live Tracker'
      });
    } catch (e) {
      setBackendStatus({
        connected: false,
        provider: 'Offline'
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setStatusMessage({ text: 'Please enter a valid RapidAPI Key.', type: 'error' });
      return;
    }

    setStoredApiKey(apiKey.trim());
    setStatusMessage({ text: 'RapidAPI key updated & saved successfully!', type: 'success' });
    onKeySaved(apiKey.trim());
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    setStoredApiKey(DEFAULT_RAPIDAPI_KEY);
    setApiKey(DEFAULT_RAPIDAPI_KEY);
    setStatusMessage({ text: 'Reset to configured RapidAPI key.', type: 'info' });
    onKeySaved(DEFAULT_RAPIDAPI_KEY);
  };

  const maskedKey = apiKey.length > 12 
    ? `${apiKey.slice(0, 8)}${'•'.repeat(apiKey.length - 12)}${apiKey.slice(-4)}`
    : apiKey;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Carrier API Key & Status</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active & Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                RapidAPI Cheap Tracking Status • Multi-Carrier Live Hub Scans
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Active Connection Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-emerald-950 text-sm">
                    RapidAPI Cheap Tracking Status: ACTIVE
                  </h4>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Live Carrier Feeds
                  </span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  Your tracking queries connect to <strong>cheap-tracking-status.p.rapidapi.com</strong> via our secure FastAPI backend. Auto-detects <strong>Evri, Delhivery, Blue Dart, Xpressbees, Shadowfax, DTDC</strong>, and Indian courier networks.
                </p>
              </div>
            </div>
          </div>

          {/* System Health Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">FastAPI Server</span>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${backendStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {backendStatus?.connected ? 'Running (Port 8000)' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Database Storage</span>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  PostgreSQL / SQLite Synced
                </span>
              </div>
            </div>
          </div>

          {/* Active API Key Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active RapidAPI Key
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showKey ? 'Hide' : 'Reveal'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-indigo-300 tracking-wide select-all break-all">
              {showKey ? apiKey : maskedKey}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Host: cheap-tracking-status.p.rapidapi.com</span>
              <span className="text-emerald-400 font-semibold">Protected (Backend Ingestion)</span>
            </div>
          </div>

          {/* Form to update key if user wants */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Replace with Custom RapidAPI Key (Optional)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="df094e98f4msh188dd686203ff64p1a0500jsn385282b18814"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl border text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer"
              >
                Reset to Default Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={checkHealth}
                  disabled={isChecking}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Check Status</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Apply</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
