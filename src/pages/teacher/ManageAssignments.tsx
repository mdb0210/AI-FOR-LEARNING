import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { FileCheck, Plus, Calendar, Clock, Sparkles, Trash2, Users } from 'lucide-react';

export const ManageAssignments: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Assignment Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('subj-dbms');
  const [topicId, setTopicId] = useState<string>('topic-dbms-norm');
  const [description, setDescription] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<number>(20);
  const [deadlineDays, setDeadlineDays] = useState<number>(7);
  const [assignedTarget, setAssignedTarget] = useState<string>('all');

  // Questions in assignment
  const [questions, setQuestions] = useState<any[]>([
    {
      id: 'q1',
      questionType: 'one-line',
      title: 'Conceptual Definition',
      question: 'Define the lossless join property in database schema decomposition.',
      points: 5,
      rubric: 'Common attribute must be a superkey of at least one relation.',
    },
    {
      id: 'q2',
      questionType: 'diagram',
      title: 'Schema Diagram Upload',
      question: 'Draw or upload an ER schema diagram demonstrating normalization into 3NF.',
      points: 15,
      rubric: 'Accurate foreign key links and removal of transitive dependencies.',
    },
  ]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/teacher/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
      }

      const sRes = await fetch('/api/student/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubjects(sData.subjects);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        questionType: 'short',
        title: 'New Problem',
        question: 'Explain the algorithmic approach...',
        points: 5,
        rubric: 'Evaluated based on correctness and clarity.',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) {
      error('Title and at least one question required.');
      return;
    }

    try {
      const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subjectId,
          topicId,
          description,
          totalMarks,
          deadline,
          assignedTo: assignedTarget === 'all' ? 'all' : ['STU1001', 'STU1002'],
          questions,
        }),
      });

      if (res.ok) {
        success('Assignment published to students!');
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchAssignments();
      } else {
        error('Failed to create assignment.');
      }
    } catch (err) {
      error('Error creating assignment.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            <FileCheck className="w-4 h-4" /> Academic Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Coursework & Assignments</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build multi-format assignments, set deadlines, and monitor student submission progress
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((asgn) => (
          <div
            key={asgn.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-400">{asgn.subjectTitle}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs text-slate-400 font-medium">{asgn.topicTitle}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">{asgn.title}</h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due {new Date(asgn.deadline).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-white font-mono font-bold">
                  {asgn.totalMarks} Marks
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">{asgn.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Submissions Received</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{asgn.submissionCount || 1} Students</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Average</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                  {asgn.averageScore ? `${asgn.averageScore}%` : 'Grading In Progress'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Questions Included</span>
                <span className="text-sm font-bold text-purple-300 mt-0.5 block">
                  {asgn.questions?.length || 2} Problems
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Coursework Assignment"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem Set 2: Transitive Dependencies Decomposition"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  const s = subjects.find((sub) => sub.id === e.target.value);
                  if (s && s.topics && s.topics[0]) setTopicId(s.topics[0].id);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
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
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                {(subjects.find((s) => s.id === subjectId)?.topics || []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions for Students</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide instructions regarding multi-format answers (text, voice, image diagrams)..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline (Days)</label>
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Question List in Assignment */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase">Assignment Questions ({questions.length})</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Problem
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Q{idx + 1}: {q.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].question = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              Assign to Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
