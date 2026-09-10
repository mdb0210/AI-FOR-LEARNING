import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowRight,
  BarChart3,
  Lock,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/teacher/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalStudents: 2,
    activeStudents: 2,
    averageScore: 78,
    assignmentCompletionRate: 75,
    quizCompletionRate: 88,
  };

  const classPerformance = data?.classPerformance || [];
  const weakAreas = data?.weakAreas || [];
  const recentAssignments = data?.recentAssignments || [];
  const roster = data?.studentRoster || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Teacher Hub Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Faculty Hub</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">{user?.teacherId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Teacher Studio & Academic Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome, {user?.name}! Manage curriculum topics, assign assessments, and monitor cohort mastery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/teacher/assignments"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>Create Assignment</span>
          </Link>
          <Link
            to="/teacher/quizzes"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Quiz</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Enrolled Students</span>
            <div className="text-2xl font-black text-white mt-1">{metrics.totalStudents}</div>
            <span className="text-[11px] text-emerald-400">{metrics.activeStudents} active today</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Class Average Score</span>
            <div className="text-2xl font-black text-purple-400 mt-1">{metrics.averageScore}%</div>
            <span className="text-[11px] text-purple-400">All submissions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Assignment Turn-In</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.assignmentCompletionRate}%</div>
            <span className="text-[11px] text-slate-400">On-time rate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Quiz Completion</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{metrics.quizCompletionRate}%</div>
            <span className="text-[11px] text-slate-400">Practice attempts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Class Topic Mastery & Class Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Topic Performance */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Class Topic Performance & Mastery
            </h3>
            <span className="text-xs text-slate-500">Cohort Average</span>
          </div>

          <div className="space-y-4">
            {classPerformance.map((topic: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{topic.topic}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Pass Rate: {topic.passRate}%</span>
                    <span className="font-mono font-bold text-purple-400">{topic.avgScore}% avg</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                    style={{ width: `${topic.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Class Weak Areas & Strict Privacy Notice */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Class Diagnostic Gaps
            </h3>
            <p className="text-xs text-slate-400">
              Areas where the largest percentage of students lost marks during assessments:
            </p>

            <div className="space-y-3">
              {weakAreas.map((area: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-300">{area.topic}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      {area.severity} Severity
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {area.affectedCount} students made conceptual mistakes in this module.
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Pedagogical Privacy Boundary</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Faculty analytics reflect strictly assigned academic work. Student personal Memory Vaults, private voice recordings, and self-notes are encrypted and strictly shielded from teacher viewing.
            </p>
          </div>
        </div>
      </div>

      {/* Student Roster Quick Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Student Academic Roster</h3>
            <p className="text-xs text-slate-400">Track individual submission results and weak topics</p>
          </div>

          <Link
            to="/teacher/students"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            Full Class Analytics &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3">Average Score</th>
                <th className="pb-3">Assignments</th>
                <th className="pb-3">Diagnosed Weak Topic</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {roster.map((s: any) => (
                <tr key={s.studentId} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/20"
                      />
                      <div>
                        <span className="font-bold text-white block">{s.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.studentId}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <span className="font-mono font-bold text-emerald-400">{s.averageScore}%</span>
                  </td>

                  <td className="py-3.5">
                    <span className="text-slate-300">{s.completedAssignments} / {s.totalAssignments} completed</span>
                  </td>

                  <td className="py-3.5">
                    <span className="text-amber-400 font-medium">{s.weakTopic}</span>
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <Link
                      to={`/teacher/students/${s.studentId}`}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold text-xs transition-colors"
                    >
                      View Academic Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
