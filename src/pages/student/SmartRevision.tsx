import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RotateCcw,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Brain,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const SmartRevision: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRevision = async () => {
      try {
        const res = await fetch('/api/student/revision', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load revision data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevision();
  }, [token]);

  const recommendations = data?.revisionRecommendations || [
    {
      topicId: 'topic-dbms-norm',
      topicTitle: 'Normalization (1NF, 2NF, 3NF, BCNF)',
      subjectTitle: 'Database Management Systems',
      reason: 'You scored 58% in your last assessment and made 3 conceptual mistakes.',
      priority: 'high',
      lastScore: 58,
      mistakeCount: 3,
    },
    {
      topicId: 'topic-os-deadlocks',
      topicTitle: 'Deadlocks & Banker’s Algorithm',
      subjectTitle: 'Operating Systems',
      reason: 'Need matrix calculations and circular wait conditions were partially incomplete.',
      priority: 'medium',
      lastScore: 64,
      mistakeCount: 2,
    },
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-900 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <RotateCcw className="w-4 h-4" /> Spaced Interval Revision
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Revise Today</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Smart AI recommendations prioritizing topics where scores dropped or conceptual mistakes occurred
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec: any, idx: number) => (
          <div
            key={rec.topicId || idx}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-indigo-400">{rec.subjectTitle}</span>
                <h3 className="text-xl font-bold text-white">{rec.topicTitle}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Last Assessment: {rec.lastScore}%
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {rec.priority?.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-300 space-y-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> AI Pedagogical Diagnosis:
              </span>
              <p className="leading-relaxed font-normal">{rec.reason}</p>
            </div>

            {/* Direct 3 Key Actions: Review Notes, Practice Again, Open Memory Vault */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/student/topic/${rec.topicId}`}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>Review Notes & AI Material</span>
              </Link>

              <Link
                to={`/student/quiz/practice?topicId=${rec.topicId}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Practice Again with AI</span>
              </Link>

              <Link
                to="/student/memory-vault"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 border border-amber-500/30"
              >
                <Brain className="w-4 h-4 text-amber-400" />
                <span>Check Personal Memory Vault</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
