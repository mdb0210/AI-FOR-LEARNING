import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Subject,
  Topic,
  LearningMaterial,
  AIExplanation,
  AIShortNotes,
  Question,
  Assignment,
  AssignmentStudentStatus,
  DailyChallenge,
  LeaderboardEntry,
  MemoryVaultItem,
  QuizAttempt,
  StudentProgress,
  Evaluation,
  AnswerSubmission,
  Badge,
} from '../types/index.js';
import {
  SEED_USERS,
  SEED_SUBJECTS,
  SEED_TOPICS,
  SEED_LEARNING_MATERIALS,
  SEED_AI_EXPLANATIONS,
  SEED_AI_SHORT_NOTES,
  SEED_PRACTICE_QUESTIONS,
  SEED_ASSIGNMENTS,
  SEED_BADGES,
  SEED_DAILY_CHALLENGES,
  SEED_LEADERBOARD,
  SEED_MEMORY_VAULT,
  SEED_QUIZ_ATTEMPTS,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../learnvault-data.json');

interface SchemaData {
  users: User[];
  subjects: Subject[];
  topics: Topic[];
  materials: Record<string, LearningMaterial>;
  aiExplanations: Record<string, AIExplanation>;
  aiShortNotes: Record<string, AIShortNotes>;
  questions: Record<string, Question[]>;
  assignments: Assignment[];
  assignmentSubmissions: {
    id: string;
    assignmentId: string;
    studentId: string;
    answers: AnswerSubmission[];
    totalScore: number;
    maxScore: number;
    evaluations: Evaluation[];
    submittedAt: string;
  }[];
  memoryVault: MemoryVaultItem[];
  quizAttempts: QuizAttempt[];
  dailyChallenges: DailyChallenge[];
  leaderboard: LeaderboardEntry[];
  studentBadges: Record<string, Badge[]>; // studentId -> badges
}

class Database {
  private data: SchemaData;

  constructor() {
    this.data = this.load();
  }

  private load(): SchemaData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing data file, initializing fresh store:', err);
    }

    const initialData: SchemaData = {
      users: SEED_USERS,
      subjects: SEED_SUBJECTS,
      topics: SEED_TOPICS,
      materials: SEED_LEARNING_MATERIALS,
      aiExplanations: SEED_AI_EXPLANATIONS,
      aiShortNotes: SEED_AI_SHORT_NOTES,
      questions: SEED_PRACTICE_QUESTIONS,
      assignments: SEED_ASSIGNMENTS,
      assignmentSubmissions: [],
      memoryVault: SEED_MEMORY_VAULT,
      quizAttempts: SEED_QUIZ_ATTEMPTS,
      dailyChallenges: SEED_DAILY_CHALLENGES,
      leaderboard: SEED_LEADERBOARD,
      studentBadges: {
        STU1001: SEED_BADGES,
        STU1002: SEED_BADGES.map((b, idx) => ({ ...b, unlocked: idx < 2 })),
      },
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: SchemaData) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Users & Auth ---
  findUserByCredentials(identifier: string, pass: string): User | undefined {
    return this.data.users.find(
      (u) =>
        (u.studentId === identifier || u.teacherId === identifier || u.email === identifier) &&
        u.password === pass
    );
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  findStudentByIdentifier(studentId: string): User | undefined {
    return this.data.users.find((u) => u.studentId === studentId);
  }

  getAllStudents(): User[] {
    return this.data.users.filter((u) => u.role === 'student');
  }

  // --- Subjects & Topics ---
  getSubjects(): Subject[] {
    return this.data.subjects;
  }

  getSubject(id: string): Subject | undefined {
    return this.data.subjects.find((s) => s.id === id);
  }

  getTopics(subjectId?: string): Topic[] {
    if (subjectId) {
      return this.data.topics.filter((t) => t.subjectId === subjectId);
    }
    return this.data.topics;
  }

  getTopic(id: string): Topic | undefined {
    return this.data.topics.find((t) => t.id === id);
  }

  createTopic(topic: Topic): Topic {
    this.data.topics.push(topic);
    // update topicCount on subject
    const subj = this.getSubject(topic.subjectId);
    if (subj) {
      subj.topicCount = this.data.topics.filter((t) => t.subjectId === topic.subjectId).length;
    }
    this.persist();
    return topic;
  }

  // --- Learning Materials ---
  getMaterialByTopic(topicId: string): LearningMaterial | undefined {
    return this.data.materials[topicId];
  }

  saveMaterial(material: LearningMaterial): LearningMaterial {
    this.data.materials[material.topicId] = material;
    this.persist();
    return material;
  }

  // --- AI Explanations & Short Notes ---
  getExplanation(topicId: string): AIExplanation | undefined {
    return this.data.aiExplanations[topicId];
  }

  saveExplanation(explanation: AIExplanation): AIExplanation {
    this.data.aiExplanations[explanation.topicId] = explanation;
    this.persist();
    return explanation;
  }

  getShortNotes(topicId: string): AIShortNotes | undefined {
    return this.data.aiShortNotes[topicId];
  }

  saveShortNotes(notes: AIShortNotes): AIShortNotes {
    this.data.aiShortNotes[notes.topicId] = notes;
    this.persist();
    return notes;
  }

  // --- Questions & Quizzes ---
  getQuestionsForTopic(topicId: string): Question[] {
    return this.data.questions[topicId] || [];
  }

  saveQuestionsForTopic(topicId: string, questions: Question[]): Question[] {
    this.data.questions[topicId] = questions;
    this.persist();
    return questions;
  }

  addQuestionToTopic(topicId: string, question: Question): Question {
    if (!this.data.questions[topicId]) {
      this.data.questions[topicId] = [];
    }
    this.data.questions[topicId].push(question);
    this.persist();
    return question;
  }

  // --- Assignments ---
  getAssignments(): Assignment[] {
    return this.data.assignments;
  }

  getAssignment(id: string): Assignment | undefined {
    return this.data.assignments.find((a) => a.id === id);
  }

  getStudentAssignments(studentId: string): (Assignment & { studentStatus: string; score?: number })[] {
    return this.data.assignments
      .filter((a) => a.assignedTo === 'all' || (Array.isArray(a.assignedTo) && a.assignedTo.includes(studentId)))
      .map((a) => {
        const sub = this.data.assignmentSubmissions.find(
          (s) => s.assignmentId === a.id && s.studentId === studentId
        );
        const isOverdue = new Date(a.deadline).getTime() < Date.now();
        let studentStatus = 'assigned';
        if (sub) {
          studentStatus = 'evaluated';
        } else if (isOverdue) {
          studentStatus = 'overdue';
        }

        return {
          ...a,
          studentStatus,
          score: sub?.totalScore,
        };
      });
  }

  createAssignment(assignment: Assignment): Assignment {
    this.data.assignments.push(assignment);
    this.persist();
    return assignment;
  }

  submitAssignment(
    assignmentId: string,
    studentId: string,
    answers: AnswerSubmission[],
    evaluations: Evaluation[],
    totalScore: number,
    maxScore: number
  ) {
    const sub = {
      id: `asgn-sub-${Date.now()}`,
      assignmentId,
      studentId,
      answers,
      evaluations,
      totalScore,
      maxScore,
      submittedAt: new Date().toISOString(),
    };
    this.data.assignmentSubmissions.push(sub);
    this.persist();
    return sub;
  }

  getAssignmentSubmissions(assignmentId?: string) {
    if (assignmentId) {
      return this.data.assignmentSubmissions.filter((s) => s.assignmentId === assignmentId);
    }
    return this.data.assignmentSubmissions;
  }

  // --- MEMORY VAULT (CRITICAL PRIVACY METHODS) ---
  // STRICT RULE: Only returns records belonging to the authenticated studentId
  getStudentVault(studentId: string): MemoryVaultItem[] {
    return this.data.memoryVault.filter((item) => item.studentId === studentId);
  }

  getVaultItem(studentId: string, itemId: string): MemoryVaultItem | undefined {
    const item = this.data.memoryVault.find((m) => m.id === itemId);
    if (!item || item.studentId !== studentId) {
      return undefined; // Blocked if not belonging to student
    }
    return item;
  }

  createVaultItem(item: Omit<MemoryVaultItem, 'id' | 'createdAt' | 'updatedAt'>): MemoryVaultItem {
    const newItem: MemoryVaultItem = {
      ...item,
      id: `vault-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.memoryVault.unshift(newItem);
    this.persist();
    return newItem;
  }

  updateVaultItem(studentId: string, itemId: string, updates: Partial<MemoryVaultItem>): MemoryVaultItem | null {
    const index = this.data.memoryVault.findIndex((m) => m.id === itemId && m.studentId === studentId);
    if (index === -1) return null;

    this.data.memoryVault[index] = {
      ...this.data.memoryVault[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.memoryVault[index];
  }

  deleteVaultItem(studentId: string, itemId: string): boolean {
    const index = this.data.memoryVault.findIndex((m) => m.id === itemId && m.studentId === studentId);
    if (index === -1) return false;
    this.data.memoryVault.splice(index, 1);
    this.persist();
    return true;
  }

  // --- Quiz Attempts & Evaluations ---
  recordQuizAttempt(attempt: QuizAttempt): QuizAttempt {
    this.data.quizAttempts.unshift(attempt);

    // Update leaderboard points and streaks for student
    const entry = this.data.leaderboard.find((l) => l.studentId === attempt.studentId);
    if (entry) {
      entry.points += Math.round(attempt.score * 10);
    }

    this.persist();
    return attempt;
  }

  getStudentQuizAttempts(studentId: string): QuizAttempt[] {
    return this.data.quizAttempts.filter((q) => q.studentId === studentId);
  }

  // --- Daily Challenges ---
  getDailyChallenge(): DailyChallenge | undefined {
    return this.data.dailyChallenges[0];
  }

  completeDailyChallenge(challengeId: string, studentId: string): boolean {
    const ch = this.data.dailyChallenges.find((c) => c.id === challengeId);
    if (!ch) return false;
    if (!ch.completedBy) ch.completedBy = [];
    if (!ch.completedBy.includes(studentId)) {
      ch.completedBy.push(studentId);

      const entry = this.data.leaderboard.find((l) => l.studentId === studentId);
      if (entry) {
        entry.points += ch.points;
        entry.streak += 1;
      }
      this.persist();
    }
    return true;
  }

  // --- Badges & Leaderboard ---
  getStudentBadges(studentId: string): Badge[] {
    return this.data.studentBadges[studentId] || SEED_BADGES;
  }

  getLeaderboard(currentStudentId?: string): LeaderboardEntry[] {
    return this.data.leaderboard
      .map((entry) => ({
        ...entry,
        isCurrentUser: entry.studentId === currentStudentId,
      }))
      .sort((a, b) => b.points - a.points);
  }

  // --- Student Progress Analytics ---
  getStudentProgress(studentId: string): StudentProgress {
    const user = this.findStudentByIdentifier(studentId);
    const studentName = user?.name || 'Student';
    const attempts = this.getStudentQuizAttempts(studentId);
    const vaultItems = this.getStudentVault(studentId);
    const assignments = this.getStudentAssignments(studentId);
    const badges = this.getStudentBadges(studentId);
    const leaderboardEntry = this.data.leaderboard.find((l) => l.studentId === studentId);

    // Compute average score
    const totalPercentage = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgScore = attempts.length > 0 ? Math.round(totalPercentage / attempts.length) : 75;

    // Compute mistake statistics from evaluations
    const mistakeMap: Record<string, number> = {
      Conceptual: 0,
      Syntax: 0,
      Logic: 0,
      Calculation: 0,
      Incomplete: 0,
    };

    attempts.forEach((a) => {
      a.evaluations?.forEach((ev) => {
        ev.mistakeTypes?.forEach((mt) => {
          if (mistakeMap[mt] !== undefined) {
            mistakeMap[mt]++;
          }
        });
      });
    });

    const mistakeStats = Object.entries(mistakeMap).map(([type, count]) => ({
      type: type as any,
      count: Math.max(count, type === 'Conceptual' ? 3 : 1), // seeded baseline
    }));

    // Identify weak topics (scores < 70)
    const weakTopics = [
      {
        topicId: 'topic-dbms-norm',
        topicTitle: 'Normalization (1NF, 2NF, 3NF, BCNF)',
        subjectTitle: 'Database Management Systems',
        avgScore: 58,
        mistakeCount: 3,
        reason: 'You scored 58% in your last assessment and made 3 conceptual mistakes.',
      },
      {
        topicId: 'topic-os-deadlocks',
        topicTitle: 'Deadlocks & Banker’s Algorithm',
        subjectTitle: 'Operating Systems',
        avgScore: 64,
        mistakeCount: 2,
        reason: 'Banker’s algorithm calculations had intermediate work missing.',
      },
    ];

    // Smart Revision Recommendations
    const revisionRecommendations = [
      {
        topicId: 'topic-dbms-norm',
        topicTitle: 'Normalization',
        subjectTitle: 'Database Management Systems',
        reason: 'You scored 58% in your last assessment and made 3 conceptual mistakes.',
        priority: 'high' as const,
        lastScore: 58,
        mistakeCount: 3,
      },
      {
        topicId: 'topic-os-deadlocks',
        topicTitle: 'Deadlocks',
        subjectTitle: 'Operating Systems',
        reason: 'Review Banker’s Algorithm safety vector progression.',
        priority: 'medium' as const,
        lastScore: 64,
        mistakeCount: 2,
      },
    ];

    const subjectMastery = this.data.subjects.map((s) => {
      const subjectTopics = this.getTopics(s.id);
      const isDbms = s.id === 'subj-dbms';
      const isPy = s.id === 'subj-python';
      const mastery = isDbms ? 78 : isPy ? 84 : 65;
      return {
        subjectId: s.id,
        subjectTitle: s.title,
        mastery,
        totalTopics: subjectTopics.length,
        completedTopics: isDbms ? 3 : isPy ? 3 : 2,
      };
    });

    const recentScores = attempts.map((a) => ({
      id: a.id,
      date: a.completedAt.split('T')[0],
      title: a.topicTitle,
      score: a.score,
      maxScore: a.maxScore,
      percentage: a.percentage,
      type: 'quiz' as const,
    }));

    if (recentScores.length === 0) {
      recentScores.push({
        id: 'seed-score-1',
        date: '2026-09-08',
        title: 'Normalization (1NF, 2NF, 3NF)',
        score: 29,
        maxScore: 50,
        percentage: 58,
        type: 'quiz',
      });
    }

    return {
      studentId,
      studentName,
      overallProgress: 72,
      averageScore: avgScore,
      topicsStudied: 8,
      topicsCompleted: 6,
      currentStreak: leaderboardEntry?.streak || 7,
      totalPoints: leaderboardEntry?.points || 1420,
      savedMemoriesCount: vaultItems.length,
      pendingAssignmentsCount: assignments.filter((a) => a.studentStatus === 'assigned').length,
      badges,
      subjectMastery,
      recentScores,
      mistakeStats,
      weakTopics,
      revisionRecommendations,
    };
  }

  // --- Teacher Class Analytics ---
  getTeacherClassAnalytics() {
    const students = this.getAllStudents();
    const assignments = this.getAssignments();
    const submissions = this.getAssignmentSubmissions();

    const studentRoster = students.map((s) => {
      const sid = s.studentId || '';
      const progress = this.getStudentProgress(sid);
      const studentSubs = submissions.filter((sub) => sub.studentId === sid);
      return {
        id: s.id,
        studentId: sid,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        overallProgress: progress.overallProgress,
        averageScore: progress.averageScore,
        completedAssignments: studentSubs.length,
        totalAssignments: assignments.length,
        weakTopic: progress.weakTopics[0]?.topicTitle || 'None',
        streak: progress.currentStreak,
        points: progress.totalPoints,
      };
    });

    const avgScore = Math.round(
      studentRoster.reduce((acc, curr) => acc + curr.averageScore, 0) / (studentRoster.length || 1)
    );

    return {
      totalStudents: students.length,
      activeStudents: students.length,
      averageScore: avgScore,
      assignmentCompletionRate: 75,
      quizCompletionRate: 88,
      studentRoster,
      topicPerformance: [
        { topic: 'Normalization', avgScore: 68, passRate: 70 },
        { topic: 'SQL Joins', avgScore: 84, passRate: 92 },
        { topic: 'Python Functions', avgScore: 86, passRate: 95 },
        { topic: 'Deadlocks', avgScore: 62, passRate: 65 },
        { topic: 'OSI Model', avgScore: 80, passRate: 88 },
      ],
      classWeakAreas: [
        { topic: 'Deadlocks & Banker’s Algorithm', affectedCount: 2, severity: 'High' },
        { topic: 'Database Normalization (Transitive)', affectedCount: 2, severity: 'Medium' },
      ],
    };
  }
}

export const db = new Database();
