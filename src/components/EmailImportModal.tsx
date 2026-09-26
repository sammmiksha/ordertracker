import React, { useState } from 'react';
import { SAMPLE_EMAILS, parseShippingMessage, createOrderFromParsed, ParsedEmailResult } from '../utils/emailParser';
import { Order } from '../types';
import { SHOP_META } from '../utils/shopMeta';
import { COURIER_META } from '../utils/courierDetector';
import { 
  Mail, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Lock,
  FileText
} from 'lucide-react';

interface EmailImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Order) => void;
}

export const EmailImportModal: React.FC<EmailImportModalProps> = ({ isOpen, onClose, onAddOrder }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SAMPLE_EMAILS[0].id);
  const [inputText, setInputText] = useState<string>(SAMPLE_EMAILS[0].text);
  const [parsedResult, setParsedResult] = useState<ParsedEmailResult>(parseShippingMessage(SAMPLE_EMAILS[0].text));
  const [isGmailConnecting, setIsGmailConnecting] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (sampleId: string) => {
    const sample = SAMPLE_EMAILS.find(s => s.id === sampleId);
    if (sample) {
      setSelectedTemplateId(sample.id);
      setInputText(sample.text);
      setParsedResult(parseShippingMessage(sample.text));
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setParsedResult(parseShippingMessage(text));
  };

  const handleImport = () => {
    const order = createOrderFromParsed(parsedResult);
    onAddOrder(order);
    onClose();
  };

  const handleSimulateGmailConnect = () => {
    setIsGmailConnecting(true);
    setTimeout(() => {
      setIsGmailConnecting(false);
      setGmailConnected(true);
    }, 1200);
  };

  const shop = SHOP_META[parsedResult.shop] || SHOP_META.other;
  const courier = COURIER_META[parsedResult.courier] || COURIER_META.other;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Auto-Import Orders</h3>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Phase 2 Feature
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Extract tracking IDs from shipping emails & courier SMS automatically
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

        {/* Gmail Sync Simulator Callout */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Gmail Read-Only Shipping Sync</span>
                {gmailConnected && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.2 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Filters only shipping notifications. No personal emails are ever read or stored.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateGmailConnect}
            disabled={isGmailConnecting || gmailConnected}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              gmailConnected
                ? 'bg-slate-200 text-slate-600 cursor-default'
                : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs'
            }`}
          >
            {isGmailConnecting ? 'Connecting...' : gmailConnected ? 'Sync Active' : 'Connect Gmail'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Sample Selectors */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Choose an Email / SMS Template to Test:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_EMAILS.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectTemplate(sample.id)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                    selectedTemplateId === sample.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-slate-800 truncate">{sample.source}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{sample.preview}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Raw Shipping Confirmation Message:
              </label>
              <span className="text-[11px] text-slate-400">You can also paste your own email/SMS</span>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={e => handleTextChange(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all leading-relaxed"
            />
          </div>

          {/* Real-time Extracted Data Preview Box */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Auto-Extracted Order Entities:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Item Label</span>
                <span className="font-bold text-slate-900 truncate block">{parsedResult.label}</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Shopping App</span>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${shop.badgeBg}`}>
                  {shop.name}
                </span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Carrier Partner</span>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${courier.badgeBg} ${courier.badgeColor}`}>
                  {courier.name}
                </span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tracking Number</span>
                <span className="font-mono font-bold text-slate-900 truncate block">{parsedResult.trackingId}</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Destination</span>
                <span className="font-bold text-slate-900 truncate block">{parsedResult.destinationCity}</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Delivery Estimate</span>
                <span className="font-bold text-indigo-700 truncate block">{parsedResult.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100/70 p-2.5 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Zero account passwords needed. Operates purely through courier tracking numbers sent to your inbox.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleImport}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Import Extracted Order to Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
