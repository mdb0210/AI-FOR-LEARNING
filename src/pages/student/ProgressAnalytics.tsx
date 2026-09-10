import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MistakePill } from '../../components/evaluation/MistakePill';
import {
  TrendingUp,
  BarChart3,
  BookOpen,
  Flame,
  Award,
  AlertTriangle,
  RotateCcw,
  Calendar,
} from 'lucide-react';

export const ProgressAnalytics: React.FC = () => {
  const { token } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/student/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProgress(data.progress);
        }
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 rounded-3xl" />
          <div className="h-64 bg-slate-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  const subjectMastery = progress?.subjectMastery || [];
  const mistakeStats = progress?.mistakeStats || [];
  const weakTopics = progress?.weakTopics || [];
  const recentScores = progress?.recentScores || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
          <TrendingUp className="w-4 h-4" /> Academic Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Learning Progress & Mastery</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track subject retention, diagnose mistake patterns, and address weak conceptual areas
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Overall Mastery</span>
          <div className="text-2xl font-black text-white mt-1">{progress?.overallProgress}%</div>
          <span className="text-[11px] text-emerald-400">Curriculum benchmark</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Average Assessment Score</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{progress?.averageScore}%</div>
          <span className="text-[11px] text-slate-400">Quizzes & Assignments</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Study Streak</span>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span>{progress?.currentStreak} Days</span>
          </div>
          <span className="text-[11px] text-amber-400">Daily consistency</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Gamified Points</span>
          <div className="text-2xl font-black text-violet-400 mt-1">{progress?.totalPoints} pts</div>
          <span className="text-[11px] text-violet-400">Rank #2 on Leaderboard</span>
        </div>
      </div>

      {/* Grid: Subject Mastery & Mistake Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Mastery */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Subject Mastery
            </h3>
            <span className="text-xs text-slate-500">Topics Mastered</span>
          </div>

          <div className="space-y-4">
            {subjectMastery.map((subj: any) => (
              <div key={subj.subjectId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{subj.subjectTitle}</span>
                  <span className="font-mono font-bold text-indigo-400">{subj.mastery}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-1000"
                    style={{ width: `${subj.mastery}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{subj.completedTopics} of {subj.totalTopics} topics studied</span>
                  <span>{subj.mastery >= 75 ? 'Strong' : 'Needs Review'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mistake Pattern Breakdown */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-400" /> Mistake Classification Breakdown
            </h3>
            <span className="text-xs text-slate-500">AI Diagnosed</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The AI evaluation engine classifies where your marks were lost across recent submissions.
          </p>

          <div className="space-y-3 pt-2">
            {mistakeStats.map((item: any) => {
              const maxMistakes = 5;
              const widthPct = Math.min(100, Math.max(15, (item.count / maxMistakes) * 100));

              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <MistakePill type={item.type} count={item.count} />
                    <span className="font-mono text-xs text-slate-400">{item.count} incidents</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.type === 'Conceptual'
                          ? 'bg-purple-500'
                          : item.type === 'Syntax'
                          ? 'bg-blue-500'
                          : item.type === 'Logic'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weak Areas & Revision Action List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Diagnosed Conceptual Weak Areas
            </h3>
            <p className="text-xs text-slate-400">
              Topics where assessment score was under 70% or repeated conceptual mistakes occurred
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakTopics.map((topic: any) => (
            <div
              key={topic.topicId}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400">{topic.subjectTitle}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Last Score: {topic.avgScore}%
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{topic.topicTitle}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{topic.reason}</p>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                <span className="text-slate-500">{topic.mistakeCount} mistakes logged</span>
                <a
                  href={`/student/topic/${topic.topicId}`}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Revise with AI &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
