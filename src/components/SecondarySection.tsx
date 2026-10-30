import React, { useState } from 'react';
import { 
  Atom, 
  FlaskConical, 
  Dna, 
  Calculator, 
  TrendingUp, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  Clock, 
  User, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { SECONDARY_CURRICULUM } from '../data/mockData';
import { SecondaryClass, Lesson, QuizQuestion, SecondaryDivision, ClassCurriculum } from '../types';

interface SecondarySectionProps {
  onSelectLesson: (lesson: Lesson) => void;
  onStartQuiz: (questions: QuizQuestion[], title: string) => void;
  initialClass?: SecondaryClass;
  curriculum?: ClassCurriculum[];
}

const subjectIcons: Record<string, React.ReactNode> = {
  Atom: <Atom className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
};

export const SecondarySection: React.FC<SecondarySectionProps> = ({
  onSelectLesson,
  onStartQuiz,
  initialClass = 'S4',
  curriculum = SECONDARY_CURRICULUM,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<SecondaryDivision>('O-Level');
  const [selectedClass, setSelectedClass] = useState<SecondaryClass>(initialClass);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const oLevelClasses: SecondaryClass[] = ['S1', 'S2', 'S3', 'S4'];
  const aLevelClasses: SecondaryClass[] = ['S5', 'S6'];

  const availableClasses = selectedDivision === 'O-Level' ? oLevelClasses : aLevelClasses;

  // Make sure selectedClass matches current division
  const currentClassData = curriculum.find(c => c.classLevel === selectedClass && c.division === selectedDivision) 
    || curriculum.find(c => c.division === selectedDivision) 
    || curriculum[0];

  const activeSubject = currentClassData.subjects.find(s => s.id === selectedSubjectId) || currentClassData.subjects[0];

  return (
    <section className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Uganda Secondary Education Framework</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Secondary Learning Hub (S.1 – S.6)
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            O-Level competence-based lessons and A-Level principal subject masterclasses for UNEB UCE and UACE candidates.
          </p>
        </div>

        {/* Division Switcher: O-Level vs A-Level */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedDivision('O-Level');
                setSelectedClass('S4');
                setSelectedSubjectId('');
              }}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                selectedDivision === 'O-Level'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              O-Level (S.1 – S.4)
            </button>
            <button
              onClick={() => {
                setSelectedDivision('A-Level');
                setSelectedClass('S6');
                setSelectedSubjectId('');
              }}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                selectedDivision === 'A-Level'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              A-Level (S.5 – S.6)
            </button>
          </div>
        </div>

        {/* Class Selection Tabs */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {availableClasses.map((cls) => {
            const isSelected = currentClassData.classLevel === cls;
            const isCandidate = cls === 'S4' || cls === 'S6';

            return (
              <button
                key={cls}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedSubjectId('');
                }}
                className={`relative px-6 py-3 rounded-2xl font-black text-lg transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? selectedDivision === 'O-Level'
                      ? 'bg-blue-700 text-white shadow-lg shadow-blue-700/25 scale-105'
                      : 'bg-purple-700 text-white shadow-lg shadow-purple-700/25 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{cls}</span>
                {isCandidate && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {cls === 'S4' ? 'UCE' : 'UACE'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Class Banner */}
        <div className={`mt-6 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden ${
          selectedDivision === 'O-Level'
            ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800'
            : 'bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900'
        }`}>
          <div className="relative z-10 max-w-2xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {currentClassData.division} · {currentClassData.classLevel}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-2">
              {currentClassData.title}
            </h3>
            <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
              {currentClassData.description}
            </p>
          </div>
          <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 opacity-15 pointer-events-none text-9xl font-black">
            {currentClassData.classLevel}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="mt-8">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Subjects for {currentClassData.classLevel}:
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
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
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

        {/* Topics & Lessons List */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>{activeSubject.name} Lessons</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {activeSubject.topics.length} Units
              </span>
            </h4>
          </div>

          {activeSubject.topics.map((topic, topicIdx) => (
            <div key={topic.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  {topicIdx + 1}
                </span>
                <h5 className="font-bold text-slate-900 text-base sm:text-lg">
                  {topic.name}
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className="border border-slate-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative rounded-lg overflow-hidden mb-3 aspect-video bg-slate-900 group">
                        <img 
                          src={lesson.thumbnailUrl} 
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <button 
                          onClick={() => onSelectLesson(lesson)}
                          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
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
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Educator: <strong>{lesson.teacherName}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectLesson(lesson)}
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Watch Video</span>
                      </button>

                      {lesson.pdfFileName && (
                        <button
                          onClick={() => onSelectLesson(lesson)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center gap-1 transition-colors"
                          title={`PDF: ${lesson.pdfFileName}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-700" />
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
