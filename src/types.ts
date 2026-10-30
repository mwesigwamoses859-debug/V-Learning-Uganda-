export type SchoolLevel = 'primary' | 'secondary';

export type PrimaryClass = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';
export type SecondaryClass = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
export type AnyClass = PrimaryClass | SecondaryClass;

export type SecondaryDivision = 'O-Level' | 'A-Level';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // Options for Kahoot style
  correctAnswerIndex: number; // 0, 1, 2, or 3
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl: string; // YouTube embed or direct mp4
  thumbnailUrl: string;
  description: string;
  teacherName: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  quiz?: QuizQuestion[];
  isFree: boolean;
}

export interface Topic {
  id: string;
  name: string;
  lessons: Lesson[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  topics: Topic[];
}

export interface ClassCurriculum {
  classLevel: AnyClass;
  title: string;
  level: SchoolLevel;
  division?: SecondaryDivision; // O-Level (S1-S4) or A-Level (S5-S6)
  description: string;
  subjects: Subject[];
}

export type EventType = 'Quiz Competition' | 'Seminar' | 'Workshop';
export type EventAudience = 'Primary' | 'Secondary' | 'Teachers' | 'All Learners';
export type EventStatus = 'Upcoming' | 'Past Event';

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  audience: EventAudience;
  date: string;
  time: string;
  venue: string; // Physical location (e.g. Makerere College Hall) or "Online Live Stream"
  joiningLink?: string;
  description: string;
  organizer: string;
  bannerImage: string;
  status: EventStatus;
  maxRegistrations?: number;
  currentRegistrations: number;
  photos?: string[];
  recordingVideoUrl?: string;
  downloadableMaterials?: {
    name: string;
    url: string;
    size: string;
  }[];
}

export interface ResourceItem {
  id: string;
  title: string;
  level: SchoolLevel;
  classLevel: AnyClass;
  subject: string;
  type: 'Past Paper' | 'Marking Guide' | 'Revision Notes' | 'Worksheet';
  year?: string;
  fileSize: string;
  downloadsCount: number;
  downloadUrl: string;
}

export interface UserRegistration {
  name: string;
  phone: string;
  schoolName: string;
  classLevel: string;
  email?: string;
  eventId: string;
  timestamp: string;
}

export interface StudentQuizSubmission {
  id: string;
  studentName: string;
  schoolName: string;
  classLevel: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  division: string; // e.g. "Division 1 (Distinction)" or "Division 2"
  grade: string; // e.g. "D1", "D2", "C3", "Pass"
  completedAt: string;
  answersBreakdown?: Record<number, boolean>; // Question index -> correct or wrong
}

export interface ExamPaper {
  id: string;
  title: string;
  classLevel: AnyClass;
  level: SchoolLevel;
  subject: string;
  year?: string;
  term?: string;
  mode: 'pdf-only' | 'interactive-extracted';
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfUrl?: string;
  questions?: QuizQuestion[];
  durationMinutes?: number;
  totalMarks?: number;
  attemptsCount: number;
  averageScore?: number;
}
