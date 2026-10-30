import React from 'react';
import { 
  PlayCircle, 
  FileText, 
  Gamepad2, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  GraduationCap, 
  Award,
  Wifi,
  Clock,
  BookOpen
} from 'lucide-react';
import { Hero } from './Hero';
import { Lesson, EventItem } from '../types';

interface HomeViewProps {
  onNavigate: (tab: string, classFilter?: string) => void;
  onOpenKahoot: () => void;
  onSearch: (query: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onRegisterEvent: (event: EventItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenKahoot,
  onSearch,
  onSelectLesson,
  onRegisterEvent,
}) => {
  // 3 Curated Spotlight Items (Uncluttered & Clean!)
  const featuredLessons = [
    {
      id: 'spotlight-1',
      badge: 'Primary Seven (P.7) · PLE Focus',
      badgeColor: 'bg-amber-100 text-amber-800',
      title: 'Solving Word Problems using 3-Set Venn Diagrams',
      subject: 'Mathematics',
      teacher: 'Tr. Ojok Mtn',
      duration: '18 mins',
      thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
      description: 'Master UNEB Section B Venn diagram questions with systematic step-by-step methods.',
      actionClass: 'P7',
    },
    {
      id: 'spotlight-2',
      badge: 'Senior Four (S.4) · UCE Focus',
      badgeColor: 'bg-blue-100 text-blue-800',
      title: 'Geometrical Optics: Curved Mirrors & Snell\'s Law',
      subject: 'Physics',
      teacher: 'Tr. Mugisha Ronald',
      duration: '28 mins',
      thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
      description: 'Concave and convex mirror ray diagrams, focal lengths, and real-life refraction experiments.',
      actionClass: 'S4',
    },
    {
      id: 'spotlight-3',
      badge: 'Primary & Secondary · National Event',
      badgeColor: 'bg-purple-100 text-purple-800',
      title: 'National Mathematics Kahoot Quiz Championship 2026',
      subject: 'Academic Competition',
      teacher: 'Uganda Educators Guild',
      duration: 'Saturday, Nov 14',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      description: 'Compete live with students across Uganda for scholastic prizes, bursaries, and medals!',
      isEvent: true,
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <Hero
        onNavigate={onNavigate}
        onOpenKahoot={onOpenKahoot}
        onSearch={onSearch}
      />

      {/* 2. CHOOSE YOUR LEARNING PATH (SPACIOUS & UNCLUTTERED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            Choose Your Level
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Where would you like to learn today?
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Tap your class level below to go directly to organized subjects and lessons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Primary Gateway Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                  Primary Level
                </span>
                <span className="text-xs font-bold text-amber-800">7 Classes Available</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                Primary Education (P.1 to P.7)
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Complete coverage of Mathematics, Integrated Science, Social Studies, and English Language. Featuring dedicated PLE candidate exam drills for P.7.
              </p>

              {/* Class Pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7 (PLE)'].map((pClass, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('primary', `P${idx + 1}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-500 hover:text-white border border-amber-200 text-xs font-bold text-slate-800 transition-all shadow-2xs"
                  >
                    {pClass}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/60 flex items-center justify-between">
              <button
                onClick={() => onNavigate('primary')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Enter Primary Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Gateway Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-700 text-white font-black text-xs px-3 py-1 rounded-full uppercase">
                  Secondary Level
                </span>
                <span className="text-xs font-bold text-blue-800">O-Level & A-Level</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                Secondary Education (S.1 to S.6)
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Aligned with the New Lower Secondary Curriculum and UNEB UCE & UACE exam papers. Science practicals, mathematics, and arts humanities.
              </p>

              {/* Class Pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {['S.1', 'S.2', 'S.3', 'S.4 (UCE)', 'S.5', 'S.6 (UACE)'].map((sClass, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('secondary', `S${idx + 1}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-700 hover:text-white border border-blue-200 text-xs font-bold text-slate-800 transition-all shadow-2xs"
                  >
                    {sClass}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-200/60 flex items-center justify-between">
              <button
                onClick={() => onNavigate('secondary')}
                className="bg-blue-700 hover:bg-blue-800 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Enter Secondary Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TODAY'S SPOTLIGHT HIGHLIGHTS (CLEAN 3-CARD SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Recommended Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Featured Lessons & Events
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Top-rated video lessons and academic activities recommended by Teacher Ojok.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('primary')}
              className="text-xs font-bold text-slate-600 hover:text-blue-700 underline"
            >
              Browse all lessons →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredLessons.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 opacity-95"
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{item.duration}</span>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {item.subject}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">
                  {item.teacher}
                </span>

                {item.isEvent ? (
                  <button
                    onClick={() => onNavigate('events')}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                  >
                    View Event
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate(item.actionClass === 'P7' ? 'primary' : 'secondary')}
                    className="bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Watch Now</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THREE PILLARS (DESIGNED FOR UGANDA'S REALITY) */}
      <section className="bg-slate-100/70 py-14 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-slate-600 bg-white px-3 py-1 rounded-full shadow-2xs">
              Smart Learning
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Built for How Ugandan Learners Study
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Thoughtfully engineered to minimize data costs and maximize student performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <Wifi className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg">
                  Data-Saver Video Streaming
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Stream lessons in 240p or 360p modes. Saves up to 70% of mobile data airtime on MTN and Airtel bundles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700">
                ✓ Ultra Low-Bandwidth
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg">
                  Offline PDF Revision Notes
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Download printable summary notes, worksheets, and UNEB past papers once. Read or print them anytime away from screens.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-amber-700">
                ✓ Print & Study Offline
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg">
                  Kahoot-Style Gamified Quizzes
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Fast-paced 30-second multiple-choice questions with colorful buttons, auto-marking, and official Certificates of Achievement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-purple-700">
                ✓ Exciting & Auto-Graded
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. INVITING CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
              100% Free Open Access
            </span>
            <h3 className="text-2xl sm:text-4xl font-black mt-3 leading-tight">
              Start Revising with Expert Ugandan Educators Today
            </h3>
            <p className="text-sm text-blue-100 mt-2 leading-relaxed">
              No subscription fee required for launch. Watch lessons, download past papers, and prepare for UNEB success.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('primary')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl shadow-md transition-all"
            >
              Start Primary (P1–P7)
            </button>
            <button
              onClick={() => onNavigate('secondary')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm px-6 py-3 rounded-2xl transition-all"
            >
              Start Secondary (S1–S6)
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
