import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Download, 
  PlayCircle, 
  Image as ImageIcon, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { EVENTS_DATA } from '../data/mockData';
import { EventItem, EventType, EventAudience, EventStatus } from '../types';

interface EventsSectionProps {
  onRegisterEvent: (event: EventItem) => void;
  onOpenEventDetail: (event: EventItem) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  onRegisterEvent,
  onOpenEventDetail,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | EventStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | EventType>('All');
  const [audienceFilter, setAudienceFilter] = useState<'All' | EventAudience>('All');

  const filteredEvents = EVENTS_DATA.filter((evt) => {
    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
    const matchesType = typeFilter === 'All' || evt.type === typeFilter;
    const matchesAudience = audienceFilter === 'All' || evt.audience === audienceFilter;
    return matchesStatus && matchesType && matchesAudience;
  });

  return (
    <section className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Events & Seminars Centre</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Competitions, Seminars & Workshops
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Participate in live quiz competitions, subject preparation clinics, and masterclasses across Uganda. Access event recordings, photo albums, and study handouts.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            
            {/* Status Tabs: All, Upcoming, Past */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
              {(['All', 'Upcoming', 'Past Event'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'All' ? 'All Events' : status === 'Upcoming' ? '📅 Upcoming Events' : '📸 Past Events & Gallery'}
                </button>
              ))}
            </div>

            {/* Audience Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Audience:</span>
              {(['All', 'Primary', 'Secondary', 'Teachers'] as const).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    audienceFilter === aud
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>

          </div>

          {/* Event Type Tags */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-slate-500">Filter Type:</span>
            {(['All', 'Quiz Competition', 'Seminar', 'Workshop'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium shrink-0 ${
                  typeFilter === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const isUpcoming = evt.status === 'Upcoming';

            return (
              <div 
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Event Banner */}
                  <div className="relative aspect-video sm:aspect-21/9 overflow-hidden bg-slate-900 group">
                    <img 
                      src={evt.bannerImage} 
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${
                        isUpcoming 
                          ? 'bg-emerald-500 text-white animate-pulse' 
                          : 'bg-slate-800/90 text-slate-200'
                      }`}>
                        {isUpcoming ? '● Upcoming' : 'Completed Event'}
                      </span>

                      <span className="bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {evt.type}
                      </span>
                    </div>

                    {/* Audience badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                        {evt.audience}
                      </span>
                    </div>

                    {/* Past Event Media indicator */}
                    {!isUpcoming && evt.photos && (
                      <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{evt.photos.length} Photos & Video</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                      {evt.title}
                    </h3>

                    {/* Key Logistics */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="line-clamp-1">{evt.venue}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {evt.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Organiser: <strong>{evt.organizer}</strong></span>
                      {isUpcoming && evt.maxRegistrations && (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                          {evt.currentRegistrations}/{evt.maxRegistrations} Registered
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 pt-0 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenEventDetail(evt)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>View Full Details & Materials</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {isUpcoming ? (
                    <button
                      onClick={() => onRegisterEvent(evt)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 transform hover:scale-105"
                    >
                      <Users className="w-4 h-4" />
                      <span>Register Now (Free)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenEventDetail(evt)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>View Photo Album</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Child Protection / Permission Footer Note */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3.5 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <strong className="text-slate-800">Child Safeguarding & Privacy Commitment:</strong> All event photos and recordings featuring children and students are published only with official school and parental consent in strict compliance with Uganda’s Data Protection and Privacy Act.
          </div>
        </div>

      </div>
    </section>
  );
};
