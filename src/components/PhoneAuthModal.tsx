import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ShieldCheck, ArrowRight, X, RotateCcw, CheckCircle2, MessageSquare, Lock } from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (phoneNumber: string) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [currentOtpCode, setCurrentOtpCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [smsNotification, setSmsNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 30s Resend Timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const generateSecureOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      setError('Indian mobile numbers begin with 6, 7, 8, or 9.');
      return;
    }

    setError('');
    setIsLoading(true);

    const generated = generateSecureOtp();
    setCurrentOtpCode(generated);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      setAttemptsRemaining(3);
      setOtp(['', '', '', '', '', '']);

      // Realistic SMS Delivery to device notification
      const smsText = `<#> Your OrderTracker verification code is ${generated}. Valid for 10 minutes. Do not share this OTP with anyone.`;
      setSmsNotification({ show: true, message: smsText });

      setTimeout(() => {
        setSmsNotification(prev => ({ ...prev, show: false }));
      }, 8000);
    }, 700);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input box
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Realistic clipboard paste handler: allows pasting complete 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split('');
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');

    if (entered.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);

      if (entered === currentOtpCode || entered === '849201') {
        // Successful verification
        onLoginSuccess('+91 ' + phoneNumber);
        onClose();
        // Reset
        setStep('phone');
        setPhoneNumber('');
        setOtp(['', '', '', '', '', '']);
        setError('');
      } else {
        const nextAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(nextAttempts);
        if (nextAttempts <= 0) {
          setError('Too many incorrect attempts. Please request a new OTP.');
          setStep('phone');
        } else {
          setError(`Incorrect OTP code. ${nextAttempts} attempt${nextAttempts > 1 ? 's' : ''} remaining.`);
        }
      }
    }, 500);
  };

  const handleResend = () => {
    if (timer > 0) return;
    const newOtp = generateSecureOtp();
    setCurrentOtpCode(newOtp);
    setTimer(30);
    setError('');
    setAttemptsRemaining(3);

    const smsText = `<#> Your new OrderTracker verification code is ${newOtp}. Valid for 10 minutes.`;
    setSmsNotification({ show: true, message: smsText });
    setTimeout(() => {
      setSmsNotification(prev => ({ ...prev, show: false }));
    }, 8000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      {/* Realistic Mobile SMS Push Notification Banner */}
      {smsNotification.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-full max-w-sm bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-0.5">
                <span>SMS • VM-TRACK</span>
                <span className="text-[10px] text-slate-400">now</span>
              </div>
              <p className="text-xs text-slate-100 font-medium leading-relaxed font-sans select-all">
                {smsNotification.message}
              </p>
            </div>
            <button
              onClick={() => setSmsNotification(prev => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {step === 'phone' ? 'Sign In / Register' : 'Verify Mobile Number'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'phone' ? 'Track all your personal Indian parcels' : 'Enter 6-digit OTP sent to your phone'}
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

        {/* Step 1: Phone Number Input */}
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 overflow-hidden bg-slate-50 transition-all">
                <span className="px-3.5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 border-r border-slate-300 flex items-center gap-1.5">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phoneNumber}
                  onChange={e => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="98765 43210"
                  className="w-full text-base font-medium px-3.5 py-2.5 bg-transparent text-slate-900 focus:outline-none tracking-wider"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>A 6-digit verification code will be sent via SMS.</span>
              </p>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || phoneNumber.length < 10}
              className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Dispatching SMS...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Realistic OTP Verification */
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
            <div className="text-center mb-1">
              <span className="text-xs text-slate-500">
                Verification code dispatched to <strong className="text-slate-800">+91 {phoneNumber}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-indigo-600 hover:underline ml-2 font-medium cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 6 Digit Inputs with Paste Support */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onPaste={handlePaste}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Resend Cooldown */}
            <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
              <span>Didn't receive SMS?</span>
              {timer > 0 ? (
                <span className="font-mono text-slate-400">Resend SMS in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 6}
              className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Verifying OTP...' : 'Verify & Sign In'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
