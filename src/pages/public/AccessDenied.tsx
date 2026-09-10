import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  const { user, isStudent, isTeacher } = useAuth();

  const destination = isTeacher
    ? '/teacher/dashboard'
    : isStudent
    ? '/student/dashboard'
    : '/';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You do not have permission to view this content.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-left space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-rose-300">
            <Lock className="w-3.5 h-3.5" /> Security Boundary:
          </div>
          <p>
            {isStudent
              ? 'Students cannot access teacher dashboards, curriculum management, or other students’ private records.'
              : isTeacher
              ? 'Teachers cannot access students’ private personal Memory Vaults, voice recordings, or revision notes.'
              : 'Please log in with appropriate credentials to access this area.'}
          </p>
        </div>

        <Link
          to={destination}
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
