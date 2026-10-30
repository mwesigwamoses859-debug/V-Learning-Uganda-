import React, { useState } from 'react';
import { 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  BookOpen, 
  Award,
  MessageSquare
} from 'lucide-react';

export const AboutContactSection: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [msg, setMsg] = useState({ name: '', phone: '', message: '' });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
    setMsg({ name: '', phone: '', message: '' });
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ABOUT US */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Mission & Vision</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Transforming Video Learning Across Uganda
            </h2>
            <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              Founded by <strong>Teacher Ojok</strong>, <strong>Video Learning Uganda</strong> was born from a clear realization: every pupil and student in Uganda—whether studying in Kampala, Gulu, Arua, Mbarara, Mbale, or Fort Portal—deserves access to master educators and UNEB examination preparation.
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              We eliminate barriers by combining <strong>data-saver video lessons</strong>, <strong>printable PDF notes that work offline</strong>, and <strong>exciting Kahoot-style quiz competitions</strong> that make learning genuinely enjoyable.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-black text-blue-700">P1 to S6</span>
                <p className="text-xs text-slate-600 font-medium mt-1">Full Primary & Secondary Syllabus Coverage</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-black text-amber-600">Free Open Access</span>
                <p className="text-xs text-slate-600 font-medium mt-1">Designed for Every Ugandan Household</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80" 
                alt="Ugandan students in classroom seminar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-5 rounded-2xl shadow-xl max-w-xs border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>Ugandan Excellence</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                "Video Learning can not do without screens, but together we ensure no learner is left behind."
              </p>
              <span className="text-[10px] text-slate-400 font-bold block mt-2">— Tr. Ojok Mtn</span>
            </div>
          </div>
        </div>

        {/* CONTACT US & WHATSAPP */}
        <div id="contact" className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Get in Touch with Teacher Ojok</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Connect with Us Directly
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Have questions about our video lessons, want to host a school seminar, or partner with us? Reach out anytime via WhatsApp or phone.
              </p>

              <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-700">
                <a 
                  href="https://wa.me/256772000000" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-colors"
                >
                  <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold block">WhatsApp & MTN Line (Tr. Ojok):</span>
                    <span className="text-xs text-emerald-700">+256 (0) 772 000 000 / +256 (0) 750 000 000</span>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200">
                  <Mail className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <span className="font-bold block">Official Email:</span>
                    <span className="text-xs text-slate-500">info@videolearning.ug</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200">
                  <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Seminar Centers:</span>
                    <span className="text-xs text-slate-500">Kampala (Makerere Hub) & Gulu City Learning Center</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feedback Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Send a Message or Lesson Request
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Let Teacher Ojok know which topics or past papers you want uploaded next.
              </p>

              {formSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Message sent to Teacher Ojok! We will reply via WhatsApp shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Namusoke Brenda"
                      value={msg.name}
                      onChange={(e) => setMsg({ ...msg, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="0772..."
                      value={msg.phone}
                      onChange={(e) => setMsg({ ...msg, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Topic Request</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Please upload more videos on P.7 Mathematics percentages and S.4 Chemistry practicals..."
                      value={msg.message}
                      onChange={(e) => setMsg({ ...msg, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Teacher Ojok</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
