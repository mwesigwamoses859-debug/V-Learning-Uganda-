import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Video, 
  FileText, 
  Calendar, 
  HelpCircle, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  CreditCard,
  Layers,
  Sparkles,
  GraduationCap,
  Award,
  Wand2,
  TrendingUp,
  AlertTriangle,
  Download
} from 'lucide-react';
import { SchoolLevel, AnyClass, EventType, EventAudience, StudentQuizSubmission, ExamPaper } from '../types';

interface AdminDashboardModalProps {
  onClose: () => void;
  onAddLesson: (newLesson: any) => void;
  onAddEvent: (newEvent: any) => void;
  onOpenExamConverter?: () => void;
  studentSubmissions?: StudentQuizSubmission[];
  examPapers?: ExamPaper[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  onAddLesson,
  onAddEvent,
  onOpenExamConverter,
  studentSubmissions = [],
  examPapers = [],
}) => {
  const [activeTab, setActiveTab] = useState<'uploadLesson' | 'gradebook' | 'examConverter' | 'createEvent' | 'createQuiz' | 'registrations' | 'monetization'>('gradebook');

  // Lesson Form State
  const [lessonForm, setLessonForm] = useState({
    title: '',
    level: 'primary' as SchoolLevel,
    classLevel: 'P7' as AnyClass,
    subject: 'Mathematics',
    topicName: '',
    videoUrl: '',
    durationMinutes: 20,
    description: '',
    teacherName: 'Tr. Ojok Mtn',
    pdfFileName: '',
    pdfFileSize: '2.5 MB',
  });
  const [lessonSuccess, setLessonSuccess] = useState(false);

  // Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'Seminar' as EventType,
    audience: 'Primary' as EventAudience,
    date: '',
    time: '9:00 AM - 1:00 PM EAT',
    venue: 'Makerere University Main Hall',
    joiningLink: '',
    description: '',
    organizer: 'Tr. Ojok Mtn',
    bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    maxRegistrations: 500,
  });
  const [eventSuccess, setEventSuccess] = useState(false);

  // Quiz Creator State
  const [quizForm, setQuizForm] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
    explanation: '',
  });
  const [quizSuccess, setQuizSuccess] = useState(false);

  // Mock Registrations
  const [mockRegistrations, setMockRegistrations] = useState([
    { name: 'Kato Derrick', phone: '0772 458 912', school: 'Kitante Primary School', class: 'P.7', event: 'PLE Math Championship' },
    { name: 'Nalubega Joan', phone: '0754 112 390', school: 'Gayaza High School', class: 'S.4', event: 'UNEB Practical Seminar' },
    { name: 'Okello Ronald', phone: '0781 992 014', school: 'Gulu High School', class: 'S.4', event: 'UNEB Practical Seminar' },
    { name: 'Akello Sharon', phone: '0702 331 445', school: 'St. Mary\'s Namagunga', class: 'S.6', event: 'UACE Masterclass' },
  ]);

  // Combined submissions (mock + live)
  const defaultSubmissions: StudentQuizSubmission[] = [
    {
      id: 'sub-mock-1',
      studentName: 'Okello Brian',
      schoolName: 'Gulu Primary School',
      classLevel: 'P.7',
      lessonTitle: 'Solving Word Problems using 3-Set Venn Diagrams',
      score: 4,
      totalQuestions: 4,
      percentage: 100,
      division: 'Division 1 (Distinction)',
      grade: 'D1',
      completedAt: '10:45 AM, 10/29/2026',
    },
    {
      id: 'sub-mock-2',
      studentName: 'Namatovu Esther',
      schoolName: 'Kampala Parents School',
      classLevel: 'P.7',
      lessonTitle: 'The Human Circulatory System',
      score: 3,
      totalQuestions: 4,
      percentage: 75,
      division: 'Division 1 (Very Good)',
      grade: 'D2',
      completedAt: '11:12 AM, 10/29/2026',
    },
    {
      id: 'sub-mock-3',
      studentName: 'Kayanja Ronald',
      schoolName: 'Mengo Senior School',
      classLevel: 'S.4',
      lessonTitle: 'Geometrical Optics: Reflection & Snell\'s Law',
      score: 2,
      totalQuestions: 2,
      percentage: 100,
      division: 'Division 1 (Distinction)',
      grade: 'D1',
      completedAt: '11:35 AM, 10/29/2026',
    },
    {
      id: 'sub-mock-4',
      studentName: 'Auma Brenda',
      schoolName: 'Kitante Primary School',
      classLevel: 'P.7',
      lessonTitle: 'Solving Word Problems using 3-Set Venn Diagrams',
      score: 2,
      totalQuestions: 4,
      percentage: 50,
      division: 'Division 2 (Satisfactory)',
      grade: 'C4',
      completedAt: '12:05 PM, 10/29/2026',
    }
  ];

  const allSubmissions = [...studentSubmissions, ...defaultSubmissions];

  // Statistical Calculations for Class Performance
  const totalSubmissionsCount = allSubmissions.length;
  const avgPercentage = Math.round(
    allSubmissions.reduce((acc, curr) => acc + curr.percentage, 0) / (totalSubmissionsCount || 1)
  );
  const div1Count = allSubmissions.filter((s) => s.percentage >= 70).length;
  const passRate = Math.round(
    (allSubmissions.filter((s) => s.percentage >= 50).length / (totalSubmissionsCount || 1)) * 100
  );

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLesson({
      ...lessonForm,
      id: `lesson-${Date.now()}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
      isFree: true,
    });
    setLessonSuccess(true);
    setTimeout(() => setLessonSuccess(false), 3000);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      ...eventForm,
      id: `evt-${Date.now()}`,
      status: 'Upcoming',
      currentRegistrations: 0,
    });
    setEventSuccess(true);
    setTimeout(() => setEventSuccess(false), 3000);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSuccess(true);
    setTimeout(() => setQuizSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Teacher & Administrator Dashboard
                </h3>
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Verified Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong>Tr. Ojok Mtn</strong> · Video Learning Uganda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('gradebook')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'gradebook'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Student Quiz Gradebook & Auto-Marking ({allSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('uploadLesson')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'uploadLesson'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Upload Class Video & PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('examConverter')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'examConverter'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-4 h-4 text-purple-600" />
            <span>Exam PDF Extractor Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('createEvent')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'createEvent'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Publish New Event</span>
          </button>

          <button
            onClick={() => setActiveTab('createQuiz')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'createQuiz'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Add Kahoot Quiz Qs</span>
          </button>

          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'registrations'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Event Registrations</span>
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'monetization'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-rose-600" />
            <span>Mobile Money Settings</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* 1. STUDENT GRADEBOOK & LIVE AUTOMATIC MARKING */}
          {activeTab === 'gradebook' && (
            <div className="space-y-6">
              
              {/* Top Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Submissions</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{totalSubmissionsCount} Students</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Answered Online</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Class Average</span>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{avgPercentage}%</p>
                  <span className="text-[11px] text-emerald-700 font-semibold">Overall Mastery</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-amber-700 uppercase">Division 1 Scorers</span>
                  <p className="text-2xl font-black text-amber-900 mt-1">{div1Count} Pupils</p>
                  <span className="text-[11px] text-amber-700 font-semibold">Scored 70%+</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-blue-700 uppercase">Pass Rate</span>
                  <p className="text-2xl font-black text-blue-900 mt-1">{passRate}%</p>
                  <span className="text-[11px] text-blue-700 font-semibold">Div 1 & Div 2</span>
                </div>
              </div>

              {/* Per-Question Diagnostic Radar (How many got each question correct) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Topic Diagnostic: How Many Got Each Question Correct</span>
                  </h5>
                  <span className="text-xs text-slate-500 font-medium">Automatic System Marking</span>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Q1: Sets & Venn Diagram Intersection Formula</span>
                      <span className="text-emerald-700">35 / 38 Correct (92% - High Mastery)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Q2: Definition of Disjoint Sets</span>
                      <span className="text-emerald-700">32 / 38 Correct (84% - Good)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Q3: Word Problem with Posho and Rice</span>
                      <span className="text-amber-700">26 / 38 Correct (68% - Satisfactory)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Q4: Complement of Universal Set</span>
                      <span className="text-rose-600 font-black">17 / 38 Correct (45% - Needs Teacher Revision!)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Submissions Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      Individual Student Marks Record
                    </h5>
                    <p className="text-xs text-slate-500">
                      Real-time submissions from learners revising online.
                    </p>
                  </div>

                  <button 
                    onClick={() => alert('Exporting student gradebook to CSV/Excel...')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                  >
                    Export Marks Sheet (CSV)
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Student / Pupil</th>
                        <th className="p-3">School Name</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Assessed Lesson</th>
                        <th className="p-3">Score (%)</th>
                        <th className="p-3">UNEB Division</th>
                        <th className="p-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {allSubmissions.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{sub.studentName}</td>
                          <td className="p-3 text-slate-600">{sub.schoolName}</td>
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                              {sub.classLevel}
                            </span>
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-slate-800" title={sub.lessonTitle}>
                            {sub.lessonTitle}
                          </td>
                          <td className="p-3 font-black text-slate-900">
                            {sub.score}/{sub.totalQuestions} ({sub.percentage}%)
                          </td>
                          <td className="p-3">
                            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                              sub.percentage >= 70 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : sub.percentage >= 50 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.division}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{sub.completedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. EXAM PDF CONVERTER STUDIO */}
          {activeTab === 'examConverter' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Exam Paper Studio
                  </span>
                  <h4 className="text-xl font-black mt-2">
                    Upload Exam PDF & Convert to Online Test Paper
                  </h4>
                  <p className="text-xs text-purple-200 mt-1 max-w-xl">
                    Drop any school test or UNEB past paper PDF. You can either leave it as a printable PDF or let the system extract it into an auto-marked interactive examination!
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenExamConverter) onOpenExamConverter();
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Launch PDF Extractor Studio</span>
                </button>
              </div>

              {/* Deployed Examination Papers */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-slate-900 text-sm">
                  Active Examination Papers in School System:
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-100 text-purple-800 font-bold text-xs px-2 py-0.5 rounded-md">
                        Interactive Online Exam
                      </span>
                      <span className="text-xs text-slate-400">Class: P.7 (PLE)</span>
                    </div>

                    <h6 className="font-bold text-slate-900 text-sm">
                      UNEB PLE 2025 Mathematics Candidate Mock Paper
                    </h6>

                    <p className="text-xs text-slate-600">
                      Extracted from PDF: 4 Multiple Choice + Step-by-Step Questions with Auto-Marking & Division Grading.
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>42 Student Attempts</span>
                      <span className="font-bold text-emerald-700">Avg: 78%</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2 py-0.5 rounded-md">
                        Printable PDF Format
                      </span>
                      <span className="text-xs text-slate-400">Class: S.4 (UCE)</span>
                    </div>

                    <h6 className="font-bold text-slate-900 text-sm">
                      UCE Physics Paper 1 & 2 Examination Past Paper with Marking Scheme
                    </h6>

                    <p className="text-xs text-slate-600">
                      Preserved as PDF: Complete diagrams, ray drawings, formulas, and examiner notes.
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>3,105 Downloads</span>
                      <span className="font-bold text-blue-700">5.5 MB PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. UPLOAD LESSON */}
          {activeTab === 'uploadLesson' && (
            <form onSubmit={handleLessonSubmit} className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Upload New Video Lesson & PDF Handout
                </h4>
                <p className="text-xs text-slate-500">
                  Fill in the lesson details below. The lesson will automatically appear under the designated class and subject.
                </p>
              </div>

              {lessonSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lesson successfully uploaded and published to Video Learning Uganda!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solving UNEB 3-Set Venn Diagrams (Step-by-step)"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Level *
                  </label>
                  <select
                    value={lessonForm.level}
                    onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value as SchoolLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="primary">Primary (P1-P7)</option>
                    <option value="secondary">Secondary (S1-S6)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class *
                  </label>
                  <select
                    value={lessonForm.classLevel}
                    onChange={(e) => setLessonForm({ ...lessonForm, classLevel: e.target.value as AnyClass })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="P1">P.1</option>
                    <option value="P2">P.2</option>
                    <option value="P3">P.3</option>
                    <option value="P4">P.4</option>
                    <option value="P5">P.5</option>
                    <option value="P6">P.6</option>
                    <option value="P7">P.7 (PLE)</option>
                    <option value="S1">S.1</option>
                    <option value="S2">S.2</option>
                    <option value="S3">S.3</option>
                    <option value="S4">S.4 (UCE)</option>
                    <option value="S5">S.5</option>
                    <option value="S6">S.6 (UACE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={lessonForm.subject}
                    onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Topic / Unit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sets and Venn Diagrams"
                  value={lessonForm.topicName}
                  onChange={(e) => setLessonForm({ ...lessonForm, topicName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    YouTube Embed Link / Video URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/embed/..."
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PDF Notes Filename (Attach Printable Handout)
                </label>
                <input
                  type="text"
                  placeholder="e.g. P7_Maths_Venn_Diagrams_Notes.pdf"
                  value={lessonForm.pdfFileName}
                  onChange={(e) => setLessonForm({ ...lessonForm, pdfFileName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lesson Summary Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a clear overview of what learners will study in this video..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Publish Lesson to Portal</span>
              </button>
            </form>
          )}

          {/* 4. CREATE EVENT */}
          {activeTab === 'createEvent' && (
            <form onSubmit={handleEventSubmit} className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Publish Upcoming Competition, Seminar or Workshop
                </h4>
                <p className="text-xs text-slate-500">
                  Events will appear immediately on the Events Centre for learners and teachers across Uganda to register.
                </p>
              </div>

              {eventSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Event successfully published to the Events Centre!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Primary Schools PLE Mathematics Quiz Championship"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Event Type *
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Quiz Competition">Quiz Competition</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Audience *
                  </label>
                  <select
                    value={eventForm.audience}
                    onChange={(e) => setEventForm({ ...eventForm, audience: e.target.value as EventAudience })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Primary">Primary (P1-P7)</option>
                    <option value="Secondary">Secondary (S1-S6)</option>
                    <option value="Teachers">Teachers / Educators</option>
                    <option value="All Learners">All Learners</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saturday, December 12, 2026"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9:00 AM - 1:00 PM EAT"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Venue / Physical Location or Online Meeting Link *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Makerere University Main Hall or https://meet.google.com/..."
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Event Description & Rules
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the competition format, prizes, or topics covered..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Publish Event to Live Website</span>
              </button>
            </form>
          )}

          {/* 5. CREATE QUIZ */}
          {activeTab === 'createQuiz' && (
            <form onSubmit={handleQuizSubmit} className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Create Kahoot-Style 4-Option Quiz Question
                </h4>
                <p className="text-xs text-slate-500">
                  Add questions to the interactive quiz bank. Each question must have 4 options and an educational explanation.
                </p>
              </div>

              {quizSuccess && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Question added to the Kahoot Arena pool!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question Text *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the process by which green plants manufacture food using sunlight?"
                  value={quizForm.question}
                  onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <label className="block text-xs font-bold text-red-700 uppercase mb-1">
                    ▲ Option A (Red)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Photosynthesis"
                    value={quizForm.optionA}
                    onChange={(e) => setQuizForm({ ...quizForm, optionA: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-red-200 text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <label className="block text-xs font-bold text-blue-700 uppercase mb-1">
                    ◆ Option B (Blue)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Transpiration"
                    value={quizForm.optionB}
                    onChange={(e) => setQuizForm({ ...quizForm, optionB: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">
                    ● Option C (Yellow)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Respiration"
                    value={quizForm.optionC}
                    onChange={(e) => setQuizForm({ ...quizForm, optionC: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">
                    ■ Option D (Green)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fermentation"
                    value={quizForm.optionD}
                    onChange={(e) => setQuizForm({ ...quizForm, optionD: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Correct Option *
                  </label>
                  <select
                    value={quizForm.correctAnswer}
                    onChange={(e) => setQuizForm({ ...quizForm, correctAnswer: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold"
                  >
                    <option value={0}>Option A (Red ▲)</option>
                    <option value={1}>Option B (Blue ◆)</option>
                    <option value={2}>Option C (Yellow ●)</option>
                    <option value={3}>Option D (Green ■)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teacher Explanation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Photosynthesis uses chlorophyll and sunlight to convert CO2 and water into glucose."
                    value={quizForm.explanation}
                    onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Question to Kahoot Bank</span>
              </button>
            </form>
          )}

          {/* 6. REGISTRATIONS & ANALYTICS */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    Student & Teacher Registrations
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live list of all participants signed up for seminars and quiz competitions.
                  </p>
                </div>

                <button 
                  onClick={() => alert('Exporting registrations to Excel/CSV...')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl"
                >
                  Export CSV / Excel
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Learner Name</th>
                      <th className="p-3">Phone (MTN/Airtel)</th>
                      <th className="p-3">School Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Registered Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {mockRegistrations.map((reg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{reg.name}</td>
                        <td className="p-3 font-mono">{reg.phone}</td>
                        <td className="p-3">{reg.school}</td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                            {reg.class}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-700 font-semibold">{reg.event}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. MONETIZATION ROADMAP */}
          {activeTab === 'monetization' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Future Monetization & Payment Controls
                </h4>
                <p className="text-xs text-slate-500">
                  Configure how and when free materials become paid. Currently in <strong>100% Free Open Access Mode</strong> for launch.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Current Platform Status: FREE FOR ALL LEARNERS</span>
                </div>
                <p className="text-xs text-slate-600">
                  Teacher Ojok's strategy is to keep all P1–P7 and S1–S6 content free initially to onboard thousands of Ugandan students and gather phone numbers. When ready, flip the switch below.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 text-sm">
                  Future Subscription Tiers (MTN MoMo & Airtel Money):
                </h5>

                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-slate-900 text-sm">Daily Revision Pass</h6>
                    <p className="text-xs text-slate-500">Access all video lessons & notes for 24 hours</p>
                  </div>
                  <span className="font-black text-slate-900 text-sm">1,000 UGX</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-slate-900 text-sm">Full Term Subscription</h6>
                    <p className="text-xs text-slate-500">Unlimited access to all subjects for 3 months</p>
                  </div>
                  <span className="font-black text-slate-900 text-sm">25,000 UGX</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-slate-900 text-sm">Candidate Booster Pack (PLE / UCE)</h6>
                    <p className="text-xs text-slate-500">Past papers + video solutions + seminar VIP ticket</p>
                  </div>
                  <span className="font-black text-slate-900 text-sm">40,000 UGX</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
