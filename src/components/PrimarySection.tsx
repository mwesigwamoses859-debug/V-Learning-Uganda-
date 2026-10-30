import React, { useState } from 'react';
import { 
  Calculator, 
  FlaskConical, 
  Globe, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  User, 
  Award,
  Sparkles,
  Download
} from 'lucide-react';
import { PRIMARY_CURRICULUM } from '../data/mockData';
import { PrimaryClass, Lesson, QuizQuestion, ClassCurriculum } from '../types';

interface PrimarySectionProps {
  onSelectLesson: (lesson: Lesson) => void;
  onStartQuiz: (questions: QuizQuestion[], title: string) => void;
  initialClass?: PrimaryClass;
  curriculum?: ClassCurriculum[];
}

const subjectIcons: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
};

export const PrimarySection: React.FC<PrimarySectionProps> = ({
  onSelectLesson,
  onStartQuiz,
  initialClass = 'P7',
  curriculum = PRIMARY_CURRICULUM,
}) => {
  const [selectedClass, setSelectedClass] = useState<PrimaryClass>(initialClass);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const currentClassData = curriculum.find(c => c.classLevel === selectedClass) || curriculum[0];
  const activeSubject = currentClassData.subjects.find(s => s.id === selectedSubjectId) || currentClassData.subjects[0];

  const classList: PrimaryClass[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];

  return (
    <section className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uganda Primary School Curriculum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Primary Learning Hub (P.1 – P.7)
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Select your class below to access organized video lessons, printable PDF summaries, and automatic-marked practice quizzes.
          </p>
        </div>

        {/* Class Selection Tabs (P1 to P7) */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {classList.map((cls) => {
            const isSelected = selectedClass === cls;
            const isCandidate = cls === 'P7';
            return (
              <button
                key={cls}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedSubjectId('');
                }}
                className={`relative px-5 py-3 rounded-2xl font-black text-base sm:text-lg transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{cls}</span>
                {isCandidate && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-900 text-amber-300' : 'bg-red-500 text-white'
                  }`}>
                    PLE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Class Banner */}
        <div className="mt-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="bg-black/25 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {currentClassData.classLevel === 'P7' ? 'UNEB PLE Candidate Focus' : 'Foundational Mastery'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-2">
              {currentClassData.title}
            </h3>
            <p className="mt-2 text-amber-50 text-sm sm:text-base leading-relaxed">
              {currentClassData.description}
            </p>
          </div>
          {/* Decorative badge */}
          <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 opacity-15 pointer-events-none text-9xl font-black">
            {currentClassData.classLevel}
          </div>
        </div>

        {/* Subjects Selector Bar */}
        <div className="mt-8">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Subjects in {currentClassData.classLevel}:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentClassData.subjects.map((subj) => {
              const isSubjActive = activeSubject.id === subj.id;
              const totalLessons = subj.topics.reduce((acc, t) => acc + t.lessons.length, 0);

              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 ${
                    isSubjActive
                      ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${subj.color} text-white shadow-xs`}>
                    {subjectIcons[subj.icon] || <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                      {subj.name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {subj.topics.length} Topics · {totalLessons} Lessons
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics & Lessons Accordion List */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>{activeSubject.name} Lessons</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {activeSubject.topics.length} Units
              </span>
            </h4>
          </div>

          {activeSubject.topics.map((topic, topicIndex) => (
            <div key={topic.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  {topicIndex + 1}
                </span>
                <h5 className="font-bold text-slate-900 text-base sm:text-lg">
                  {topic.name}
                </h5>
              </div>

              {/* Lessons Grid within this topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className="border border-slate-100 rounded-xl p-4 hover:border-amber-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Thumbnail & Badges */}
                      <div className="relative rounded-lg overflow-hidden mb-3 aspect-video bg-slate-900 group">
                        <img 
                          src={lesson.thumbnailUrl} 
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <button 
                          onClick={() => onSelectLesson(lesson)}
                          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          title="Watch video lesson"
                        >
                          <PlayCircle className="w-7 h-7" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.durationMinutes} mins</span>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                          Free Lesson
                        </div>
                      </div>

                      <h6 className="font-bold text-slate-900 text-base line-clamp-2">
                        {lesson.title}
                      </h6>
                      
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {lesson.description}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>Teacher: <strong>{lesson.teacherName}</strong></span>
                      </div>
                    </div>

                    {/* Lesson Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectLesson(lesson)}
                        className="bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Watch Video</span>
                      </button>

                      {lesson.pdfFileName && (
                        <button
                          onClick={() => onSelectLesson(lesson)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center gap-1 transition-colors"
                          title={`PDF: ${lesson.pdfFileName}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>PDF Notes</span>
                        </button>
                      )}

                      {lesson.quiz && lesson.quiz.length > 0 && (
                        <button
                          onClick={() => onStartQuiz(lesson.quiz!, lesson.title)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold px-2.5 py-2 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
                          <span>Quiz ({lesson.quiz.length} Qs)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
