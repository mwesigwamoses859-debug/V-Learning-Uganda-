import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  School, 
  Sparkles,
  Ticket
} from 'lucide-react';
import { EventItem } from '../types';

interface EventRegistrationModalProps {
  event: EventItem | null;
  onClose: () => void;
  onSuccess: (regData: any) => void;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  if (!event) return null;

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    schoolName: '',
    classLevel: event.audience === 'Primary' ? 'P7' : event.audience === 'Secondary' ? 'S4' : 'Teacher',
    email: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.schoolName) return;

    const generatedTicket = `VLU-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedTicket);
    setIsSubmitted(true);
    onSuccess({ ...formData, ticketId: generatedTicket, eventId: event.id });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="bg-emerald-900/60 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
            Free Event Registration
          </span>
          <h3 className="text-xl font-extrabold mt-2 leading-snug">
            {event.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-emerald-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {event.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {event.time}
            </span>
          </div>
        </div>

        {/* Content */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ojok Brian"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                WhatsApp / Phone Number (MTN / Airtel) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0772 123 456 or 0750 987 654"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Joining instructions and reminders will be sent to this number.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  School Name *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. City High School"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Class / Role
                </label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="P5">Primary Five (P.5)</option>
                  <option value="P6">Primary Six (P.6)</option>
                  <option value="P7">Primary Seven (P.7)</option>
                  <option value="S1">Senior One (S.1)</option>
                  <option value="S2">Senior Two (S.2)</option>
                  <option value="S3">Senior Three (S.3)</option>
                  <option value="S4">Senior Four (S.4)</option>
                  <option value="S5">Senior Five (S.5)</option>
                  <option value="S6">Senior Six (S.6)</option>
                  <option value="Teacher">Teacher / Educator</option>
                  <option value="Parent">Parent / Guardian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="learner@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-sm"
              >
                Confirm Free Registration
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              Registration Confirmed!
            </h3>

            <p className="text-sm text-slate-600">
              Thank you, <strong>{formData.fullName}</strong>. Your seat for <strong>{event.title}</strong> has been reserved.
            </p>

            {/* Ticket Card */}
            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b">
                <span>E-TICKET PASS</span>
                <span className="text-emerald-700 font-extrabold">{ticketId}</span>
              </div>
              <div className="mt-2 text-xs space-y-1 text-slate-700">
                <p><strong>School:</strong> {formData.schoolName} ({formData.classLevel})</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Date & Time:</strong> {event.date} at {event.time}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
