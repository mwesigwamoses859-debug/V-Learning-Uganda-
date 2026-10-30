import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Download, 
  PlayCircle, 
  Image as ImageIcon, 
  ExternalLink, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { EventItem } from '../types';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRegister: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRegister,
}) => {
  if (!event) return null;

  const isUpcoming = event.status === 'Upcoming';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Banner with close */}
        <div className="relative aspect-video sm:aspect-21/9 bg-slate-900">
          <img 
            src={event.bannerImage} 
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`text-xs font-black px-3 py-1 rounded-full ${
              isUpcoming ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-200'
            }`}>
              {event.status}
            </span>
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
              {event.audience}
            </span>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {event.type}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 leading-snug">
              {event.title}
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-900">{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{event.venue}</span>
              </div>
              {event.joiningLink && (
                <div className="flex items-center gap-2 sm:col-span-2 text-blue-700">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <a href={event.joiningLink} target="_blank" rel="noreferrer" className="underline font-bold truncate">
                    Join Online Meeting Link: {event.joiningLink}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              About This Event
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {event.description}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Organized by: <strong>{event.organizer}</strong>
            </p>
          </div>

          {/* Photo Gallery (if available) */}
          {event.photos && event.photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Event Photo Album ({event.photos.length} Photos)</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {event.photos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <img 
                      src={photo} 
                      alt={`Event photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Note: All photos of children are published with verified parental and school permission.
              </p>
            </div>
          )}

          {/* Recording Replay Video (if available) */}
          {event.recordingVideoUrl && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-rose-600" />
                <span>Session Video Recording</span>
              </h4>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <iframe
                  src={event.recordingVideoUrl}
                  title={event.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Downloadable Materials Handouts */}
          {event.downloadableMaterials && event.downloadableMaterials.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Event Handouts & Materials
              </h4>
              <div className="space-y-2">
                {event.downloadableMaterials.map((mat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span className="font-semibold text-slate-800">{mat.name}</span>
                      <span className="text-slate-400">({mat.size})</span>
                    </div>
                    <button 
                      onClick={() => alert(`Downloading ${mat.name}...`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>

          {isUpcoming && (
            <button
              onClick={() => {
                onClose();
                onRegister(event);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Register for this Event</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
