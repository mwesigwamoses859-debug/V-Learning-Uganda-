import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, classFilter?: string) => void;
  onOpenDashboard: () => void;
  onOpenKahoot: () => void;
  onOpenAdminLogin: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenDashboard,
  onOpenKahoot,
  onOpenAdminLogin,
  isAdmin,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-white">Video Learning</span>
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full uppercase">
                  Uganda
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Uganda's dedicated digital learning hub offering free video lessons, printable PDF notes, UNEB candidate revision clinics, and interactive Kahoot-style quiz tournaments.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Aligned with UNEB & NCDC National Curriculum standards</span>
            </div>
          </div>

          {/* Primary Quick Links */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
              Primary (P1–P7)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {['P7 (PLE Candidate)', 'P6 Curriculum', 'P5 Upper Primary', 'P4 Intermediate', 'P3 Lower Primary', 'P2 & P1 Foundations'].map((cls, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => onNavigate('primary', `P${7 - idx}`)}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {cls}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Secondary Quick Links */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
              Secondary (S1–S6)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {['S4 (UCE Candidate)', 'S3 Sciences & Arts', 'S2 New Curriculum', 'S1 Orientation', 'S6 (UACE Principal)', 'S5 Subsidiary & GP'].map((cls, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => onNavigate('secondary')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    {cls}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Events */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-white transition-colors">
                  Events & Seminars
                </button>
              </li>
              <li>
                <button onClick={onOpenKahoot} className="hover:text-pink-400 transition-colors">
                  Play Kahoot Quiz Arena
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors">
                  UNEB Past Papers & Notes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  WhatsApp Support Line
                </button>
              </li>
              
              {/* Discreet Staff / Admin Link */}
              <li className="pt-2">
                <button 
                  onClick={isAdmin ? onOpenDashboard : onOpenAdminLogin} 
                  className="hover:text-amber-400 text-slate-500 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>{isAdmin ? 'Admin Console & Gradebook' : 'Educator Staff Login'}</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Video Learning Uganda. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Ugandan learners with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by Moses & Teacher Ojok
          </p>
        </div>

      </div>
    </footer>
  );
};
