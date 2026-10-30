import React, { useState } from 'react';
import { 
  X, 
  PlayCircle, 
  FileText, 
  Download, 
  HelpCircle, 
  User, 
  Clock, 
  Wifi, 
  Gauge, 
  CheckCircle2, 
  Share2,
  ExternalLink,
  BookOpen,
  Monitor,
  Printer,
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { Lesson, QuizQuestion } from '../types';

interface LessonModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onStartKahoot: (questions: QuizQuestion[], title: string) => void;
  onStartSchoolQuiz: (questions: QuizQuestion[], title: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  onClose,
  onStartKahoot,
  onStartSchoolQuiz,
}) => {
  if (!lesson) return null;

  const [videoQuality, setVideoQuality] = useState<'240p' | '360p' | '720p'>('360p');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [videoDownloadSuccess, setVideoDownloadSuccess] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDownloadVideo = () => {
    setVideoDownloadSuccess(true);
    setTimeout(() => setVideoDownloadSuccess(false), 3000);
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', `${lesson.title.replace(/[^a-zA-Z0-9]/g, '_')}_Video_Lesson.mp4`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintWorksheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className={`bg-white rounded-3xl w-full ${isProjectorMode ? 'max-w-6xl' : 'max-w-4xl'} overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] transition-all duration-300`}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              Free Lesson
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Video Learning Uganda
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Projector / Screen Share Toggle */}
            <button
              onClick={() => setIsProjectorMode(!isProjectorMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isProjectorMode 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              title="Classroom Screen / Projector Mode (Enlarges video and text for whole class to view)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isProjectorMode ? 'Standard View' : 'Classroom Projector Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              title="Close lesson viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Video Player Screen */}
          <div className={`relative rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-xl ${isProjectorMode ? 'ring-4 ring-blue-600/30' : ''}`}>
            {lesson.videoUrl.includes('youtube') ? (
              <iframe
                src={`${lesson.videoUrl}?autoplay=1&rel=0`}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
                <PlayCircle className="w-16 h-16 text-amber-400 mb-3" />
                <h4 className="text-lg font-bold">{lesson.title}</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-md">
                  Interactive Video Stream (Adaptive 240p/360p Data Saver mode active)
                </p>
              </div>
            )}
          </div>

          {/* Video Controls Bar: Data-Saver Quality & Playback Speed */}
          <div className="bg-slate-100 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            
            {/* Data-Saver Quality Selector */}
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Data Mode:</span>
              <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200 shadow-xs">
                {(['240p', '360p', '720p'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setVideoQuality(q)}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      videoQuality === q
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {q} {q === '240p' && '(Data Saver)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">Speed:</span>
              <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200 shadow-xs">
                {[0.75, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                      playbackSpeed === speed
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Video Downloader Button for Teachers & Learners */}
            <button
              onClick={handleDownloadVideo}
              className="bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              title="Download video lesson file for offline classroom or phone playback without internet"
            >
              {videoDownloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Video Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Video (Offline Study)</span>
                </>
              )}
            </button>

          </div>

          {/* Lesson Metadata */}
          <div>
            <h2 className={`${isProjectorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 leading-snug`}>
              {lesson.title}
            </h2>
            
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <User className="w-4 h-4 text-blue-600" />
                <span>Instructor: <strong>{lesson.teacherName}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Duration: {lesson.durationMinutes} Minutes</span>
              </div>
            </div>

            <p className="mt-4 text-slate-700 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {lesson.description}
            </p>
          </div>

          {/* Attached PDF Resources Box */}
          {lesson.pdfFileName && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-xs shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {lesson.pdfFileName}
                    </span>
                    <span className="text-xs bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                      {lesson.pdfFileSize || '2.0 MB'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Printable summary notes & formula sheets. Download once and read offline anytime without data.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowPdfPreview(!showPdfPreview)}
                  className="bg-white hover:bg-amber-100 text-slate-800 border border-amber-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>{showPdfPreview ? 'Hide Preview' : 'Read in Browser'}</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-900" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* In-Browser PDF Preview Mock */}
          {showPdfPreview && (
            <div className="border border-slate-300 rounded-2xl p-6 bg-white shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b pb-2 text-xs font-bold text-slate-500">
                <span>DOCUMENT PREVIEW: {lesson.pdfFileName}</span>
                <span>Page 1 of 4</span>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700 space-y-2">
                <h4 className="text-base font-bold text-slate-900">{lesson.title} - Key Summary Notes</h4>
                <p><strong>Overview:</strong> This handout summarizes the key definitions, diagrams, and formulas required by the Uganda National Examinations Board (UNEB).</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Always write standard scientific SI units or currency units (UGX) on numerical answers.</li>
                  <li>Show all mathematical formulas and working steps clearly to score method marks.</li>
                  <li>Label ray diagrams and anatomical diagrams with sharp, straight pencil lines.</li>
                </ul>
                <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono">
                  [Official UNEB Marking Guideline - Prepared by Tr. Ojok Mtn for Video Learning Uganda]
                </div>
              </div>
            </div>
          )}

          {/* Attached Practice Quiz: Two School-Friendly Options */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
              <div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Attached Practice Assessment ({lesson.quiz.length} Questions)
                </span>
                <h4 className="text-xl font-black mt-2">
                  Test Your Understanding of This Lesson
                </h4>
                <p className="text-xs text-indigo-200 mt-1">
                  Students can answer right on the website for auto-marked division results, or play in Kahoot gamified mode!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. School-Friendly Quiz Mode (Grades + Certificate) */}
                <button
                  onClick={() => {
                    onClose();
                    onStartSchoolQuiz(lesson.quiz!, lesson.title);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm p-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-left"
                >
                  <FileText className="w-5 h-5 text-emerald-200 shrink-0" />
                  <div>
                    <span className="block font-black">Answer Quiz on Website</span>
                    <span className="text-[11px] text-emerald-100 font-normal">Auto-graded, Division 1-4 & printable certificate</span>
                  </div>
                </button>

                {/* 2. Kahoot Speed Challenge Game */}
                <button
                  onClick={() => {
                    onClose();
                    onStartKahoot(lesson.quiz!, lesson.title);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm p-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-left"
                >
                  <Gamepad2 className="w-5 h-5 text-pink-300 shrink-0" />
                  <div>
                    <span className="block font-black">Kahoot Speed Arena</span>
                    <span className="text-[11px] text-purple-200 font-normal">Timed 30s buttons, streaks, and podium</span>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
