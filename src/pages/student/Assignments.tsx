import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileCheck, Clock, CheckCircle2, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

export const Assignments: React.FC = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<string>('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/student/assignments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAssignments(data.assignments);
        }
      } catch (err) {
        console.error('Failed to load assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [token]);

  const filtered = assignments.filter((a) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'assigned') return a.studentStatus === 'assigned';
    if (filterTab === 'submitted') return a.studentStatus === 'submitted' || a.studentStatus === 'evaluated';
    if (filterTab === 'overdue') return a.studentStatus === 'overdue';
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            <FileCheck className="w-4 h-4" /> Academic Tasks
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Course Assignments</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete assigned homework problems using text, voice recordings, or diagram photos
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
          {['all', 'assigned', 'submitted', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                filterTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <FileCheck className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No assignments in this category</h3>
          <p className="text-xs text-slate-400">All coursework in this section is up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((asgn) => (
            <div
              key={asgn.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-lg"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-indigo-400">{asgn.subjectTitle}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs text-slate-400 font-medium">{asgn.topicTitle}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {asgn.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {asgn.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                  <span>{asgn.questions?.length || 3} Questions</span>
                  <span>{asgn.totalMarks} Marks</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due {new Date(asgn.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    asgn.studentStatus === 'evaluated'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : asgn.studentStatus === 'submitted'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : asgn.studentStatus === 'overdue'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {asgn.studentStatus === 'evaluated'
                    ? `Graded (${asgn.score}/${asgn.totalMarks})`
                    : asgn.studentStatus.toUpperCase()}
                </span>

                <Link
                  to={`/student/assignments/${asgn.id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>{asgn.studentStatus === 'evaluated' ? 'View Feedback' : 'Open Assignment'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
