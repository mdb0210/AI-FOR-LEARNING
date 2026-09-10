import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { evaluationEngine } from '../services/evaluationEngine.js';
import { db } from '../db/database.js';

export async function explainTopic(req: Request, res: Response) {
  const { topicId, topicTitle, subjectTitle } = req.body;

  let topic = topicId ? db.getTopic(topicId) : undefined;
  const title = topicTitle || topic?.title || 'Relational Normalization';
  const subject = subjectTitle || topic?.subjectTitle || 'Database Management Systems';

  // Ground in teacher material if available
  const material = topicId ? db.getMaterialByTopic(topicId) : undefined;
  const teacherNotes = material?.content;

  try {
    const explanation = await aiService.generateExplanation(title, subject, teacherNotes);
    if (topicId) {
      explanation.topicId = topicId;
      db.saveExplanation(explanation);
    }
    return res.json({ explanation });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate AI explanation.' });
  }
}

export async function generateShortNotes(req: Request, res: Response) {
  const { topicId, topicTitle, subjectTitle } = req.body;

  let topic = topicId ? db.getTopic(topicId) : undefined;
  const title = topicTitle || topic?.title || 'Relational Normalization';
  const subject = subjectTitle || topic?.subjectTitle || 'Database Management Systems';

  try {
    const notes = await aiService.generateShortNotes(title, subject);
    if (topicId) {
      notes.topicId = topicId;
      db.saveShortNotes(notes);
    }
    return res.json({ notes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate short notes.' });
  }
}

export async function generatePracticeQuiz(req: Request, res: Response) {
  const { subjectTitle, topicTitle, difficulty, count } = req.body;

  if (!topicTitle) {
    return res.status(400).json({ error: 'Topic title is required.' });
  }

  try {
    const questions = await aiService.generateQuiz(
      subjectTitle || 'Computer Science',
      topicTitle,
      difficulty || 'Intermediate',
      Number(count) || 3
    );
    return res.json({ questions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
}

export async function evaluateSingleAnswer(req: Request, res: Response) {
  const { question, submission, assessmentId } = req.body;
  const studentId = req.user?.studentId || 'STU1001';

  if (!question || !submission) {
    return res.status(400).json({ error: 'Question and submission data are required for evaluation.' });
  }

  try {
    const evaluation = await evaluationEngine.evaluateAnswer(
      question,
      submission,
      studentId,
      assessmentId || 'single-eval'
    );
    return res.json({ evaluation });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Evaluation failed.' });
  }
}
