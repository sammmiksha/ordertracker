import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, CheckCircle2, ShieldCheck, X, Sparkles, Check, Zap, HelpCircle } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey } from '../services/trackingApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string | null) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const existing = getStoredApiKey();
    if (existing) {
      setApiKey(existing);
      setHasExistingKey(true);
    } else {
      setApiKey('');
      setHasExistingKey(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setStatusMessage({ text: 'Please paste your 17token or close to use Direct Mode.', type: 'error' });
      return;
    }

    setStoredApiKey(apiKey.trim());
    setHasExistingKey(true);
    setStatusMessage({ text: 'API Key saved successfully! Live carrier sync is active.', type: 'success' });
    onKeySaved(apiKey.trim());
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    removeStoredApiKey();
    setApiKey('');
    setHasExistingKey(false);
    setStatusMessage({ text: 'Switched back to Direct Smart Mode (No API key needed).', type: 'info' });
    onKeySaved(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">API Key & Tracking Modes</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  200 Free Orders
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Where to find your key + Free Unlimited alternatives
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

        {/* Alternative 1: Direct Mode Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 p-4">
          <div className="flex items-start gap-2.5">
            <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 leading-relaxed">
              <strong className="font-bold">Alternative: Direct Mode (100% Free & Unlimited)</strong>
              <p className="mt-0.5 text-emerald-900">
                You <strong>do not need any API key</strong> to track packages! Our built-in Direct Mode automatically recognizes <strong>Delhivery, Xpressbees, Blue Dart, Shadowfax, DTDC</strong>, geocodes their Indian hub stops, and maps your routes with zero quota limits.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Finding the API Key (Exact Location) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Where to find the 17TRACK API Key:</span>
            </div>

            <ol className="space-y-2 text-xs list-decimal pl-4 text-slate-600 leading-relaxed">
              <li>
                Log into your dashboard and click directly here:{' '}
                <a
                  href="https://api.17track.net/admin/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  api.17track.net/admin/settings <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                In the left sidebar, click <strong>Settings</strong>.
              </li>
              <li>
                Look for the <strong>Security Credentials</strong> card. Your key is labeled <strong>"Security Key"</strong> or <strong>"17token"</strong> (a 32-character string).
              </li>
              <li>
                Click the <strong>Copy</strong> icon next to it and paste it below.
              </li>
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900">
              <span className="font-bold">Free Quota Note:</span> New accounts get an allocation of <strong>200 free trackings</strong> (as stated in the official v2.4 terms).
            </div>
          </div>

          {/* Form to paste key */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Paste Your 17TRACK Token (Optional):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Paste your 17token here (e.g. 5D8A392F810C4B...)"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
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

            <div className="flex items-center justify-between gap-3 pt-1">
              {hasExistingKey ? (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Use Direct Mode (Disconnect Key)
                </button>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Direct Smart Mode is active by default.
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Token</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
