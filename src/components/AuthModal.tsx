import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Lock, 
  CheckCircle2, 
  GraduationCap, 
  ArrowRight,
  School
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: { name: string; phone: string; role: string }) => void;
  currentUser: { name: string; phone: string; role: string } | null;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLogin,
  currentUser,
  onLogout,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState('Learner');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onLogin({ name, phone, role });
    onClose();
  };

  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-black text-xl">
            {currentUser.name.charAt(0)}
          </div>
          <h3 className="text-xl font-black text-slate-900">{currentUser.name}</h3>
          <p className="text-xs text-slate-500 font-mono">{currentUser.phone} · Role: {currentUser.role}</p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Saved Video Lessons:</span>
              <span className="font-bold text-blue-700">4 Completed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Kahoot Quizzes Played:</span>
              <span className="font-bold text-purple-700">8 Challenges</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Events Registered:</span>
              <span className="font-bold text-emerald-700">1 Upcoming</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold">
            {isRegistering ? 'Create Learner Account' : 'Welcome to Video Learning'}
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Access free video lessons, track quiz scores & register for seminars.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Your Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. Moses Mwesigwa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phone Number (MTN / Airtel) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                placeholder="0772 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                School Name
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Makerere College School"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all shadow-md text-sm"
          >
            {isRegistering ? 'Sign Up for Free' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New here? Create free account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
