import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  PlayCircle, 
  FileDown, 
  Calendar, 
  Gamepad2, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Layers,
  Flame,
  Award
} from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string, classFilter?: string) => void;
  onOpenKahoot: () => void;
  onSearch: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigate,
  onOpenKahoot,
  onSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/30 via-indigo-200/20 to-amber-200/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Built by Ugandan Educators for Primary & Secondary Learners</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight sm:leading-none">
            Uganda's Quality{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500">
              Video Lessons, PDF Notes
            </span>{' '}
            & Academic Events
          </h1>
          
          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Free high-quality revision for <strong>Primary (P1–P7)</strong> and <strong>Secondary (S1–S6)</strong>. 
            Watch expert video explanations, download printable UNEB past papers, and compete in Kahoot-style quiz tournaments.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-2xl shadow-xl shadow-blue-500/5 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by class or subject (e.g. 'P.7 Science', 'S.4 Physics', 'Venn Diagrams')..."
              className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:outline-hidden"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Quick search suggestion tags */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Quick Searches:</span>
            {['P7 Mathematics', 'P7 Science', 'S4 Physics', 'S4 Chemistry', 'UNEB Past Papers'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchInput(tag);
                  onSearch(tag);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Feature Gateways */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. Primary Hub */}
          <div 
            onClick={() => onNavigate('primary')}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
                P1-7
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Primary Learning
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Full syllabus for P.1 to P.7. Mathematics, Integrated Science, English, and SST with PLE candidate drills.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Explore P1–P7 Classes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Secondary Hub */}
          <div 
            onClick={() => onNavigate('secondary')}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
                S1-6
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Secondary Learning
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                O-Level (S1–S4) and A-Level (S5–S6). Sciences, Arts, New Lower Secondary activities & UCE/UACE preparation.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Explore S1–S6 Classes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Events & Seminars */}
          <div 
            onClick={() => onNavigate('events')}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Events & Seminars
                </h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Live quiz competitions, national UNEB candidate seminars, teacher masterclasses, and photo/video recaps.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>View Upcoming Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Kahoot Quiz Arena */}
          <div 
            onClick={onOpenKahoot}
            className="group relative bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Background shape flair */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl group-hover:scale-125 transition-transform" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-800/80 text-pink-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Kahoot Arena
                </h3>
                <span className="bg-pink-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  GAME
                </span>
              </div>
              <p className="mt-2 text-sm text-purple-200">
                Play fast-paced, timed revision quizzes with 4 colorful shape buttons, streak bonuses, and live leaderboards!
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-800 flex items-center justify-between text-xs font-bold text-pink-300">
              <span>Start Quick Challenge</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">100% Free</span>
            <span className="text-xs text-slate-500 font-medium mt-1">Open Access for All Ugandan Learners</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">Data-Saver</span>
            <span className="text-xs text-slate-500 font-medium mt-1">240p/360p Low-Bandwidth Mode</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">Offline PDFs</span>
            <span className="text-xs text-slate-500 font-medium mt-1">Printable Notes & Past Papers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">UNEB Ready</span>
            <span className="text-xs text-slate-500 font-medium mt-1">PLE, UCE & UACE Aligned</span>
          </div>
        </div>

      </div>
    </section>
  );
};
