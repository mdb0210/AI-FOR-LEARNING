import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, TrendingUp, AlertTriangle, Users, BookOpen } from 'lucide-react';

export const TeacherAnalytics: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/teacher/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  const performance = data?.classPerformance || [];
  const weakAreas = data?.weakAreas || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
          <BarChart3 className="w-4 h-4" /> Cohort Metrics
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Class Academic Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Aggregated curriculum comprehension curves and systemic error patterns across your students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Mastery Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Curriculum Pass Rates & Average Scores
          </h3>

          <div className="space-y-4">
            {performance.map((item: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.topic}</span>
                  <span className="font-mono font-bold text-purple-300">{item.avgScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                    style={{ width: `${item.avgScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Pass Rate: {item.passRate}%</span>
                  <span>{item.avgScore >= 75 ? 'Meets Benchmark' : 'Requires Review'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Systemic Conceptual Bottlenecks */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Systemic Conceptual Bottlenecks
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            AI evaluation has flagged these recurring conceptual misunderstandings across multiple student submissions.
          </p>

          <div className="space-y-4">
            {weakAreas.map((area: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{area.topic}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {area.severity} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {area.affectedCount} students struggled with dependency isolation and intermediate working steps.
                </p>
                <div className="pt-2 border-t border-slate-900 text-[11px] text-purple-400 font-medium">
                  Recommendation: Schedule 15-minute live recap in next lecture.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
