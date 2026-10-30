import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Default secure educator PINs (e.g. 2026 or ojok2026)
  const VALID_PINS = ['2026', 'ojok2026', 'admin', 'teacher'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PINS.includes(pin.trim().toLowerCase())) {
      setError(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black tracking-tight">
            Educator Access Verification
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Restricted to Teacher Ojok & authorized administrative staff only.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Incorrect security PIN. Access denied.</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified! Unlocking Teacher Console...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Enter Administrator Security PIN:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter PIN (Default: 2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default Teacher PIN: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">2026</code>
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Unlock Teacher Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
