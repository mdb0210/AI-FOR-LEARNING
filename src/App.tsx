import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { StudentLogin } from './pages/public/StudentLogin';
import { TeacherLogin } from './pages/public/TeacherLogin';
import { AccessDenied } from './pages/public/AccessDenied';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LearnSubjects } from './pages/student/LearnSubjects';
import { TopicDetail } from './pages/student/TopicDetail';
import { PracticeQuiz } from './pages/student/PracticeQuiz';
import { EvaluationFeedback } from './pages/student/EvaluationFeedback';
import { MemoryVault } from './pages/student/MemoryVault';
import { Assignments } from './pages/student/Assignments';
import { AssignmentDetail } from './pages/student/AssignmentDetail';
import { ProgressAnalytics } from './pages/student/ProgressAnalytics';
import { SmartRevision } from './pages/student/SmartRevision';
import { Challenges } from './pages/student/Challenges';
import { Leaderboard } from './pages/student/Leaderboard';
import { StudentProfile } from './pages/student/StudentProfile';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ManageTopics } from './pages/teacher/ManageTopics';
import { ManageAssignments } from './pages/teacher/ManageAssignments';
import { ManageQuizzes } from './pages/teacher/ManageQuizzes';
import { StudentRoster } from './pages/teacher/StudentRoster';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';

// Main Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 min-w-0 bg-slate-950/50 pb-16">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/student-login" replace />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/teacher-login" element={<TeacherLogin />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Protected Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/learn"
                element={
                  <ProtectedRoute requiredRole="student">
                    <LearnSubjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/subjects"
                element={
                  <ProtectedRoute requiredRole="student">
                    <LearnSubjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/topic/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <TopicDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/quiz/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <PracticeQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/quiz/practice"
                element={
                  <ProtectedRoute requiredRole="student">
                    <PracticeQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assessment/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <PracticeQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/feedback"
                element={
                  <ProtectedRoute requiredRole="student">
                    <EvaluationFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Assignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <AssignmentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignment/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <AssignmentDetail />
                  </ProtectedRoute>
                }
              />
              {/* Private Memory Vault (Strict student access) */}
              <Route
                path="/student/memory-vault"
                element={
                  <ProtectedRoute requiredRole="student">
                    <MemoryVault />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/memory-vault/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <MemoryVault />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/progress"
                element={
                  <ProtectedRoute requiredRole="student">
                    <ProgressAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/revision"
                element={
                  <ProtectedRoute requiredRole="student">
                    <SmartRevision />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/challenges"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Challenges />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/leaderboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/topics"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageTopics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/topics/create"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageTopics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/topics/:id"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageTopics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/materials"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageTopics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments/create"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageQuizzes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes/create"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ManageQuizzes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <StudentRoster />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students/:id"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <StudentRoster />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/analytics"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
