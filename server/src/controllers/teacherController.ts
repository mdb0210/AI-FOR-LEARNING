import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { Assignment, Topic, LearningMaterial, Question } from '../types/index.js';

export function getTeacherDashboard(req: Request, res: Response) {
  const analytics = db.getTeacherClassAnalytics();
  const assignments = db.getAssignments();

  return res.json({
    metrics: {
      totalStudents: analytics.totalStudents,
      activeStudents: analytics.activeStudents,
      averageScore: analytics.averageScore,
      assignmentCompletionRate: analytics.assignmentCompletionRate,
      quizCompletionRate: analytics.quizCompletionRate,
    },
    classPerformance: analytics.topicPerformance,
    weakAreas: analytics.classWeakAreas,
    recentAssignments: assignments.slice(0, 5),
    studentRoster: analytics.studentRoster,
  });
}

export function getStudents(req: Request, res: Response) {
  const analytics = db.getTeacherClassAnalytics();
  return res.json({ students: analytics.studentRoster });
}

export function getStudentAcademicDetail(req: Request, res: Response) {
  const { id } = req.params; // studentId e.g. STU1001
  const student = db.findStudentByIdentifier(id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  // ALLOWED: Academic progress, quiz attempts, assignments, weak topics
  const progress = db.getStudentProgress(id);
  const submissions = db.getAssignmentSubmissions().filter((s) => s.studentId === id);

  return res.json({
    student: {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
    },
    academicProgress: {
      averageScore: progress.averageScore,
      overallProgress: progress.overallProgress,
      topicsCompleted: progress.topicsCompleted,
      weakTopics: progress.weakTopics,
      recentScores: progress.recentScores,
      subjectMastery: progress.subjectMastery,
      submissions,
    },
    // Explicit security boundary statement
    privacyNotice: {
      status: 'PROTECTED',
      message: 'Student Memory Vault and private personal notes are strictly isolated and inaccessible to teachers.',
    },
  });
}

// Explicit test endpoint verifying that teachers CANNOT access student memory vault
export function attemptAccessStudentVault(req: Request, res: Response) {
  return res.status(403).json({
    error: 'ACCESS RESTRICTED: Teachers are strictly forbidden from viewing student personal Memory Vaults.',
    code: 'VAULT_PRIVACY_PROTECTION',
    reason: 'Personal Memory Vault items belong solely to the student and are never shared with teachers or peers.',
  });
}

export function createTopic(req: Request, res: Response) {
  const { subjectId, title, description, difficulty, estimatedMinutes, summary } = req.body;
  if (!subjectId || !title || !description) {
    return res.status(400).json({ error: 'Subject, title, and description are required.' });
  }

  const newTopic: Topic = {
    id: `topic-${Date.now()}`,
    subjectId,
    title: title.trim(),
    description: description.trim(),
    difficulty: difficulty || 'Intermediate',
    estimatedMinutes: Number(estimatedMinutes) || 30,
    summary: summary || description.trim(),
  };

  const created = db.createTopic(newTopic);
  return res.status(201).json({ topic: created, message: 'Topic created successfully.' });
}

export function saveLearningMaterial(req: Request, res: Response) {
  const { topicId, title, content, keyPoints, examples, commonMistakes, resources, published } = req.body;
  if (!topicId || !title || !content) {
    return res.status(400).json({ error: 'Topic ID, title, and content are required.' });
  }

  const material: LearningMaterial = {
    id: `mat-${Date.now()}`,
    topicId,
    teacherId: req.user?.id,
    title: title.trim(),
    content: content.trim(),
    keyPoints: keyPoints || [],
    examples: examples || [],
    commonMistakes: commonMistakes || [],
    resources: resources || [],
    published: published !== undefined ? published : true,
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveMaterial(material);
  return res.json({ material: saved, message: 'Learning material saved and published.' });
}

export function getTeacherAssignments(req: Request, res: Response) {
  const assignments = db.getAssignments();
  const submissions = db.getAssignmentSubmissions();

  const enriched = assignments.map((a) => {
    const subs = submissions.filter((s) => s.assignmentId === a.id);
    return {
      ...a,
      submissionCount: subs.length,
      averageScore:
        subs.length > 0
          ? Math.round(subs.reduce((acc, curr) => acc + (curr.totalScore / curr.maxScore) * 100, 0) / subs.length)
          : null,
    };
  });

  return res.json({ assignments: enriched });
}

export function createAssignment(req: Request, res: Response) {
  const teacherId = req.user?.id || 'user-tch-1001';
  const { subjectId, topicId, title, description, totalMarks, deadline, assignedTo, questions } = req.body;

  if (!subjectId || !topicId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Subject, topic, title, and questions array are required.' });
  }

  const topic = db.getTopic(topicId);
  const subject = db.getSubject(subjectId);

  const newAssignment: Assignment = {
    id: `asgn-${Date.now()}`,
    teacherId,
    subjectId,
    topicId,
    topicTitle: topic?.title,
    subjectTitle: subject?.title,
    title: title.trim(),
    description: description?.trim() || '',
    totalMarks: Number(totalMarks) || 20,
    deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: assignedTo || 'all',
    questions: questions.map((q: any, idx: number) => ({
      ...q,
      id: q.id || `asgn-q-${Date.now()}-${idx}`,
    })),
    createdAt: new Date().toISOString(),
  };

  const created = db.createAssignment(newAssignment);
  return res.status(201).json({ assignment: created, message: 'Assignment published to students.' });
}

export function publishQuiz(req: Request, res: Response) {
  const { topicId, questions } = req.body;
  if (!topicId || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Topic ID and questions array required.' });
  }

  const saved = db.saveQuestionsForTopic(topicId, questions);
  return res.json({ questions: saved, message: 'Quiz published for topic practice.' });
}
