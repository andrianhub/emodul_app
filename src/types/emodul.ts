export interface StudentRecord {
  id: number;
  fullName: string;
  className: string;
  absenNumber: string | null;
  usedAudio: boolean;
  audioMinutes: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface ProgressRecord {
  id: number;
  studentId: number;
  sectionSlug: string;
  isRead: boolean;
  listenedAudio: boolean;
  completedAt: string;
}

export interface ExamSubmissionRecord {
  id: number;
  studentId: number;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
  status: "draft" | "submitted" | "graded" | string;
  score1: number | null;
  score2: number | null;
  score3: number | null;
  score4: number | null;
  score5: number | null;
  totalScore: number | null;
  teacherFeedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  updatedAt: string;
}

export interface StudentSessionResponse {
  student: StudentRecord;
  progress: ProgressRecord[];
  submission: ExamSubmissionRecord | null;
  isReturning?: boolean;
}

export interface TeacherStudentRow {
  student: StudentRecord;
  progress: ProgressRecord[];
  readCount: number;
  totalSections: number;
  completedReading: boolean;
  listenedCount: number;
  submission: ExamSubmissionRecord | null;
}

export interface TeacherDashboardStats {
  totalStudents: number;
  completedAllReading: number;
  usedAudioCount: number;
  submittedExamCount: number;
  gradedExamCount: number;
  averageScore: number | null;
}

export interface TeacherDashboardData {
  teacherName: string;
  stats: TeacherDashboardStats;
  records: TeacherStudentRow[];
}
