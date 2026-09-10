import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ScoreGauge } from '../../components/evaluation/ScoreGauge';
import { PrivateLockBadge } from '../../components/common/Badge';
import {
  Sparkles,
  BookOpen,
  RotateCcw,
  FileCheck,
  Zap,
  Brain,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    overallProgress: 72,
    averageScore: 78,
    topicsCompleted: 6,
    currentStreak: 7,
    savedMemoriesCount: 3,
    pendingAssignmentsCount: 1,
  };

  const reviseToday = data?.reviseToday || {
    topicTitle: 'Normalization (1NF, 2NF, 3NF)',
    topicId: 'topic-dbms-norm',
    reason: 'You scored 58% in your last assessment and made 3 conceptual mistakes.',
    lastScore: 58,
  };

  const challenge = data?.dailyChallenge;
  const assignments = data?.upcomingAssignments || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/30 shadow-xl shadow-indigo-950/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Student Workspace
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">{user?.studentId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Your personalized learning cycle is active. Ready to practice and build your Memory Vault?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/quiz/practice"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Practice with AI</span>
          </Link>
          <Link
            to="/student/memory-vault"
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-2"
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Open Vault</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Curriculum Mastery</span>
            <div className="text-2xl font-black text-white mt-1">{metrics.overallProgress}%</div>
            <span className="text-[11px] text-emerald-400 font-medium">6 Topics Completed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Average Score</span>
            <div className="text-2xl font-black text-white mt-1">{metrics.averageScore}%</div>
            <span className="text-[11px] text-indigo-400 font-medium">Across all assessments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Study Streak</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{metrics.currentStreak} Days</div>
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Flame on!
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Memory Vault Count */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-indigo-300">Memory Vault</span>
              <Lock className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{metrics.savedMemoriesCount} Saved</div>
            <span className="text-[11px] text-slate-400">Personal mental models</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Revise Today & Memory Vault Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Revise Today & Active Learning */}
        <div className="lg:col-span-2 space-y-6">
          {/* REVISE TODAY (Smart Recommendation Card) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Smart Revision Priority
                  </span>
                  <h3 className="text-lg font-bold text-white">Revise Today: {reviseToday.topicTitle}</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                High Priority
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Diagnosis:
              </div>
              <p className="leading-relaxed">{reviseToday.reason}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/student/topic/${reviseToday.topicId || 'topic-dbms-norm'}`}
                className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all"
              >
                Review Concepts &rarr;
              </Link>
              <Link
                to={`/student/quiz/practice?topicId=${reviseToday.topicId || 'topic-dbms-norm'}`}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all"
              >
                Practice Again with AI &rarr;
              </Link>
              <Link
                to="/student/memory-vault"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Memory Vault</span>
              </Link>
            </div>
          </div>

          {/* CONTINUE LEARNING: Active Topics */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Continue Learning
              </h3>
              <Link to="/student/learn" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Browse All Subjects &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'topic-dbms-norm',
                  title: 'Normalization (1NF, 2NF, 3NF, BCNF)',
                  subject: 'Database Management Systems',
                  progress: 80,
                  est: '35 mins',
                },
                {
                  id: 'topic-py-func',
                  title: 'Functions, Scope & Closures',
                  subject: 'Python Programming',
                  progress: 60,
                  est: '25 mins',
                },
                {
                  id: 'topic-os-deadlocks',
                  title: 'Deadlocks & Banker’s Algorithm',
                  subject: 'Operating Systems',
                  progress: 40,
                  est: '40 mins',
                },
              ].map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">{topic.subject}</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {topic.title}
                    </h4>
                    <span className="text-[11px] text-slate-500">{topic.est}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                    <Link
                      to={`/student/topic/${topic.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      Study &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Daily Challenge, Vault & Assignments */}
        <div className="space-y-6">
          {/* DAILY CHALLENGE */}
          {challenge && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Daily Challenge
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">+{challenge.points} pts</span>
              </div>

              <h4 className="text-sm font-bold text-white">{challenge.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{challenge.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 60s Time Limit
                </span>
                <Link
                  to="/student/challenges"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 transition-all"
                >
                  Start Challenge &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* MEMORY VAULT CARD */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Personal Knowledge Vault</h4>
              </div>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              “Your understanding, saved for your future self.”
            </p>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Saved Personal Explanations:</span>
              <span className="font-bold text-white font-mono">{metrics.savedMemoriesCount} memories</span>
            </div>

            <Link
              to="/student/memory-vault"
              className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-200 text-xs font-bold text-center block transition-all mt-2"
            >
              Revisit Your Understandings &rarr;
            </Link>
          </div>

          {/* UPCOMING ASSIGNMENTS */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" /> Upcoming Work
              </h4>
              <Link to="/student/assignments" className="text-xs text-indigo-400 font-semibold">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {assignments.map((asgn: any) => (
                <Link
                  key={asgn.id}
                  to={`/student/assignments/${asgn.id}`}
                  className="block p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[180px]">
                      {asgn.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asgn.studentStatus === 'evaluated'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {asgn.studentStatus}
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center justify-between text-[11px]">
                    <span>{asgn.totalMarks} Marks</span>
                    <span>Due {new Date(asgn.deadline).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
