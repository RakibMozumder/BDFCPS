/**
 * Types defining FCPS prep application entities and applet state interfaces.
 */

export interface DoctorProfile {
  name: string;
  specialty: string;
  targetDate: string;
  targetSpecialty: string;
  hospital: string;
  avatar: string;
  dailyStudyGoal?: number; // Target number of MCQs per day
}

export type SubjectCategory =
  | 'Anatomy'
  | 'Physiology & Biochemistry'
  | 'Pathology & Microbiology'
  | 'Medicine & Allied'
  | 'Surgery & Allied'
  | 'Gynecology & Obstetrics'
  | 'Pediatrics';

export interface Question {
  id: string;
  subject: SubjectCategory;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-4
  explanation: string;
  reference: string; // e.g., "Harrison's 21st Ed, p. 1420"
}

export interface Exam {
  id: string;
  title: string;
  subject: SubjectCategory;
  questionCount: number;
  durationMinutes: number;
  startTime: string; // ISO string or relative descriptive
  status: 'Active' | 'Upcoming' | 'Completed';
  questions: Question[];
}

export interface UserProgress {
  streakCount: number;
  completedExamCount: number;
  questionsSolvedCount: number;
  averageScorePercentage: number;
  history: {
    date: string;
    questionsSolved: number;
    score: number;
  }[];
  subjectAverages: Record<SubjectCategory, number>;
}
