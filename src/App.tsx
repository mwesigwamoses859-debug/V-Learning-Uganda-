import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PrimarySection } from './components/PrimarySection';
import { SecondarySection } from './components/SecondarySection';
import { EventsSection } from './components/EventsSection';
import { ResourcesSection } from './components/ResourcesSection';
import { AboutContactSection } from './components/AboutContactSection';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';

// Modals
import { LessonModal } from './components/LessonModal';
import { KahootQuizModal } from './components/KahootQuizModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { EventRegistrationModal } from './components/EventRegistrationModal';
import { EventDetailModal } from './components/EventDetailModal';
import { AuthModal } from './components/AuthModal';
import { TeacherUploadStudio } from './components/TeacherUploadStudio';
import { StudentQuizSheet } from './components/StudentQuizSheet';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ExamConverterStudio } from './components/ExamConverterStudio';

import { 
  Lesson, 
  QuizQuestion, 
  EventItem, 
  PrimaryClass, 
  AnyClass, 
  ClassCurriculum, 
  StudentQuizSubmission,
  ExamPaper
} from './types';
import { 
  PRIMARY_CURRICULUM, 
  SECONDARY_CURRICULUM, 
  KAHOOT_SAMPLE_QUESTIONS 
} from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [primaryClassFilter, setPrimaryClassFilter] = useState<PrimaryClass>('P7');

  // Dynamic Curricula (Live updates when teacher uploads new lessons!)
  const [primaryData, setPrimaryData] = useState<ClassCurriculum[]>(PRIMARY_CURRICULUM);
  const [secondaryData, setSecondaryData] = useState<ClassCurriculum[]>(SECONDARY_CURRICULUM);

  // Lesson Player Modal
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // Kahoot Quiz Modal State
  const [isKahootOpen, setIsKahootOpen] = useState(false);
  const [kahootQuestions, setKahootQuestions] = useState<QuizQuestion[]>(KAHOOT_SAMPLE_QUESTIONS);
  const [kahootTitle, setKahootTitle] = useState('Uganda Kahoot Revision Challenge');

  // School-Friendly In-Website Quiz Sheet State
  const [isSchoolQuizOpen, setIsSchoolQuizOpen] = useState(false);
  const [schoolQuizQuestions, setSchoolQuizQuestions] = useState<QuizQuestion[]>([]);
  const [schoolQuizTitle, setSchoolQuizTitle] = useState('');

  // SECURE EDUCATOR ACCESS (Hidden by default for customers!)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isUploadStudioOpen, setIsUploadStudioOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isExamConverterOpen, setIsExamConverterOpen] = useState(false);

  // Student Submissions Log (Gradebook)
  const [studentSubmissions, setStudentSubmissions] = useState<StudentQuizSubmission[]>([]);

  // Exam Papers List (Extracted online exams & PDF past papers)
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([
    {
      id: 'exam-1',
      title: 'UNEB PLE 2025 Mathematics Candidate Mock Paper',
      classLevel: 'P7',
      level: 'primary',
      subject: 'Mathematics',
      year: '2025',
      term: 'Candidate Mock Paper',
      mode: 'interactive-extracted',
      pdfFileName: 'UNEB_P7_Math_Mock_2025.pdf',
      pdfFileSize: '3.8 MB',
      questions: [
        {
          id: 'q1',
          question: 'Evaluate: 3/4 + 1/2 in simplest fractional form.',
          options: ['1 1/4 (5/4)', '4/6', '7/8', '2/3'],
          correctAnswerIndex: 0,
          explanation: 'Find LCD = 4: 3/4 + 2/4 = 5/4 = 1 1/4.',
        },
        {
          id: 'q2',
          question: 'Find the size of angle x if two angles on a straight line are (3x - 10)° and (2x + 40)°.',
          options: ['30°', '45°', '25°', '50°'],
          correctAnswerIndex: 0,
          explanation: 'Angles on a straight line add up to 180°: 3x - 10 + 2x + 40 = 180 => 5x + 30 = 180 => 5x = 150 => x = 30°.',
        },
        {
          id: 'q3',
          question: 'A cyclist travelled from Kampala to Jinja, a distance of 80 km, in 2 hours. What was his average speed in km/h?',
          options: ['40 km/h', '160 km/h', '30 km/h', '50 km/h'],
          correctAnswerIndex: 0,
          explanation: 'Speed = Distance / Time = 80 km / 2 h = 40 km/h.',
        },
        {
          id: 'q4',
          question: 'Express 0.0048 in standard scientific notation (A x 10^n).',
          options: ['4.8 x 10^-3', '48 x 10^-4', '4.8 x 10^3', '0.48 x 10^-2'],
          correctAnswerIndex: 0,
          explanation: 'Move decimal point 3 places to the right: 4.8 x 10^-3.',
        }
      ],
      durationMinutes: 120,
      totalMarks: 20,
      attemptsCount: 38,
    }
  ]);

  // Event Modals
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);

  // User Auth for normal customers/students
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; phone: string; role: string } | null>(null);

  // Handler: When teacher publishes a new video lesson from TeacherUploadStudio
  const handlePublishLesson = (
    newLesson: Lesson, 
    classLevel: AnyClass, 
    subjectName: string, 
    topicName: string
  ) => {
    const isPrimary = classLevel.startsWith('P');

    if (isPrimary) {
      setPrimaryData((prev) => {
        return prev.map((cls) => {
          if (cls.classLevel === classLevel) {
            let matchedSubject = cls.subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase());
            if (!matchedSubject && cls.subjects.length > 0) {
              matchedSubject = cls.subjects[0];
            }

            if (matchedSubject) {
              const updatedSubjects = cls.subjects.map((s) => {
                if (s.id === matchedSubject!.id) {
                  const existingTopic = s.topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase());
                  if (existingTopic) {
                    return {
                      ...s,
                      topics: s.topics.map((t) => t.id === existingTopic.id ? { ...t, lessons: [newLesson, ...t.lessons] } : t)
                    };
                  } else {
                    return {
                      ...s,
                      topics: [
                        {
                          id: `top-${Date.now()}`,
                          name: topicName,
                          lessons: [newLesson]
                        },
                        ...s.topics
                      ]
                    };
                  }
                }
                return s;
              });
              return { ...cls, subjects: updatedSubjects };
            }
          }
          return cls;
        });
      });
    } else {
      setSecondaryData((prev) => {
        return prev.map((cls) => {
          if (cls.classLevel === classLevel) {
            let matchedSubject = cls.subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase());
            if (!matchedSubject && cls.subjects.length > 0) {
              matchedSubject = cls.subjects[0];
            }

            if (matchedSubject) {
              const updatedSubjects = cls.subjects.map((s) => {
                if (s.id === matchedSubject!.id) {
                  const existingTopic = s.topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase());
                  if (existingTopic) {
                    return {
                      ...s,
                      topics: s.topics.map((t) => t.id === existingTopic.id ? { ...t, lessons: [newLesson, ...t.lessons] } : t)
                    };
                  } else {
                    return {
                      ...s,
                      topics: [
                        {
                          id: `top-${Date.now()}`,
                          name: topicName,
                          lessons: [newLesson]
                        },
                        ...s.topics
                      ]
                    };
                  }
                }
                return s;
              });
              return { ...cls, subjects: updatedSubjects };
            }
          }
          return cls;
        });
      });
    }
  };

  const handleDeployExam = (newExam: ExamPaper) => {
    setExamPapers((prev) => [newExam, ...prev]);
  };

  const handleStartCustomKahoot = (questions: QuizQuestion[], title: string) => {
    setKahootQuestions(questions);
    setKahootTitle(title);
    setIsKahootOpen(true);
  };

  const handleOpenDefaultKahoot = () => {
    setKahootQuestions(KAHOOT_SAMPLE_QUESTIONS);
    setKahootTitle('Uganda All-Subjects Kahoot Sprint');
    setIsKahootOpen(true);
  };

  const handleStartSchoolQuiz = (questions: QuizQuestion[], title: string) => {
    setSchoolQuizQuestions(questions);
    setSchoolQuizTitle(title);
    setIsSchoolQuizOpen(true);
  };

  const handleSchoolQuizSubmit = (submission: StudentQuizSubmission) => {
    setStudentSubmissions((prev) => [submission, ...prev]);
  };

  const handleSearch = (query: string) => {
    const qLower = query.toLowerCase();
    if (qLower.includes('p1') || qLower.includes('p2') || qLower.includes('p3') || 
        qLower.includes('p4') || qLower.includes('p5') || qLower.includes('p6') || 
        qLower.includes('p7') || qLower.includes('primary') || qLower.includes('ple')) {
      setActiveTab('primary');
    } else if (qLower.includes('s1') || qLower.includes('s2') || qLower.includes('s3') || 
               qLower.includes('s4') || qLower.includes('s5') || qLower.includes('s6') || 
               qLower.includes('secondary') || qLower.includes('uce') || qLower.includes('uace')) {
      setActiveTab('secondary');
    } else if (qLower.includes('event') || qLower.includes('seminar') || qLower.includes('competition')) {
      setActiveTab('events');
    } else if (qLower.includes('paper') || qLower.includes('past') || qLower.includes('marking') || qLower.includes('resource') || qLower.includes('exam')) {
      setActiveTab('resources');
    } else {
      setActiveTab('primary');
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-amber-400 selection:text-black">
      
      {/* Main Navigation (Clean for customers; Admin tools only when verified) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenKahoot={handleOpenDefaultKahoot}
        onOpenDashboard={() => {
          if (isAdmin) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenUploadStudio={() => {
          if (isAdmin) {
            setIsUploadStudioOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        isAdmin={isAdmin}
        onAdminLogout={() => {
          setIsAdmin(false);
          setIsUploadStudioOpen(false);
          setIsAdminDashboardOpen(false);
          setIsExamConverterOpen(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* HOME VIEW: Clean, spacious, modern & uncluttered */}
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab, cls) => {
              setActiveTab(tab);
              if (cls) setPrimaryClassFilter(cls as PrimaryClass);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenKahoot={handleOpenDefaultKahoot}
            onSearch={handleSearch}
            onSelectLesson={(l) => setActiveLesson(l)}
            onRegisterEvent={(e) => setRegisteringEvent(e)}
          />
        )}

        {/* PRIMARY VIEW */}
        {activeTab === 'primary' && (
          <PrimarySection
            curriculum={primaryData}
            initialClass={primaryClassFilter}
            onSelectLesson={(l) => setActiveLesson(l)}
            onStartQuiz={(qs, title) => handleStartCustomKahoot(qs, title)}
          />
        )}

        {/* SECONDARY VIEW */}
        {activeTab === 'secondary' && (
          <SecondarySection
            curriculum={secondaryData}
            initialClass="S4"
            onSelectLesson={(l) => setActiveLesson(l)}
            onStartQuiz={(qs, title) => handleStartCustomKahoot(qs, title)}
          />
        )}

        {/* EVENTS VIEW */}
        {activeTab === 'events' && (
          <EventsSection
            onRegisterEvent={(e) => setRegisteringEvent(e)}
            onOpenEventDetail={(e) => setDetailEvent(e)}
          />
        )}

        {/* RESOURCES & ONLINE EXAMS VIEW */}
        {activeTab === 'resources' && (
          <ResourcesSection
            examPapers={examPapers}
            onStartExam={(qs, title) => handleStartSchoolQuiz(qs, title)}
          />
        )}

        {/* ABOUT & CONTACT VIEW */}
        {(activeTab === 'about' || activeTab === 'contact') && (
          <AboutContactSection />
        )}

      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab, cls) => {
          setActiveTab(tab);
          if (cls) setPrimaryClassFilter(cls as PrimaryClass);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDashboard={() => {
          if (isAdmin) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenKahoot={handleOpenDefaultKahoot}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isAdmin={isAdmin}
      />

      {/* MODALS */}
      {/* 1. Video & PDF Lesson Player Modal */}
      <LessonModal
        lesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        onStartKahoot={(qs, title) => handleStartCustomKahoot(qs, title)}
        onStartSchoolQuiz={(qs, title) => handleStartSchoolQuiz(qs, title)}
      />

      {/* 2. School-Friendly In-Website Student Quiz Sheet Modal */}
      {isSchoolQuizOpen && (
        <StudentQuizSheet
          questions={schoolQuizQuestions}
          lessonTitle={schoolQuizTitle}
          onClose={() => setIsSchoolQuizOpen(false)}
          onSubmitResults={handleSchoolQuizSubmit}
        />
      )}

      {/* 3. Kahoot Quiz Arena Modal */}
      {isKahootOpen && (
        <KahootQuizModal
          questions={kahootQuestions}
          quizTitle={kahootTitle}
          onClose={() => setIsKahootOpen(false)}
        />
      )}

      {/* 4. Teacher Upload Studio Modal (Restricted to Admin) */}
      {isAdmin && isUploadStudioOpen && (
        <TeacherUploadStudio
          onClose={() => setIsUploadStudioOpen(false)}
          onPublishLesson={handlePublishLesson}
        />
      )}

      {/* 5. Exam PDF Converter Studio Modal (Restricted to Admin) */}
      {isAdmin && isExamConverterOpen && (
        <ExamConverterStudio
          onClose={() => setIsExamConverterOpen(false)}
          onDeployExam={handleDeployExam}
        />
      )}

      {/* 6. Teacher & Administrator Dashboard Modal (Restricted to Admin) */}
      {isAdmin && isAdminDashboardOpen && (
        <AdminDashboardModal
          studentSubmissions={studentSubmissions}
          examPapers={examPapers}
          onOpenExamConverter={() => {
            setIsAdminDashboardOpen(false);
            setIsExamConverterOpen(true);
          }}
          onClose={() => setIsAdminDashboardOpen(false)}
          onAddLesson={(lesson) => {
            alert(`New lesson "${lesson.title}" added to ${lesson.classLevel} ${lesson.subject}!`);
          }}
          onAddEvent={(event) => {
            alert(`New event "${event.title}" published!`);
          }}
        />
      )}

      {/* 7. Admin Security Login Modal (PIN Protected) */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setIsAdminDashboardOpen(true);
          }}
        />
      )}

      {/* 8. Event Registration Modal */}
      <EventRegistrationModal
        event={registeringEvent}
        onClose={() => setRegisteringEvent(null)}
        onSuccess={(data) => {
          console.log('Registered for event:', data);
        }}
      />

      {/* 9. Event Details & Photo Gallery Modal */}
      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onRegister={(e) => {
          setDetailEvent(null);
          setRegisteringEvent(e);
        }}
      />

      {/* 10. User Sign In / Register Modal for Customers/Students */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onLogin={(u) => setUser(u)}
          currentUser={user}
          onLogout={() => setUser(null)}
        />
      )}

    </div>
  );
}

export default App;
