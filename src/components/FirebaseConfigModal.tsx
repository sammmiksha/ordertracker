import React, { useState, useEffect } from 'react';
import { Flame, X, CheckCircle2, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { getStoredFirebaseConfig, saveFirebaseConfig, FirebaseConfig } from '../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [configText, setConfigText] = useState('');
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const existing = getStoredFirebaseConfig();
    if (existing) {
      setConfigText(JSON.stringify(existing, null, 2));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let parsed: any;
      const clean = configText.trim();

      if (clean.startsWith('{')) {
        parsed = JSON.parse(clean);
      } else {
        // Try extracting keys if user pasted: apiKey: "...", projectId: "..."
        const apiKey = clean.match(/apiKey:\s*["']([^"']+)["']/)?.[1] || clean.match(/["']apiKey["']:\s*["']([^"']+)["']/)?.[1];
        const projectId = clean.match(/projectId:\s*["']([^"']+)["']/)?.[1] || clean.match(/["']projectId["']:\s*["']([^"']+)["']/)?.[1];
        const authDomain = clean.match(/authDomain:\s*["']([^"']+)["']/)?.[1] || (projectId ? `${projectId}.firebaseapp.com` : '');

        if (!apiKey || !projectId) {
          throw new Error('Could not find apiKey or projectId. Please paste valid Firebase config.');
        }
        parsed = { apiKey, projectId, authDomain };
      }

      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error('Config must contain at least "apiKey" and "projectId".');
      }

      saveFirebaseConfig({
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket,
        messagingSenderId: parsed.messagingSenderId,
        appId: parsed.appId,
      });

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onConfigSaved();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Invalid JSON format. Please paste valid Firebase web config.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg">
              <Flame className="w-6 h-6 fill-amber-950 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Firebase Phone OTP Setup</h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Real SMS OTP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Send genuine SMS verification codes to Indian mobile numbers
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

        {/* Step by Step Notice */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-950 leading-relaxed">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">How to get your Firebase Web Config in 1 minute:</strong>
              <ol className="list-decimal pl-4 mt-1 space-y-1 text-amber-900">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-950">console.firebase.google.com <ExternalLink className="w-3 h-3 inline" /></a> and create or select your project.</li>
                <li>Go to <strong>Authentication</strong> → <strong>Sign-in method</strong> → Enable <strong>Phone</strong>.</li>
                <li>Go to <strong>Project Settings (⚙️)</strong> → Scroll down to <strong>Your apps</strong> → Click the <strong>Web (&lt;/&gt;)</strong> icon.</li>
                <li>Copy the <code>firebaseConfig</code> object and paste it below.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Paste Your Firebase Config Object (JSON):
            </label>
            <textarea
              rows={8}
              required
              value={configText}
              onChange={e => {
                setConfigText(e.target.value);
                setError('');
              }}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-project-id",\n  "appId": "1:..."\n}`}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all leading-relaxed"
            />
          </div>

          {error && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          {isSaved && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Firebase connected! Real SMS OTP is now active.</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Config is stored securely in your browser.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Firebase Config</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
