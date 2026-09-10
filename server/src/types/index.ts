export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  studentId?: string;
  teacherId?: string;
  password: string;
  avatar?: string;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  topicCount: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  subjectTitle?: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  summary: string;
}

export interface LearningMaterial {
  id: string;
  topicId: string;
  teacherId?: string;
  title: string;
  content: string;
  keyPoints: string[];
  examples: string[];
  commonMistakes: string[];
  resources: { title: string; url: string }[];
  published: boolean;
  updatedAt: string;
}

export interface AIExplanation {
  topicId: string;
  whatIsIt: string;
  whyDoesItMatter: string;
  simpleExplanation: string;
  example: string;
  keyPoints: string[];
  commonMistakes: string[];
  quickRecap: string;
  disclaimer: string;
}

export interface AIShortNotes {
  topicId: string;
  title: string;
  definition: string;
  keyConcepts: string[];
  formulasRules: string[];
  examples: string[];
  commonMistakes: string[];
  examPoints: string[];
  quickRecap: string;
}

export type QuestionType =
  | 'mcq'
  | 'one-line'
  | 'short'
  | 'long'
  | 'multi-part'
  | 'coding'
  | 'math'
  | 'diagram';

export interface QuestionPart {
  id: string;
  partLetter: string;
  question: string;
  points: number;
  rubric: string;
}

export interface Question {
  id: string;
  topicId?: string;
  assignmentId?: string;
  questionType: QuestionType;
  title?: string;
  question: string;
  points: number;
  expectedAnswerStyle?: string;
  rubric: string;
  options?: string[];
  correctAnswer?: string;
  parts?: QuestionPart[];
  codeTemplate?: string;
  language?: string;
  expectedBehavior?: string;
}

export interface PartAnswer {
  partId: string;
  answerType: 'text' | 'voice' | 'image';
  textAnswer?: string;
  voiceDataUrl?: string;
  voiceTranscript?: string;
  imageDataUrl?: string;
}

export interface AnswerSubmission {
  questionId: string;
  answerType: 'text' | 'voice' | 'image';
  textAnswer?: string;
  voiceDataUrl?: string;
  voiceDuration?: number;
  voiceTranscript?: string;
  imageDataUrl?: string;
  imageDescription?: string;
  multiPartAnswers?: PartAnswer[];
}

export interface PartEvaluation {
  partId: string;
  partLetter: string;
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  missingPoints: string[];
}

export interface CodingEvaluationDetails {
  codeScore: number;
  whatWorks: string[];
  bugsFound: string[];
  whyItIsWrong: string;
  suggestedImprovement: string;
}

export type MistakeType = 'Conceptual' | 'Syntax' | 'Logic' | 'Calculation' | 'Incomplete';

export interface Evaluation {
  id: string;
  submissionId: string;
  studentId: string;
  assessmentId: string;
  questionId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  overallFeedback: string;
  strengths: string[];
  missingPoints: string[];
  mistakes: string[];
  mistakeTypes: MistakeType[];
  improvementSuggestions: string[];
  revisionRecommendation: {
    topic: string;
    topicId?: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
  };
  partEvaluations?: PartEvaluation[];
  codingDetails?: CodingEvaluationDetails;
  submittedAt: string;
}

export interface MemoryVaultItem {
  id: string;
  studentId: string; // Strictly private ownership
  topicId: string;
  subjectId?: string;
  topicTitle: string;
  title: string;
  contentType: 'text' | 'voice' | 'image';
  textContent?: string;
  voiceDataUrl?: string;
  voiceDuration?: number;
  transcript?: string;
  imageDataUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  teacherId: string;
  subjectId: string;
  topicId: string;
  topicTitle?: string;
  subjectTitle?: string;
  title: string;
  description: string;
  totalMarks: number;
  deadline: string;
  assignedTo: 'all' | string[]; // 'all' or array of studentIds e.g. ['STU1001']
  questions: Question[];
  createdAt: string;
}

export interface AssignmentStudentStatus {
  assignmentId: string;
  studentId: string;
  studentName: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'evaluated' | 'overdue';
  score?: number;
  maxScore: number;
  submittedAt?: string;
  submissionId?: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  topicId: string;
  topicTitle: string;
  subjectTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  evaluations: Evaluation[];
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  overallProgress: number;
  averageScore: number;
  topicsStudied: number;
  topicsCompleted: number;
  currentStreak: number;
  totalPoints: number;
  savedMemoriesCount: number;
  pendingAssignmentsCount: number;
  badges: Badge[];
  subjectMastery: {
    subjectId: string;
    subjectTitle: string;
    mastery: number;
    totalTopics: number;
    completedTopics: number;
  }[];
  recentScores: {
    id: string;
    date: string;
    title: string;
    score: number;
    maxScore: number;
    percentage: number;
    type: 'quiz' | 'assignment' | 'challenge';
  }[];
  mistakeStats: {
    type: MistakeType;
    count: number;
  }[];
  weakTopics: {
    topicId: string;
    topicTitle: string;
    subjectTitle: string;
    avgScore: number;
    mistakeCount: number;
    reason: string;
  }[];
  revisionRecommendations: {
    topicId: string;
    topicTitle: string;
    subjectTitle: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    lastScore?: number;
    mistakeCount?: number;
  }[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  timeLimitSeconds: number;
  points: number;
  question: Question;
  date: string;
  completedBy: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  badgesCount: number;
  isCurrentUser?: boolean;
}
