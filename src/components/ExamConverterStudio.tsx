import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Wand2, 
  Eye, 
  Check, 
  Download,
  AlertCircle,
  FileCode,
  GraduationCap
} from 'lucide-react';
import { AnyClass, SchoolLevel, ExamPaper, QuizQuestion } from '../types';

interface ExamConverterStudioProps {
  onClose: () => void;
  onDeployExam: (exam: ExamPaper) => void;
}

export const ExamConverterStudio: React.FC<ExamConverterStudioProps> = ({
  onClose,
  onDeployExam,
}) => {
  const [examTitle, setExamTitle] = useState('UNEB PLE 2025 Mathematics Candidate Mock Examination');
  const [classLevel, setClassLevel] = useState<AnyClass>('P7');
  const [level, setLevel] = useState<SchoolLevel>('primary');
  const [subject, setSubject] = useState('Mathematics');
  const [year, setYear] = useState('2025');
  const [term, setTerm] = useState('Term 3 Candidate Mock');
  const [durationMinutes, setDurationMinutes] = useState(120);

  // PDF File Upload simulation
  const [pdfFileName, setPdfFileName] = useState('UNEB_P7_Math_Exam_Paper_2025.pdf');
  const [pdfFileSize, setPdfFileSize] = useState('3.8 MB');

  // Converter Mode: 'extract' (into online test) vs 'pdf-only' (leave as PDF)
  const [converterMode, setConverterMode] = useState<'interactive-extracted' | 'pdf-only'>('interactive-extracted');

  // Extracted Questions
  const [extractedQuestions, setExtractedQuestions] = useState<QuizQuestion[]>([
    {
      id: 'ext-1',
      question: 'Evaluate: 3/4 + 1/2 in simplest fractional form.',
      options: ['1 1/4 (5/4)', '4/6', '7/8', '2/3'],
      correctAnswerIndex: 0,
      explanation: 'Find LCD = 4: 3/4 + 2/4 = 5/4 = 1 1/4.',
    },
    {
      id: 'ext-2',
      question: 'Find the size of angle x if two angles on a straight line are (3x - 10)° and (2x + 40)°.',
      options: ['30°', '45°', '25°', '50°'],
      correctAnswerIndex: 0,
      explanation: 'Angles on a straight line add up to 180°: 3x - 10 + 2x + 40 = 180 => 5x + 30 = 180 => 5x = 150 => x = 30°.',
    },
    {
      id: 'ext-3',
      question: 'A cyclist travelled from Kampala to Jinja, a distance of 80 km, in 2 hours. What was his average speed in km/h?',
      options: ['40 km/h', '160 km/h', '30 km/h', '50 km/h'],
      correctAnswerIndex: 0,
      explanation: 'Speed = Distance / Time = 80 km / 2 h = 40 km/h.',
    },
    {
      id: 'ext-4',
      question: 'Express 0.0048 in standard scientific notation (A x 10^n).',
      options: ['4.8 x 10^-3', '48 x 10^-4', '4.8 x 10^3', '0.48 x 10^-2'],
      correctAnswerIndex: 0,
      explanation: 'Move decimal point 3 places to the right: 4.8 x 10^-3.',
    }
  ]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulate AI/Heuristic PDF text extraction
  const handleSimulateExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      alert('PDF processed successfully! 4 exam questions automatically extracted with UNEB marking keys.');
    }, 1200);
  };

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: ExamPaper = {
      id: `exam-${Date.now()}`,
      title: examTitle,
      classLevel,
      level,
      subject,
      year,
      term,
      mode: converterMode,
      pdfFileName,
      pdfFileSize,
      pdfUrl: '#',
      questions: converterMode === 'interactive-extracted' ? extractedQuestions : undefined,
      durationMinutes,
      totalMarks: converterMode === 'interactive-extracted' ? extractedQuestions.length * 5 : 100,
      attemptsCount: 0,
    };

    onDeployExam(newExam);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg">
                  Exam PDF Upload & Question Extractor Studio
                </span>
                <span className="bg-pink-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Upload any exam or past paper PDF: keep it as a printable PDF or automatically extract it into an interactive online exam!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDeploy} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {isSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Exam successfully published! It is now accessible in the Online Exam Hall and Resources bank.</span>
            </div>
          )}

          {/* Step 1: Exam PDF File Selection */}
          <div className="border-2 border-dashed border-purple-300 rounded-3xl p-6 bg-purple-50/40 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Upload Examination Document (PDF)
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Drag and drop your school exam, UNEB past paper, or holiday revision test paper here (.pdf format supported).
              </p>
            </div>

            <div className="inline-flex items-center gap-3 bg-white border border-purple-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Selected: <strong>{pdfFileName}</strong> ({pdfFileSize})</span>
              <button 
                type="button" 
                onClick={() => setPdfFileName('UNEB_UCE_Physics_Paper_2025.pdf')}
                className="text-purple-700 font-bold hover:underline ml-2"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Step 2: Choose Mode: Extract vs Keep as PDF */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Choose How Students Will Access This Exam:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Extract into Online Interactive Exam */}
              <div 
                onClick={() => setConverterMode('interactive-extracted')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  converterMode === 'interactive-extracted'
                    ? 'border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-700" />
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      Extract into Interactive Online Exam
                    </h5>
                  </div>
                  {converterMode === 'interactive-extracted' && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The system automatically extracts questions into an online test paper. Students answer on the website, and the system auto-grades them into UNEB Divisions!
                </p>
              </div>

              {/* Option B: Leave as Clean PDF */}
              <div 
                onClick={() => setConverterMode('pdf-only')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  converterMode === 'pdf-only'
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      Keep as Standard PDF Exam
                    </h5>
                  </div>
                  {converterMode === 'pdf-only' && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Leaves the paper as an authentic PDF. Students read it in browser or print it on paper to write their working out with pens in class.
                </p>
              </div>

            </div>
          </div>

          {/* Step 3: Exam Metadata */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Exam Classification & Schedule</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Year / Term
                </label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Level *
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    const l = e.target.value as SchoolLevel;
                    setLevel(l);
                    setClassLevel(l === 'primary' ? 'P7' : 'S4');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="primary">Primary (P1–P7)</option>
                  <option value="secondary">Secondary (S1–S6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class *
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value as AnyClass)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold text-blue-700"
                >
                  {level === 'primary' ? (
                    <>
                      <option value="P5">P.5</option>
                      <option value="P6">P.6</option>
                      <option value="P7">P.7 (PLE)</option>
                    </>
                  ) : (
                    <>
                      <option value="S3">S.3</option>
                      <option value="S4">S.4 (UCE)</option>
                      <option value="S5">S.5</option>
                      <option value="S6">S.6 (UACE)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Allowed Time (Mins)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Preview Extracted Questions (Only shown if interactive mode) */}
          {converterMode === 'interactive-extracted' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Extracted Questions Preview ({extractedQuestions.length} Items)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    The questions below were parsed from your PDF. You can edit any question or marking key before publishing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateExtraction}
                  disabled={isExtracting}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isExtracting ? 'Re-scanning PDF...' : 'Re-extract from PDF'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {extractedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">
                        Item {idx + 1}: {q.question}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        Correct: Option {String.fromCharCode(65 + q.correctAnswerIndex)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-2 rounded-lg border ${
                          oIdx === q.correctAnswerIndex ? 'border-emerald-300 bg-emerald-50/50 font-bold text-emerald-900' : 'border-slate-100 bg-slate-50'
                        }`}>
                          <span className="mr-1 font-bold">{String.fromCharCode(65 + oIdx)}:</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Marking Guide: {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white font-black text-sm px-7 py-3 rounded-xl shadow-lg shadow-purple-700/25 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{converterMode === 'interactive-extracted' ? 'Deploy as Interactive Online Exam' : 'Publish as Standard Exam PDF'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
