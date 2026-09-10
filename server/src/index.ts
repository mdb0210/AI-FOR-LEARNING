import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { authenticate, requireAuth, requireStudent, requireTeacher } from './middleware/auth.js';
import { enforceStudentOwner } from './middleware/ownership.js';
import * as authController from './controllers/authController.js';
import * as studentController from './controllers/studentController.js';
import * as vaultController from './controllers/vaultController.js';
import * as teacherController from './controllers/teacherController.js';
import * as aiController from './controllers/aiController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for development frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Generous payload limit for voice audio recordings & base64 photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Attach authentication context to every request
app.use(authenticate);

// --- Health Check ---
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'LearnVault AI API',
    tagline: 'Learn it your way. Answer it your way. Remember it your way.',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini Live + Deterministic Fallback' : 'Deterministic AI Fallback Engine',
  });
});

// --- Public Authentication Routes ---
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', requireAuth, authController.me);
app.post('/api/auth/logout', authController.logout);

// --- Student Academic Routes ---
app.get('/api/student/dashboard', requireStudent, studentController.getDashboard);
app.get('/api/student/subjects', requireAuth, studentController.getSubjects);
app.get('/api/student/topics/:id', requireAuth, studentController.getTopicDetail);
app.get('/api/student/assignments', requireStudent, studentController.getStudentAssignments);
app.get('/api/student/assignments/:id', requireStudent, studentController.getStudentAssignmentDetail);
app.post('/api/student/assignments/:id/submit', requireStudent, studentController.submitAssignment);
app.post('/api/student/quiz/submit', requireStudent, studentController.submitPracticeQuiz);
app.get('/api/student/progress', requireStudent, studentController.getProgress);
app.get('/api/student/revision', requireStudent, studentController.getSmartRevision);
app.get('/api/student/challenges/today', requireStudent, studentController.getTodayChallenge);
app.post('/api/student/challenges/:id/complete', requireStudent, studentController.completeTodayChallenge);
app.get('/api/student/leaderboard', requireAuth, studentController.getLeaderboard);

// --- Personal Memory Vault Routes (STRICT STUDENT OWNERSHIP ONLY) ---
// Teachers or foreign students attempting these routes receive 403 Forbidden!
app.get('/api/student/memory-vault', requireStudent, enforceStudentOwner, vaultController.getVaultItems);
app.get('/api/student/memory-vault/:id', requireStudent, enforceStudentOwner, vaultController.getVaultItem);
app.post('/api/student/memory-vault', requireStudent, enforceStudentOwner, vaultController.createVaultItem);
app.put('/api/student/memory-vault/:id', requireStudent, enforceStudentOwner, vaultController.updateVaultItem);
app.delete('/api/student/memory-vault/:id', requireStudent, enforceStudentOwner, vaultController.deleteVaultItem);

// --- Teacher Routes (STRICT TEACHER ROLE REQUIRED) ---
app.get('/api/teacher/dashboard', requireTeacher, teacherController.getTeacherDashboard);
app.get('/api/teacher/students', requireTeacher, teacherController.getStudents);
app.get('/api/teacher/students/:id', requireTeacher, teacherController.getStudentAcademicDetail);
// Explicit test endpoint verifying blocked Memory Vault access
app.get('/api/teacher/students/:id/vault', requireTeacher, teacherController.attemptAccessStudentVault);
app.post('/api/teacher/topics', requireTeacher, teacherController.createTopic);
app.post('/api/teacher/materials', requireTeacher, teacherController.saveLearningMaterial);
app.get('/api/teacher/assignments', requireTeacher, teacherController.getTeacherAssignments);
app.post('/api/teacher/assignments', requireTeacher, teacherController.createAssignment);
app.post('/api/teacher/quizzes', requireTeacher, teacherController.publishQuiz);

// --- AI Service Routes ---
app.post('/api/ai/explain', requireAuth, aiController.explainTopic);
app.post('/api/ai/short-notes', requireAuth, aiController.generateShortNotes);
app.post('/api/ai/generate-quiz', requireAuth, aiController.generatePracticeQuiz);
app.post('/api/ai/evaluate', requireAuth, aiController.evaluateSingleAnswer);

// --- Static Frontend Serving (When Built) ---
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

// Frontend SPA fallback for HTML5 History API routing
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('LearnVault AI Frontend is in development mode. Please access the client on port 3000.');
    }
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 LearnVault AI Server running on http://localhost:${PORT}`);
  console.log(`🔒 RBAC & Memory Vault Privacy Active`);
  console.log(`🧠 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini Live' : 'Deterministic Intelligent Engine'}`);
  console.log(`====================================================`);
});
