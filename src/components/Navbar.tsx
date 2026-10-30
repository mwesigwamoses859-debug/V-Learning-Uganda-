import React, { useState } from 'react';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Calendar, 
  BookOpen, 
  FileText, 
  Gamepad2, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Upload,
  Lock,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenKahoot: () => void;
  onOpenDashboard: () => void;
  onOpenUploadStudio: () => void;
  onOpenAuth: () => void;
  user: { name: string; phone: string; role: string } | null;
  isAdmin: boolean;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenKahoot,
  onOpenDashboard,
  onOpenUploadStudio,
  onOpenAuth,
  user,
  isAdmin,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'primary', label: 'Primary', badge: 'P1-P7' },
    { id: 'secondary', label: 'Secondary', badge: 'S1-S6' },
    { id: 'events', label: 'Events & Seminars', isNew: true },
    { id: 'resources', label: 'Resources & Past Papers' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Uganda announcement ribbon */}
      <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-black text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-ping" />
          <span>🇺🇬 <strong>Uganda National Curriculum Aligned:</strong> Free Open Access for Term 1, 2 & 3 Revision + UNEB Candidate Prep!</span>
        </div>

        {/* If Admin is active, show discreet status indicator */}
        {isAdmin && (
          <div className="hidden md:flex items-center gap-2 bg-black/40 px-2.5 py-0.5 rounded-full text-[11px] text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Active (Tr. Ojok)</span>
            <button 
              onClick={onAdminLogout}
              className="text-white hover:text-red-300 ml-1 underline flex items-center gap-0.5"
              title="Lock Admin Console & Return to Student View"
            >
              <LogOut className="w-3 h-3" />
              <span>Lock</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  Video Learning
                </span>
                <span className="bg-amber-400 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Uganda
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Primary (P1–P7) · Secondary (S1–S6) · Events</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      {item.badge}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500 text-white animate-pulse">
                      HOT
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* ONLY VISIBLE TO LOGGED-IN ADMIN (Moses / Tr. Ojok) */}
            {isAdmin && (
              <>
                <button
                  onClick={onOpenUploadStudio}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all animate-fadeIn"
                  title="Upload a new video lesson for your class"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </button>

                <button
                  onClick={onOpenDashboard}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors animate-fadeIn"
                  title="Teacher & Admin Portal (Tr. Ojok Mtn)"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Console</span>
                </button>
              </>
            )}

            {/* Kahoot Quiz Play Button (Public for all customers) */}
            <button
              onClick={onOpenKahoot}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-1.5 transform hover:scale-105 transition-all"
              title="Play Kahoot-style quiz challenge"
            >
              <Gamepad2 className="w-4 h-4 animate-bounce" />
              <span>Kahoot Quiz</span>
            </button>

            {/* Sign in / Customer profile button */}
            {user ? (
              <button
                onClick={onOpenAuth}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenKahoot}
              className="bg-purple-600 text-white p-2 rounded-lg sm:hidden"
              title="Kahoot"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            
            {/* ONLY VISIBLE ON MOBILE IF ADMIN */}
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUploadStudio();
                  }}
                  className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <Upload className="w-5 h-5" />
                  <span>Teacher Upload Studio</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Admin Console & Gradebook</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenKahoot();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Play Kahoot Quiz Arena</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminLogout();
                }}
                className="w-full bg-red-50 text-red-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Lock Admin Mode</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
