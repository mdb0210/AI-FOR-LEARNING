import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { BookOpen, Plus, Sparkles, FileText, CheckCircle2, Clock, Edit3 } from 'lucide-react';

export const ManageTopics: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-dbms');
  const [loading, setLoading] = useState<boolean>(true);

  // Create Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<string>('Intermediate');
  const [newEstMins, setNewEstMins] = useState<number>(30);

  // Edit Material Modal
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [materialTopicId, setMaterialTopicId] = useState<string>('');
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [materialContent, setMaterialContent] = useState<string>('');
  const [materialKeyPoints, setMaterialKeyPoints] = useState<string>('');
  const [generatingDraft, setGeneratingDraft] = useState<boolean>(false);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/student/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [token]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          title: newTitle,
          description: newDesc,
          difficulty: newDifficulty,
          estimatedMinutes: newEstMins,
        }),
      });

      if (res.ok) {
        success('New topic published to curriculum!');
        setIsTopicModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        fetchTopics();
      } else {
        error('Failed to create topic.');
      }
    } catch (err) {
      error('Error creating topic.');
    }
  };

  const handleOpenMaterialModal = async (topic: any) => {
    setMaterialTopicId(topic.id);
    setMaterialTitle(`Lecture Notes: ${topic.title}`);
    setMaterialContent('');
    setMaterialKeyPoints('');
    setIsMaterialModalOpen(true);

    // Try fetching existing material if present
    try {
      const res = await fetch(`/api/student/topics/${topic.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.teacherMaterial) {
          setMaterialTitle(data.teacherMaterial.title);
          setMaterialContent(data.teacherMaterial.content);
          setMaterialKeyPoints(data.teacherMaterial.keyPoints?.join('\n') || '');
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateAIDraft = async () => {
    setGeneratingDraft(true);
    try {
      const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: materialTopicId,
          topicTitle: materialTitle,
          subjectTitle: currentSubject?.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const exp = data.explanation;
        setMaterialContent(
          `# ${materialTitle}\n\n` +
          `### Core Definition\n${exp.whatIsIt}\n\n` +
          `### Engineering Significance\n${exp.whyDoesItMatter}\n\n` +
          `### Concrete Implementation Example\n\`\`\`\n${exp.example}\n\`\`\`\n\n` +
          `### Quick Recap\n${exp.quickRecap}`
        );
        setMaterialKeyPoints(exp.keyPoints?.join('\n') || '');
        success('AI draft generated! Please review and edit before publishing.');
      }
    } catch (err) {
      error('Failed to generate draft.');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: materialTopicId,
          title: materialTitle,
          content: materialContent,
          keyPoints: materialKeyPoints.split('\n').filter((k) => k.trim()),
          published: true,
        }),
      });

      if (res.ok) {
        success('Curriculum material saved and published to students.');
        setIsMaterialModalOpen(false);
      } else {
        error('Failed to save material.');
      }
    } catch (err) {
      error('Error saving material.');
    }
  };

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

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
            <BookOpen className="w-4 h-4" /> Curriculum Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Topics & Learning Materials</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author lecture notes, organize topics, and draft materials with AI assistance
          </p>
        </div>

        <button
          onClick={() => setIsTopicModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Topic</span>
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSubjectId(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubjectId === s.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Topics List for selected subject */}
      <div className="space-y-4">
        {activeSubject?.topics?.map((topic: any) => (
          <div
            key={topic.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-lg"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-purple-300">
                  {topic.difficulty}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {topic.estimatedMinutes} mins
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{topic.summary || topic.description}</p>
            </div>

            <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <button
                onClick={() => handleOpenMaterialModal(topic)}
                className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Lecture Notes</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TOPIC MODAL */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Add New Topic to Curriculum"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus & Raft"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Provide a syllabus summary of what this topic covers..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Minutes</label>
              <input
                type="number"
                value={newEstMins}
                onChange={(e) => setNewEstMins(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTopicModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              Publish Topic
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MATERIAL MODAL (With AI Assistant) */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Author Verified Learning Material"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="text-xs text-slate-400">
              Students will see this in the "Teacher Lecture Material" tab.
            </div>

            <button
              type="button"
              onClick={handleGenerateAIDraft}
              disabled={generatingDraft}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generatingDraft ? 'Drafting with AI...' : 'Draft Notes with AI'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Material Title</label>
            <input
              type="text"
              required
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lecture Content & Explanations (Markdown Supported)
            </label>
            <textarea
              required
              value={materialContent}
              onChange={(e) => setMaterialContent(e.target.value)}
              placeholder="Write the verified curriculum notes, rules, and examples..."
              rows={10}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Points (1 per line)
            </label>
            <textarea
              value={materialKeyPoints}
              onChange={(e) => setMaterialKeyPoints(e.target.value)}
              placeholder="Key takeaway 1&#10;Key takeaway 2"
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsMaterialModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              Publish to Students
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
