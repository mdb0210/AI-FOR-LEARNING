import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Database, Code2, Binary, Cpu, Network, ArrowRight, Clock, BookOpen } from 'lucide-react';

export const LearnSubjects: React.FC = () => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/student/subjects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [token]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return <Database className="w-6 h-6 text-indigo-400" />;
      case 'Code2': return <Code2 className="w-6 h-6 text-emerald-400" />;
      case 'Binary': return <Binary className="w-6 h-6 text-violet-400" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-amber-400" />;
      case 'Network': return <Network className="w-6 h-6 text-blue-400" />;
      default: return <BookOpen className="w-6 h-6 text-indigo-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-3xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
          <BookOpen className="w-4 h-4" /> Curriculum Catalog
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Explore Engineering Subjects</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select a topic to learn with AI, review lecture materials, and practice multi-format assessments
        </p>
      </div>

      <div className="space-y-8">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl"
          >
            {/* Subject Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  {getIcon(subject.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{subject.code}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-xs text-slate-400 font-medium">{subject.difficulty}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">{subject.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{subject.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {subject.topics?.length || 4} Topics Available
                </span>
              </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.topics?.map((topic: any) => (
                <div
                  key={topic.id}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {topic.estimatedMinutes} mins
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                        {topic.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.summary || topic.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                    <Link
                      to={`/student/quiz/practice?topicId=${topic.id}`}
                      className="text-slate-400 hover:text-white font-medium transition-colors"
                    >
                      AI Practice
                    </Link>
                    <Link
                      to={`/student/topic/${topic.id}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-1 group-hover:translate-x-0.5"
                    >
                      <span>Study Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
