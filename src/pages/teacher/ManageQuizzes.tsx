import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, HelpCircle, CheckCircle2, Trash2, Edit3, Plus, ArrowRight } from 'lucide-react';
import { Question } from '../../../server/src/types/index';

export const ManageQuizzes: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-dbms');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic-dbms-norm');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [count, setCount] = useState<number>(3);
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);

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
      }
    };
    fetchSubjects();
  }, [token]);

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setIsPublished(false);

    try {
      const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
      const currentTopic = currentSubject?.topics?.find((t: any) => t.id === selectedTopicId);

      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectTitle: currentSubject?.title,
          topicTitle: currentTopic?.title || 'Relational Normalization',
          difficulty,
          count,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedQuestions(data.questions);
        success('AI generated practice questions! Please review before publishing.');
      } else {
        error('Failed to generate quiz questions.');
      }
    } catch (err) {
      error('Error during AI quiz generation.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishQuiz = async () => {
    try {
      const res = await fetch('/api/teacher/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: selectedTopicId,
          questions: generatedQuestions,
        }),
      });

      if (res.ok) {
        success('Quiz reviewed and published to student practice catalog!');
        setIsPublished(true);
      } else {
        error('Failed to publish quiz.');
      }
    } catch (err) {
      error('Error publishing quiz.');
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
          <Sparkles className="w-4 h-4" /> AI Pedagogical Generator
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Quiz Studio & Teacher Review</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Generate realistic multi-format questions, inspect rubrics, edit parameters, and publish verified assessments
        </p>
      </div>

      {/* Generator Form */}
      <form
        onSubmit={handleGenerateQuestions}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl"
      >
        <h3 className="text-base font-bold text-white">Generate Questions with AI</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                const s = subjects.find((sub) => sub.id === e.target.value);
                if (s && s.topics && s.topics[0]) setSelectedTopicId(s.topics[0].id);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              {(subjects.find((s) => s.id === selectedSubjectId)?.topics || []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              <option value={2}>2 Questions</option>
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'AI Generating Questions...' : 'Generate Questions'}</span>
          </button>
        </div>
      </form>

      {/* Review & Edit Draft Questions */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Reviewing {generatedQuestions.length} draft questions before publishing</span>
            </div>

            <button
              onClick={handlePublishQuiz}
              disabled={isPublished}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isPublished
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
              }`}
            >
              {isPublished ? '✓ Published to Student Catalog' : 'Approve & Publish Quiz'}
            </button>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {q.questionType}
                    </span>
                    <h3 className="text-sm font-bold text-white">{q.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-purple-400">[{q.points} Marks]</span>
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Problem Statement</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...generatedQuestions];
                      updated[idx].question = e.target.value;
                      setGeneratedQuestions(updated);
                    }}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">AI Evaluation Rubric</label>
                  <input
                    type="text"
                    value={q.rubric}
                    onChange={(e) => {
                      const updated = [...generatedQuestions];
                      updated[idx].rubric = e.target.value;
                      setGeneratedQuestions(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
