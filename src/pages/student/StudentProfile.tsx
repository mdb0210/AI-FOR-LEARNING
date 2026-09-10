import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, Flame, Brain, BookOpen, CheckCircle2, Lock, User as UserIcon } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/student/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProgress(data.progress);
        }
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const badges = progress?.badges || [
    { id: 'first_step', name: 'First Step', description: 'Completed your first topic and quiz', icon: 'Footprints', unlocked: true },
    { id: 'streak_7', name: '7-Day Learner', description: 'Maintained a study streak for 7 consecutive days', icon: 'Flame', unlocked: true },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Scored 90%+ in 3 different topic quizzes', icon: 'Trophy', unlocked: false },
    { id: 'problem_solver', name: 'Problem Solver', description: 'Successfully solved 5 multi-part or coding assessments', icon: 'Cpu', unlocked: true },
    { id: 'revision_pro', name: 'Revision Pro', description: 'Saved 5 personal explanations to your Memory Vault', icon: 'Brain', unlocked: true },
    { id: 'consistency', name: 'Consistency Champion', description: 'Completed 10 daily challenges', icon: 'Award', unlocked: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={user?.name}
          className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-lg"
        />

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {user?.studentId}
            </span>
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Verified Student
            </span>
          </div>

          <h1 className="text-2xl font-black text-white">{user?.name}</h1>
          <p className="text-xs text-slate-400">{user?.email}</p>

          <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Flame className="w-4 h-4 text-amber-400" /> {progress?.currentStreak || 7} Day Streak
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Brain className="w-4 h-4 text-indigo-400" /> {progress?.savedMemoriesCount || 3} Private Memories
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <BookOpen className="w-4 h-4 text-emerald-400" /> {progress?.topicsCompleted || 6} Completed Topics
            </span>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" /> Earned Learning Badges
            </h2>
            <p className="text-xs text-slate-400">
              Milestones unlocked through persistent study, practice quizzes, and memory preservation
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            {badges.filter((b: any) => b.unlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge: any) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all space-y-2.5 ${
                badge.unlocked
                  ? 'bg-slate-950/80 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-950/30 border-slate-800/80 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    badge.unlocked
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    badge.unlocked
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{badge.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
