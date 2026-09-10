import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flame, LogOut, ShieldAlert, Sparkles, User, KeyRound } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isStudent, isTeacher, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to={isTeacher ? '/teacher/dashboard' : isStudent ? '/student/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  LearnVault<span className="text-indigo-400">.ai</span>
                </span>
                {user && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    isTeacher
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                “Learn it your way. Answer it your way. Remember it your way.”
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hackathon Quick Demo Switcher */}
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="px-2 text-slate-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Switch:
            </span>
            <button
              onClick={() => loginAsDemo('student1')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                user?.studentId === 'STU1001'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Demo Student
            </button>
            <button
              onClick={() => loginAsDemo('student2')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                user?.studentId === 'STU1002'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Alex (STU2)
            </button>
            <button
              onClick={() => loginAsDemo('teacher')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                user?.role === 'teacher'
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Teacher
            </button>
          </div>

          {/* Student Streak Counter */}
          {isStudent && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>7 Day Streak</span>
            </div>
          )}

          {/* User Profile Info */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {user.studentId || user.teacherId}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/student-login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                Student Login
              </Link>
              <Link
                to="/teacher-login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 transition-all"
              >
                Teacher Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
