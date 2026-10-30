import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Printer, 
  Download, 
  RotateCcw, 
  User, 
  School, 
  GraduationCap, 
  Check, 
  FileText, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, StudentQuizSubmission } from '../types';

interface StudentQuizSheetProps {
  questions: QuizQuestion[];
  lessonTitle: string;
  classLevel?: string;
  onClose: () => void;
  onSubmitResults: (submission: StudentQuizSubmission) => void;
}

export const StudentQuizSheet: React.FC<StudentQuizSheetProps> = ({
  questions,
  lessonTitle,
  classLevel = 'P.7',
  onClose,
  onSubmitResults,
}) => {
  // Student Details
  const [studentName, setStudentName] = useState('Okello Moses');
  const [schoolName, setSchoolName] = useState('Kitante Primary School');
  const [hasStarted, setHasStarted] = useState(false);

  // Answers State: Record of questionIndex -> selectedOptionIndex
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Score Calculations
  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    
    // Uganda UNEB Grading Criteria
    let division = 'Division 2';
    let grade = 'C3 (Credit)';
    if (percentage >= 80) {
      division = 'Division 1 (Distinction)';
      grade = 'D1 (Distinction)';
    } else if (percentage >= 70) {
      division = 'Division 1 (Very Good)';
      grade = 'D2 (Distinction)';
    } else if (percentage >= 60) {
      division = 'Division 2 (Good)';
      grade = 'C3 (Credit)';
    } else if (percentage >= 50) {
      division = 'Division 2 (Satisfactory)';
      grade = 'C4 (Credit)';
    } else if (percentage >= 40) {
      division = 'Division 3 (Pass)';
      grade = 'P7 (Pass)';
    } else {
      division = 'Division 4 (Needs Revision)';
      grade = 'F9 (Fail)';
    }

    return { correct, total: questions.length, percentage, division, grade };
  };

  const results = calculateResults();

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (isSubmitted) return;
    setAnswers({
      ...answers,
      [qIndex]: optIndex,
    });
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      if (!confirm(`You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitted(true);
    const res = calculateResults();

    const submission: StudentQuizSubmission = {
      id: `sub-${Date.now()}`,
      studentName: studentName || 'Pupil',
      schoolName: schoolName || 'Uganda School',
      classLevel,
      lessonTitle,
      score: res.correct,
      totalQuestions: res.total,
      percentage: res.percentage,
      division: res.division,
      grade: res.grade,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
    };

    onSubmitResults(submission);

    if (res.percentage >= 60) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Fallback
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg">
                  School-Friendly Student Quiz Sheet
                </span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  UNEB Aligned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lesson: <strong>{lessonTitle}</strong> · Class: {classLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              title="Print quiz sheet for classroom use"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Worksheet</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Student Identification Bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Student / Pupil Name:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Okello Moses"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-blue-300 bg-white font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                School Name:
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Kitante Primary School"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-blue-300 bg-white font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box (If Submitted) */}
          {isSubmitted && (
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/60">
                <div>
                  <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                    Official UNEB Assessment Report
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-2">
                    {studentName}'s Score: {results.percentage}%
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {schoolName} · Answered {results.correct} of {results.total} questions correctly
                  </p>
                </div>

                <div className="bg-indigo-900/60 border border-indigo-700/80 p-3 px-5 rounded-2xl text-center shrink-0">
                  <span className="text-[10px] text-indigo-300 uppercase font-black tracking-wider block">
                    Assigned Division
                  </span>
                  <span className="text-xl font-black text-amber-400 block mt-0.5">
                    {results.division}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Grade: {results.grade}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Certificate and Retake */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowCertificate(!showCertificate)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>{showCertificate ? 'Hide Certificate' : 'View Official Certificate'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setAnswers({});
                      setShowCertificate(false);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Official Printable Certificate Preview */}
          {isSubmitted && showCertificate && (
            <div className="border-8 border-double border-amber-600 bg-amber-50/50 p-8 rounded-3xl text-center space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-2 left-2 text-amber-700 opacity-20">
                <GraduationCap className="w-32 h-32" />
              </div>

              <div className="relative z-10 space-y-2">
                <span className="text-xs font-black text-amber-800 uppercase tracking-widest block">
                  VIDEO LEARNING UGANDA · ACADEMIC RECOGNITION
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                  Certificate of Academic Competence
                </h2>
                <p className="text-xs text-slate-600 italic">
                  This certifies that the candidate named below has completed the topical assessment:
                </p>

                <div className="py-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-blue-900 border-b-2 border-slate-300 inline-block px-8 pb-1">
                    {studentName}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {schoolName} · Class: {classLevel}
                  </p>
                </div>

                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Having achieved a score of <strong>{results.percentage}% ({results.correct}/{results.total})</strong> in the topic: <strong>{lessonTitle}</strong>, graduating with honours in:
                </p>

                <div className="inline-block bg-amber-500 text-slate-950 font-black text-sm px-6 py-2 rounded-full uppercase tracking-wider shadow-sm">
                  {results.division} · {results.grade}
                </div>

                <div className="pt-6 mt-6 border-t border-amber-300 flex items-end justify-between px-6 text-xs text-slate-600">
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Tr. Ojok Mtn</p>
                    <p className="text-[10px] text-slate-500">Academic Director & Lead Instructor</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-700 flex items-center justify-center text-[9px] font-black text-amber-800 uppercase text-center rotate-12">
                    Verified Stamp
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-slate-800">{new Date().toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-500">Date of Award</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          )}

          {/* Questions List */}
          <form onSubmit={handleSubmitQuiz} className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Questions ({questions.length} Items):
              </span>
              <span className="text-xs font-semibold text-blue-700">
                Answered: {Object.keys(answers).length}/{questions.length}
              </span>
            </div>

            {questions.map((q, qIdx) => {
              const selectedOpt = answers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

              return (
                <div 
                  key={q.id || qIdx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-rose-50/70 border-rose-300'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-10">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      const isOptionCorrect = optIdx === q.correctAnswerIndex;

                      let optClasses = 'border-slate-200 hover:bg-slate-50 text-slate-700';
                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          optClasses = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optClasses = 'bg-rose-600 text-white border-rose-600 line-through';
                        } else {
                          optClasses = 'bg-white opacity-40 border-slate-200 text-slate-400';
                        }
                      } else if (isOptionSelected) {
                        optClasses = 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-2.5 ${optClasses}`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isOptionSelected || (isSubmitted && isOptionCorrect)
                              ? 'bg-white text-slate-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Answer Explanation Box on Submission */}
                  {isSubmitted && (
                    <div className="mt-4 pt-3 border-t border-slate-200 text-xs pl-0 sm:pl-10 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isCorrect ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700">
                        <strong>Teacher's Marking Guide:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Submit Action */}
            {!isSubmitted && (
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  Click 'Submit Answers' to calculate your UNEB division & certificate.
                </span>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Answers & Mark Quiz</span>
                </button>
              </div>
            )}
          </form>

        </div>

      </div>
    </div>
  );
};
