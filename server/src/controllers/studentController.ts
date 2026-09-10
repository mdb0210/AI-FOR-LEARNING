import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { evaluationEngine } from '../services/evaluationEngine.js';
import { AnswerSubmission, Evaluation, QuizAttempt } from '../types/index.js';

export function getDashboard(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });

  const progress = db.getStudentProgress(studentId);
  const assignments = db.getStudentAssignments(studentId);
  const challenge = db.getDailyChallenge();

  const isChallengeCompleted = challenge?.completedBy?.includes(studentId) || false;

  return res.json({
    student: {
      name: req.user?.name,
      studentId: req.user?.studentId,
      avatar: req.user?.avatar,
    },
    metrics: {
      overallProgress: progress.overallProgress,
      averageScore: progress.averageScore,
      topicsCompleted: progress.topicsCompleted,
      topicsStudied: progress.topicsStudied,
      currentStreak: progress.currentStreak,
      totalPoints: progress.totalPoints,
      savedMemoriesCount: progress.savedMemoriesCount,
      pendingAssignmentsCount: progress.pendingAssignmentsCount,
    },
    activeTopics: db.getTopics().slice(0, 3),
    reviseToday: progress.revisionRecommendations[0] || null,
    upcomingAssignments: assignments.slice(0, 3),
    dailyChallenge: challenge ? { ...challenge, isCompleted: isChallengeCompleted } : null,
    recentScores: progress.recentScores,
    subjectMastery: progress.subjectMastery,
  });
}

export function getSubjects(req: Request, res: Response) {
  const subjects = db.getSubjects().map((s) => ({
    ...s,
    topics: db.getTopics(s.id),
  }));
  return res.json({ subjects });
}

export function getTopicDetail(req: Request, res: Response) {
  const { id } = req.params;
  const topic = db.getTopic(id);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found.' });
  }

  const subject = db.getSubject(topic.subjectId);
  const teacherMaterial = db.getMaterialByTopic(id);
  const explanation = db.getExplanation(id);
  const shortNotes = db.getShortNotes(id);
  const questions = db.getQuestionsForTopic(id);

  return res.json({
    topic,
    subject,
    teacherMaterial,
    explanation,
    shortNotes,
    questionsCount: questions.length,
  });
}

export function getStudentAssignments(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });

  const assignments = db.getStudentAssignments(studentId);
  return res.json({ assignments });
}

export function getStudentAssignmentDetail(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  const { id } = req.params;
  const assignment = db.getAssignment(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });

  const submissions = db.getAssignmentSubmissions(id).filter((s) => s.studentId === studentId);
  const latestSub = submissions[submissions.length - 1];

  return res.json({
    assignment,
    submission: latestSub || null,
    isSubmitted: !!latestSub,
  });
}

export async function submitAssignment(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  const { id } = req.params;
  const { answers } = req.body as { answers: AnswerSubmission[] };

  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });
  const assignment = db.getAssignment(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });

  // Evaluate each question using EvaluationEngine
  const evaluations: Evaluation[] = [];
  let totalScore = 0;
  let maxScore = 0;

  for (const q of assignment.questions) {
    maxScore += q.points;
    const ans = answers.find((a) => a.questionId === q.id) || {
      questionId: q.id,
      answerType: 'text',
      textAnswer: '',
    };
    const evalResult = await evaluationEngine.evaluateAnswer(q, ans, studentId, assignment.id);
    evaluations.push(evalResult);
    totalScore += evalResult.score;
  }

  const roundedTotal = Math.round(totalScore * 10) / 10;
  const submissionRecord = db.submitAssignment(
    assignment.id,
    studentId,
    answers,
    evaluations,
    roundedTotal,
    maxScore
  );

  return res.status(201).json({
    submission: submissionRecord,
    evaluations,
    totalScore: roundedTotal,
    maxScore,
    percentage: Math.round((roundedTotal / maxScore) * 100),
    message: 'Assignment evaluated by AI and submitted successfully.',
  });
}

export async function submitPracticeQuiz(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });

  const { topicId, answers } = req.body as { topicId: string; answers: AnswerSubmission[] };
  const topic = db.getTopic(topicId);
  const questions = db.getQuestionsForTopic(topicId);

  const evaluations: Evaluation[] = [];
  let totalScore = 0;
  let maxScore = 0;

  for (const ans of answers) {
    const q = questions.find((item) => item.id === ans.questionId) || {
      id: ans.questionId,
      questionType: 'short' as const,
      question: 'Question',
      points: 10,
      rubric: 'Standard rubric',
    };
    maxScore += q.points;
    const evalResult = await evaluationEngine.evaluateAnswer(q, ans, studentId, `quiz-${topicId}`);
    evaluations.push(evalResult);
    totalScore += evalResult.score;
  }

  const roundedTotal = Math.round(totalScore * 10) / 10;
  const percentage = maxScore > 0 ? Math.round((roundedTotal / maxScore) * 100) : 0;

  const attempt: QuizAttempt = {
    id: `attempt-${Date.now()}`,
    studentId,
    topicId,
    topicTitle: topic?.title || 'Practice Assessment',
    subjectTitle: topic?.subjectTitle || 'Subject',
    score: roundedTotal,
    maxScore,
    percentage,
    completedAt: new Date().toISOString(),
    evaluations,
  };

  db.recordQuizAttempt(attempt);

  return res.status(201).json({
    attempt,
    evaluations,
    score: roundedTotal,
    maxScore,
    percentage,
    message: 'Quiz evaluated by AI engine.',
  });
}

export function getProgress(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });

  const progress = db.getStudentProgress(studentId);
  return res.json({ progress });
}

export function getSmartRevision(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });

  const progress = db.getStudentProgress(studentId);
  return res.json({
    revisionRecommendations: progress.revisionRecommendations,
    weakTopics: progress.weakTopics,
    mistakeStats: progress.mistakeStats,
  });
}

export function getTodayChallenge(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  const challenge = db.getDailyChallenge();
  if (!challenge) return res.status(404).json({ error: 'No active challenge found.' });

  const isCompleted = studentId ? challenge.completedBy?.includes(studentId) : false;
  return res.json({ challenge: { ...challenge, isCompleted } });
}

export async function completeTodayChallenge(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  const { id } = req.params;
  const { answer } = req.body as { answer: AnswerSubmission };

  if (!studentId) return res.status(403).json({ error: 'Student ID missing.' });

  const ch = db.getDailyChallenge();
  if (!ch) return res.status(404).json({ error: 'Challenge not found.' });

  const evalResult = await evaluationEngine.evaluateAnswer(ch.question, answer, studentId, `ch-${id}`);
  db.completeDailyChallenge(id, studentId);

  return res.json({
    success: true,
    evalResult,
    pointsAwarded: ch.points,
    message: `Challenge completed! You earned ${ch.points} points and kept your streak alive.`,
  });
}

export function getLeaderboard(req: Request, res: Response) {
  const studentId = req.user?.studentId;
  const leaderboard = db.getLeaderboard(studentId);
  return res.json({ leaderboard });
}
