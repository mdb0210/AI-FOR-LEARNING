import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Brain,
  TrendingUp,
  RotateCcw,
  Zap,
  Trophy,
  User,
  FolderKanban,
  GraduationCap,
  Sparkles,
  Lock,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isStudent, isTeacher } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/learn', icon: BookOpen, label: 'Learn Concepts' },
    { to: '/student/assignments', icon: FileCheck, label: 'Assignments' },
    { to: '/student/quiz/practice', icon: Sparkles, label: 'Practice with AI' },
    {
      to: '/student/memory-vault',
      icon: Brain,
      label: 'Memory Vault',
      highlight: true,
      badge: 'Private',
    },
    { to: '/student/progress', icon: TrendingUp, label: 'Progress & Analytics' },
    { to: '/student/revision', icon: RotateCcw, label: 'Revise Today' },
    { to: '/student/challenges', icon: Zap, label: 'Daily Challenges' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/student/profile', icon: User, label: 'Profile' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Teacher Hub' },
    { to: '/teacher/topics', icon: BookOpen, label: 'Topics & Materials' },
    { to: '/teacher/assignments', icon: FileCheck, label: 'Assignments Studio' },
    { to: '/teacher/quizzes', icon: HelpCircle, label: 'Quiz Creator' },
    { to: '/teacher/students', icon: GraduationCap, label: 'Student Analytics' },
    { to: '/teacher/analytics', icon: BarChart3, label: 'Class Analytics' },
  ];

  const links = isStudent ? studentLinks : isTeacher ? teacherLinks : [];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {isStudent ? 'Learning Cycle' : 'Teacher Management'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? link.highlight
                          ? 'bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-500/40 text-white shadow-lg shadow-indigo-950/50'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : link.highlight
                        ? 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      link.highlight ? 'text-indigo-400' : ''
                    }`} />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5" />
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Knowledge Vault Highlights for Students */}
        {isStudent && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white tracking-wide">Personal Vault</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              “AI can explain a topic to you, but only you know how you understood it.”
            </p>
            <NavLink
              to="/student/memory-vault"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Open Your Vault &rarr;
            </NavLink>
          </div>
        )}
      </div>

      {/* Footer Security Notice */}
      <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center gap-1.5 px-2">
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Strict Role & Ownership Isolation</span>
      </div>
    </aside>
  );
};
