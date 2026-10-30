import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Video, 
  FileText, 
  HelpCircle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { SchoolLevel, AnyClass, Lesson, QuizQuestion } from '../types';

interface TeacherUploadStudioProps {
  onClose: () => void;
  onPublishLesson: (newLesson: Lesson, classLevel: AnyClass, subjectName: string, topicName: string) => void;
}

export const TeacherUploadStudio: React.FC<TeacherUploadStudioProps> = ({
  onClose,
  onPublishLesson,
}) => {
  const [level, setLevel] = useState<SchoolLevel>('primary');
  const [classLevel, setClassLevel] = useState<AnyClass>('P7');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [topicName, setTopicName] = useState('Sets and Venn Diagrams');
  
  // Lesson info
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState('Tr. Ojok Mtn');
  
  // PDF notes attachment
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('2.4 MB');

  // Quiz Builder
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: `q-1`,
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
    }
  ]);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIdx].options];
    newOptions[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: newOptions };
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      alert('Please provide a lesson title.');
      return;
    }

    // Clean up questions
    const validQuestions = questions.filter(q => q.question.trim() !== '');

    const newLesson: Lesson = {
      id: `lesson-custom-${Date.now()}`,
      title: lessonTitle,
      durationMinutes,
      videoUrl: videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
      description: description || `Lesson on ${topicName} presented by ${teacherName}.`,
      teacherName: teacherName || 'Tr. Ojok Mtn',
      pdfFileName: pdfFileName ? (pdfFileName.endsWith('.pdf') ? pdfFileName : `${pdfFileName}.pdf`) : undefined,
      pdfFileSize: pdfFileName ? pdfFileSize : undefined,
      pdfUrl: '#',
      quiz: validQuestions.length > 0 ? validQuestions : undefined,
      isFree: true,
    };

    onPublishLesson(newLesson, classLevel, subjectName, topicName);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 px-6 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg">
                  Teacher Upload Studio
                </span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Creator Portal
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Upload your video lesson, attach PDF revision notes, and create student practice quiz questions.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {isSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Lesson successfully uploaded! It is now live in {classLevel} {subjectName} for your students.</span>
            </div>
          )}

          {/* Section 1: Class, Subject & Topic Classification */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>1. Class & Subject Placement</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  School Level *
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    const nextLevel = e.target.value as SchoolLevel;
                    setLevel(nextLevel);
                    setClassLevel(nextLevel === 'primary' ? 'P7' : 'S4');
                    setSubjectName(nextLevel === 'primary' ? 'Mathematics' : 'Physics');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-semibold"
                >
                  <option value="primary">Primary (P1–P7)</option>
                  <option value="secondary">Secondary (S1–S6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Class *
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value as AnyClass)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold text-blue-700"
                >
                  {level === 'primary' ? (
                    <>
                      <option value="P1">P.1 (Primary 1)</option>
                      <option value="P2">P.2 (Primary 2)</option>
                      <option value="P3">P.3 (Primary 3)</option>
                      <option value="P4">P.4 (Primary 4)</option>
                      <option value="P5">P.5 (Primary 5)</option>
                      <option value="P6">P.6 (Primary 6)</option>
                      <option value="P7">P.7 (PLE Candidate)</option>
                    </>
                  ) : (
                    <>
                      <option value="S1">S.1 (Senior 1)</option>
                      <option value="S2">S.2 (Senior 2)</option>
                      <option value="S3">S.3 (Senior 3)</option>
                      <option value="S4">S.4 (UCE Candidate)</option>
                      <option value="S5">S.5 (Senior 5)</option>
                      <option value="S6">S.6 (UACE Candidate)</option>
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
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Integrated Science"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic / Chapter Name *
                </label>
                <input
                  type="text"
                  required
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Human Digestive System"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Video Lesson Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-4 h-4 text-rose-600" />
              <span>2. Video Lesson Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Identifying Organs in Digestion & Enzymes Explained"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructor Name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Tr. Ojok Mtn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Embed URL or Link (YouTube / Vimeo / Cloudflare) *
                </label>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lesson Summary / Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will learners discover and learn in this video?"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              />
            </div>

            {/* Attached PDF Handout */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Attach Printable PDF Revision Notes (Filename)</span>
                </label>
                <input
                  type="text"
                  value={pdfFileName}
                  onChange={(e) => setPdfFileName(e.target.value)}
                  placeholder="e.g. Digestive_System_Summary_Notes.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PDF Estimated Size
                </label>
                <input
                  type="text"
                  value={pdfFileSize}
                  onChange={(e) => setPdfFileSize(e.target.value)}
                  placeholder="2.4 MB"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Student Quiz Builder */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-700" />
                  <span>3. Student Assessment Quiz ({questions.length} Questions)</span>
                </h4>
                <p className="text-xs text-purple-700 mt-0.5">
                  Students will answer these questions directly on the website right after watching the video.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white rounded-2xl border border-purple-200 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-100 text-purple-800 font-black text-xs px-2.5 py-0.5 rounded-md">
                      Question {qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Question Prompt:
                    </label>
                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                      placeholder="e.g. Which enzyme in saliva breaks down cooked starch into maltose?"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswerIndex === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctAnswerIndex', optIdx)}
                          className="w-4 h-4 text-purple-600 cursor-pointer"
                          title="Mark this option as correct"
                        />
                        <span className="font-bold text-slate-700">{letter}:</span>
                        <input
                          type="text"
                          required
                          value={q.options[optIdx] || ''}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${letter}`}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Teacher Explanation (Shown to students after answering):
                    </label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                      placeholder="e.g. Salivary amylase (ptyalin) converts starch to maltose in the mouth."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-7 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Publish Lesson to Class</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
