import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  FileText,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  ArrowLeft,
  Share2,
  Lock,
  Plus,
  Volume2,
  Image as ImageIcon,
  Type,
} from 'lucide-react';

export const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [topicData, setTopicData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'teacher' | 'notes'>('ai');
  const [generatingAI, setGeneratingAI] = useState<boolean>(false);
  const [generatingNotes, setGeneratingNotes] = useState<boolean>(false);

  // Memory Vault Save Modal state
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [vaultTitle, setVaultTitle] = useState<string>('');
  const [vaultType, setVaultType] = useState<'text' | 'voice' | 'image'>('text');
  const [vaultContent, setVaultContent] = useState<string>('');
  const [vaultNotes, setVaultNotes] = useState<string>('');
  const [savingVault, setSavingVault] = useState<boolean>(false);

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/student/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTopicData(json);
        setVaultTitle(`My Understanding of ${json.topic.title}`);
      }
    } catch (err) {
      console.error('Failed to load topic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
  }, [id, token]);

  const handleLearnWithAI = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: id,
          topicTitle: topicData?.topic?.title,
          subjectTitle: topicData?.subject?.title,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setTopicData((prev: any) => ({ ...prev, explanation: json.explanation }));
        setActiveTab('ai');
        success('Structured AI explanation generated!');
      }
    } catch (err) {
      error('Failed to generate AI explanation.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateShortNotes = async () => {
    setGeneratingNotes(true);
    try {
      const res = await fetch('/api/ai/short-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: id,
          topicTitle: topicData?.topic?.title,
          subjectTitle: topicData?.subject?.title,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setTopicData((prev: any) => ({ ...prev, shortNotes: json.notes }));
        setActiveTab('notes');
        success('AI short revision notes generated!');
      }
    } catch (err) {
      error('Failed to generate short notes.');
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleSaveToVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultTitle.trim()) {
      error('Please provide a title for your personal memory.');
      return;
    }

    setSavingVault(true);
    try {
      const res = await fetch('/api/student/memory-vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: id,
          subjectId: topicData?.topic?.subjectId,
          topicTitle: topicData?.topic?.title,
          title: vaultTitle,
          contentType: vaultType,
          textContent: vaultType === 'text' ? vaultContent : undefined,
          transcript: vaultType === 'voice' ? vaultContent : undefined,
          imageDataUrl: vaultType === 'image' ? vaultContent : undefined,
          notes: vaultNotes,
        }),
      });

      if (res.ok) {
        success('Saved privately to your Memory Vault.');
        setIsVaultModalOpen(false);
        setVaultContent('');
        setVaultNotes('');
      } else {
        const data = await res.json();
        error(data.error || 'Failed to save to vault.');
      }
    } catch (err) {
      error('Error saving to vault.');
    } finally {
      setSavingVault(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  const topic = topicData?.topic;
  const subject = topicData?.subject;
  const teacherMaterial = topicData?.teacherMaterial;
  const explanation = topicData?.explanation;
  const shortNotes = topicData?.shortNotes;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/student/learn"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Curriculum
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400">{subject?.title}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> {topic?.estimatedMinutes} mins
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{topic?.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsVaultModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Save My Understanding</span>
          </button>

          <Link
            to={`/student/quiz/practice?topicId=${topic?.id}`}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice with AI</span>
          </Link>
        </div>
      </div>

      {/* Action Tabs & Generation Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Explanation
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Teacher Lecture Material
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> AI Short Notes
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLearnWithAI}
            disabled={generatingAI}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{generatingAI ? 'Generating...' : 'Learn with AI'}</span>
          </button>

          <button
            onClick={handleGenerateShortNotes}
            disabled={generatingNotes}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-violet-400" />
            <span>{generatingNotes ? 'Generating...' : 'Generate Short Notes'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI EXPLANATION */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {explanation ? (
            <div className="space-y-6">
              {/* Disclaimer */}
              <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <span>ℹ️</span>
                <span>{explanation.disclaimer || 'AI-generated content should be verified with your course material.'}</span>
              </div>

              {/* What is it? & Why does it matter? */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    WHAT IS IT?
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {explanation.whatIsIt}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    WHY DOES IT MATTER?
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {explanation.whyDoesItMatter}
                  </p>
                </div>
              </div>

              {/* Simple Intuitive Explanation */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> SIMPLE INTUITIVE EXPLANATION
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {explanation.simpleExplanation}
                </p>
              </div>

              {/* Concrete Example */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  REAL-WORLD EXAMPLE
                </h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono leading-relaxed overflow-x-auto">
                  <pre>{explanation.example}</pre>
                </div>
              </div>

              {/* Key Points & Common Mistakes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    KEY CONCEPTS & RULES
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {explanation.keyPoints?.map((p: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-3xl bg-rose-950/10 border border-rose-500/20 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    COMMON MISTAKES & PITFALLS
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {explanation.commonMistakes?.map((m: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Recap */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white uppercase text-[11px] block">QUICK RECAP</span>
                  <span className="text-slate-400">{explanation.quickRecap}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Generate Structured AI Explanation</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click below to generate an intuitive breakdown with real-world examples and common pitfalls.
                </p>
              </div>
              <button
                onClick={handleLearnWithAI}
                disabled={generatingAI}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
              >
                {generatingAI ? 'Generating Explanation...' : 'Learn with AI Now'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEACHER MATERIAL */}
      {activeTab === 'teacher' && (
        <div className="space-y-6">
          {teacherMaterial ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{teacherMaterial.title}</h3>
                    <p className="text-xs text-slate-400">
                      Official curriculum material &bull; Updated {new Date(teacherMaterial.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Verified Curriculum
                </span>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {teacherMaterial.content}
              </div>

              {teacherMaterial.keyPoints?.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Takeaways</h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {teacherMaterial.keyPoints.map((kp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400">&bull;</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <GraduationCap className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No teacher lecture notes uploaded yet</h3>
              <p className="text-xs text-slate-400">
                You can switch to the "AI Explanation" tab to study this topic with AI grounding.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI SHORT NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {shortNotes ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{shortNotes.title}</h3>
                    <p className="text-xs text-slate-400">Exam-focused high-yield summary</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setVaultTitle(shortNotes.title);
                    setVaultContent(`${shortNotes.definition}\n\nKey Concepts:\n${shortNotes.keyConcepts?.join('\n')}\n\nRecap: ${shortNotes.quickRecap}`);
                    setIsVaultModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Save to My Notes</span>
                </button>
              </div>

              {/* Definition */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-indigo-400 uppercase">Definition</span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{shortNotes.definition}</p>
              </div>

              {/* Formulas & Rules */}
              {shortNotes.formulasRules?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Important Rules & Invariants</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shortNotes.formulasRules.map((rule: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Points */}
              {shortNotes.examPoints?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <span className="text-[11px] font-bold text-amber-300 uppercase">High-Frequency Exam Points</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {shortNotes.examPoints.map((pt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">&bull;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <FileText className="w-8 h-8 text-violet-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Generate Exam-Focused Short Notes</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Create high-yield bulleted notes summarizing key formulas, rules, and exam definitions.
                </p>
              </div>
              <button
                onClick={handleGenerateShortNotes}
                disabled={generatingNotes}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition-all"
              >
                {generatingNotes ? 'Generating Notes...' : 'Generate Short Notes'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* SAVE TO MEMORY VAULT MODAL (Unique Differentiator) */}
      <Modal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        title="Save Your Understanding to Memory Vault"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveToVault} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Private Knowledge Vault:</strong> This explanation belongs to you. It will NOT be sent to AI, teachers, or peers.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Memory Title</label>
            <input
              type="text"
              required
              value={vaultTitle}
              onChange={(e) => setVaultTitle(e.target.value)}
              placeholder="e.g. My Mental Model for Normalization"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Chooser */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVaultType('text')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  vaultType === 'text'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" /> Text
              </button>
              <button
                type="button"
                onClick={() => setVaultType('voice')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  vaultType === 'voice'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" /> Voice Note
              </button>
              <button
                type="button"
                onClick={() => setVaultType('image')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  vaultType === 'image'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Image / Diagram
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {vaultType === 'text'
                ? 'Your Personal Explanation'
                : vaultType === 'voice'
                ? 'Voice Note Summary / Thought'
                : 'Diagram / Photo Note Summary'}
            </label>
            <textarea
              required
              value={vaultContent}
              onChange={(e) => setVaultContent(e.target.value)}
              placeholder="How did you personally understand this concept? Write it in your own words so you can remember it later..."
              rows={5}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mnemonic or Personal Memory Cue (Optional)
            </label>
            <input
              type="text"
              value={vaultNotes}
              onChange={(e) => setVaultNotes(e.target.value)}
              placeholder="e.g. Remember: The Key (1NF), The Whole Key (2NF), Nothing But The Key (3NF)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsVaultModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingVault}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{savingVault ? 'Saving Privately...' : 'Save to Memory Vault'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
