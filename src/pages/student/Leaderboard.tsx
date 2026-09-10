import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Flame, Award, ShieldCheck, Lock, Star } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { token, user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/student/leaderboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Trophy className="w-4 h-4" /> Academic Competition
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Student Leaderboard</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Earn points by completing quizzes, submitting assignments, and keeping your daily study streak alive
        </p>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          <strong>Privacy Enforced:</strong> The leaderboard tracks only gamified learning points and active study streaks. Personal Memory Vault items and private explanations are strictly excluded.
        </span>
      </div>

      {/* Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="pb-4 pl-2">Rank</th>
              <th className="pb-4">Student</th>
              <th className="pb-4">Streak</th>
              <th className="pb-4">Badges</th>
              <th className="pb-4 pr-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leaderboard.map((entry) => {
              const isMe = entry.studentId === user?.studentId;

              return (
                <tr
                  key={entry.studentId}
                  className={`transition-colors ${
                    isMe
                      ? 'bg-indigo-950/40 text-white font-semibold'
                      : 'hover:bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                      {entry.rank === 1 && <span className="text-amber-400 text-base">🥇</span>}
                      {entry.rank === 2 && <span className="text-slate-300 text-base">🥈</span>}
                      {entry.rank === 3 && <span className="text-amber-600 text-base">🥉</span>}
                      {entry.rank > 3 && <span>#{entry.rank}</span>}
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <span className="font-bold text-white block">
                          {entry.name} {isMe && <span className="text-indigo-400 font-normal">(You)</span>}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{entry.studentId}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold font-mono">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {entry.streak}d
                    </span>
                  </td>

                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-violet-400 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      {entry.badgesCount}
                    </span>
                  </td>

                  <td className="py-4 pr-2 text-right">
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      {entry.points} pts
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
