import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, KeyRound, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const StudentLogin: React.FC = () => {
  const [studentId, setStudentId] = useState<string>('STU1001');
  const [password, setPassword] = useState<string>('student123');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(studentId.trim(), password.trim());
      success(`Welcome back! Logged in as ${studentId.toUpperCase()}`);
      navigate('/student/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (id: string) => {
    setStudentId(id);
    setPassword('student123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-white">LearnVault<span className="text-indigo-400">.ai</span></span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Student Portal Login</h2>
        <p className="mt-1 text-xs text-slate-400">Access your personalized learning, practice quizzes & Memory Vault</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Student ID
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU1001"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="student123"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In as Student'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Hackathon Demo Credentials Box */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1.5 text-indigo-300">
                <KeyRound className="w-3.5 h-3.5" /> Demo Accounts
              </span>
              <span className="text-[11px] text-slate-500">Click to autofill:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('STU1001')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-indigo-300">STU1001</div>
                <div className="text-[10px] text-slate-400">Demo Student</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('STU1002')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-indigo-300">STU1002</div>
                <div className="text-[10px] text-slate-400">Alex Student</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/teacher-login" className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors">
              Are you a faculty instructor? Switch to Teacher Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
