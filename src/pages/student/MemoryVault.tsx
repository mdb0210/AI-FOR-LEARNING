import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PrivateLockBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { VoiceRecorder } from '../../components/answers/VoiceRecorder';
import { ImageUploader } from '../../components/answers/ImageUploader';
import {
  Brain,
  Lock,
  Search,
  Filter,
  Plus,
  Type,
  Mic,
  Image as ImageIcon,
  Play,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { MemoryVaultItem } from '../../../server/src/types/index';

export const MemoryVault: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState<MemoryVaultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<any[]>([]);

  // Create Memory Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createTopicTitle, setCreateTopicTitle] = useState<string>('Normalization (1NF, 2NF, 3NF)');
  const [createTopicId, setCreateTopicId] = useState<string>('topic-dbms-norm');
  const [createSubjectId, setCreateSubjectId] = useState<string>('subj-dbms');
  const [createContentType, setCreateContentType] = useState<'text' | 'voice' | 'image'>('text');
  const [createTextContent, setCreateTextContent] = useState<string>('');
  const [createVoiceUrl, setCreateVoiceUrl] = useState<string>('');
  const [createVoiceDuration, setCreateVoiceDuration] = useState<number>(0);
  const [createTranscript, setCreateTranscript] = useState<string>('');
  const [createImageUrl, setCreateImageUrl] = useState<string>('');
  const [createNotes, setCreateNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // View / Edit Modal State
  const [selectedItem, setSelectedItem] = useState<MemoryVaultItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editTextContent, setEditTextContent] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const fetchVault = async () => {
    try {
      const res = await fetch('/api/student/memory-vault', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }

      const sRes = await fetch('/api/student/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubjects(sData.subjects);
      }
    } catch (err) {
      console.error('Failed to load Memory Vault:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, [token]);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      error('Title is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/student/memory-vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: createTitle.trim(),
          topicTitle: createTopicTitle,
          topicId: createTopicId,
          subjectId: createSubjectId,
          contentType: createContentType,
          textContent: createTextContent || undefined,
          voiceDataUrl: createVoiceUrl || undefined,
          voiceDuration: createVoiceDuration || undefined,
          transcript: createTranscript || undefined,
          imageDataUrl: createImageUrl || undefined,
          notes: createNotes || undefined,
        }),
      });

      if (res.ok) {
        success('Saved privately to your Memory Vault.');
        setIsCreateModalOpen(false);
        // Reset form
        setCreateTitle('');
        setCreateTextContent('');
        setCreateVoiceUrl('');
        setCreateImageUrl('');
        setCreateNotes('');
        fetchVault();
      } else {
        const errJson = await res.json();
        error(errJson.error || 'Failed to save memory.');
      }
    } catch (err) {
      error('Error saving memory.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm('Delete this memory from your personal vault?')) return;
    try {
      const res = await fetch(`/api/student/memory-vault/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        success('Memory deleted.');
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
      }
    } catch (err) {
      error('Failed to delete memory.');
    }
  };

  const handleUpdateMemory = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/student/memory-vault/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          textContent: editTextContent,
          notes: editNotes,
        }),
      });
      if (res.ok) {
        success('Memory updated.');
        setIsEditing(false);
        fetchVault();
        setSelectedItem((prev) => prev ? { ...prev, title: editTitle, textContent: editTextContent, notes: editNotes } : null);
      }
    } catch (err) {
      error('Failed to update memory.');
    }
  };

  // Client filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.textContent && item.textContent.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.transcript && item.transcript.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || item.contentType === filterType;
    const matchesSubject = filterSubject === 'all' || item.subjectId === filterSubject;

    return matchesSearch && matchesType && matchesSubject;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Knowledge Vault Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PrivateLockBadge />
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-400">Owner: {user?.studentId}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-indigo-400" />
              MY MEMORY VAULT
            </h1>
            <p className="text-sm text-slate-300 font-medium">
              “Your understanding, saved for your future self.”
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-105 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Capture New Understanding</span>
          </button>
        </div>

        {/* Privacy Guarantees Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Never automatically analyzed by AI</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strictly invisible to faculty & teachers</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Never shared with other students</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your personal mental models, notes, and recordings..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter by Type */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {['all', 'text', 'voice', 'image'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  filterType === t
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Filter by Subject */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Memory Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Brain className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your Memory Vault is empty.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Save your first personal explanation after learning a topic. Write how you understood
              it so you can recall it easily before exams.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Create Your First Memory &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group space-y-4 shadow-xl relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Card Header: Topic & Type */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-400 truncate max-w-[180px]">
                    {item.topicTitle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.contentType}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>

                {/* Content Preview */}
                {item.contentType === 'text' && (
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {item.textContent}
                  </p>
                )}

                {item.contentType === 'voice' && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold">
                      <Mic className="w-4 h-4" /> Spoken Memory ({item.voiceDuration || 42}s)
                    </div>
                    {item.voiceDataUrl && (
                      <audio controls src={item.voiceDataUrl} className="w-full h-8 rounded" />
                    )}
                    {item.transcript && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        “{item.transcript}”
                      </p>
                    )}
                  </div>
                )}

                {item.contentType === 'image' && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                    {item.imageDataUrl ? (
                      <img
                        src={item.imageDataUrl}
                        alt={item.title}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                )}

                {/* Personal Cue / Notes */}
                {item.notes && (
                  <div className="text-[11px] text-amber-300/80 bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl font-medium">
                    💡 <em>{item.notes}</em>
                  </div>
                )}
              </div>

              {/* Card Footer: Date & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setEditTitle(item.title);
                      setEditTextContent(item.textContent || item.transcript || '');
                      setEditNotes(item.notes || '');
                      setIsEditing(false);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMemory(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MEMORY MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Preserve Your Understanding"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateMemory} className="space-y-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Private Memory:</strong> Saved strictly for your own future revision. Not sent to AI, teachers, or leaderboard.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. My Understanding of Normalization"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <select
                value={createSubjectId}
                onChange={(e) => setCreateSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Name</label>
              <input
                type="text"
                value={createTopicTitle}
                onChange={(e) => setCreateTopicTitle(e.target.value)}
                placeholder="Topic name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Format Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Content Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCreateContentType('text')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  createContentType === 'text'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Type className="w-4 h-4" /> Text
              </button>
              <button
                type="button"
                onClick={() => setCreateContentType('voice')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  createContentType === 'voice'
                    ? 'bg-violet-600 text-white border-violet-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Mic className="w-4 h-4" /> Voice Memo
              </button>
              <button
                type="button"
                onClick={() => setCreateContentType('image')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  createContentType === 'image'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Diagram / Image
              </button>
            </div>
          </div>

          {/* Dynamic Input based on Format */}
          {createContentType === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Personal Explanation
              </label>
              <textarea
                required
                value={createTextContent}
                onChange={(e) => setCreateTextContent(e.target.value)}
                placeholder="I understood normalization as a way to reduce redundancy by dividing data into related tables..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {createContentType === 'voice' && (
            <VoiceRecorder
              onAudioRecorded={(dataUrl, duration, transcript) => {
                setCreateVoiceUrl(dataUrl);
                setCreateVoiceDuration(duration);
                setCreateTranscript(transcript);
              }}
            />
          )}

          {createContentType === 'image' && (
            <ImageUploader
              onImageUploaded={(dataUrl, desc) => {
                setCreateImageUrl(dataUrl);
                setCreateNotes(desc);
              }}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Personal Memory Cue / Tag (Optional)
            </label>
            <input
              type="text"
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="e.g. Mnemonic: 'The key, the whole key, nothing but the key'"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Privately'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW & EDIT MODAL */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="font-semibold text-indigo-400">{selectedItem.topicTitle}</span>
              <PrivateLockBadge />
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Content</label>
                  <textarea
                    value={editTextContent}
                    onChange={(e) => setEditTextContent(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Personal Notes</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateMemory}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedItem.contentType === 'text' && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {selectedItem.textContent}
                  </div>
                )}

                {selectedItem.contentType === 'voice' && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold">
                      <Mic className="w-4 h-4" /> Voice Recording ({selectedItem.voiceDuration || 30}s)
                    </div>
                    {selectedItem.voiceDataUrl && (
                      <audio controls src={selectedItem.voiceDataUrl} className="w-full h-10 rounded-lg" />
                    )}
                    {selectedItem.transcript && (
                      <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg leading-relaxed">
                        <strong>Transcript:</strong> {selectedItem.transcript}
                      </div>
                    )}
                  </div>
                )}

                {selectedItem.contentType === 'image' && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex justify-center">
                    {selectedItem.imageDataUrl && (
                      <img
                        src={selectedItem.imageDataUrl}
                        alt={selectedItem.title}
                        className="max-h-96 object-contain rounded"
                      />
                    )}
                  </div>
                )}

                {selectedItem.notes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <strong>Personal Cue:</strong> {selectedItem.notes}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteMemory(selectedItem.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Memory
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Memory
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
