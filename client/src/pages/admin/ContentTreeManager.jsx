import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, Pencil, ChevronRight, ChevronDown, Binary, Coffee, Calculator,
  Network, Database, Cpu, Globe, Layers, Undo2, Home, ChevronRight as Breadcrumb,
  Image as ImageIcon, Loader2, X
} from 'lucide-react';
import { contentApi } from '../../api/content';
import { adminApi } from '../../api/admin';
import { blogApi } from '../../api/blog';

const ICON_OPTIONS = [
  { key: 'binary-tree', icon: Binary, label: 'DSA' },
  { key: 'coffee', icon: Coffee, label: 'Java' },
  { key: 'calculator', icon: Calculator, label: 'Aptitude' },
  { key: 'network', icon: Network, label: 'System Design' },
  { key: 'database', icon: Database, label: 'Database' },
  { key: 'cpu', icon: Cpu, label: 'OS / CS Core' },
  { key: 'globe', icon: Globe, label: 'Web / Networking' },
  { key: 'layers', icon: Layers, label: 'General' },
];

const COLOR_OPTIONS = ['#5EEAD4', '#FFB454', '#A78BFA', '#F87171', '#60A5FA', '#34D399'];

const inputClass = 'px-4 py-3 rounded-lg border text-sm outline-none w-full input-focus';
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' };
const textareaClass = 'px-4 py-3 rounded-lg border text-sm outline-none w-full input-focus resize-none';

const emptySubjectForm = { name: '', description: '', icon: 'layers', color: '#5EEAD4', coverImage: '' };
const emptyTopicForm = { name: '', description: '', difficulty: 'beginner', estimatedMinutes: 30 };
const emptyTrackForm = { name: '' };

// Inline rename/edit form, reused for Subject/Topic/Track
const InlineForm = ({ children, onSave, onCancel, saveLabel = 'Save' }) => (
  <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-raised)' }}>
    {children}
    <div className="flex gap-2">
      <button onClick={onSave} className="px-4 py-2 rounded-lg text-xs font-medium btn-press" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
        {saveLabel}
      </button>
      <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>
        Cancel
      </button>
    </div>
  </div>
);

/* ── Undo toast ── */
const UndoToast = ({ message, onUndo, onDismiss }) => (
  <div
    className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 rounded-2xl border shadow-2xl z-50"
    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 32px var(--shadow)' }}
  >
    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</span>
    <button
      onClick={onUndo}
      className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg btn-press"
      style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
    >
      <Undo2 size={13} /> Undo
    </button>
    <button onClick={onDismiss} className="text-xs" style={{ color: 'var(--text-muted)' }}>Dismiss</button>
  </div>
);

const ContentTreeManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [topics, setTopics] = useState({});
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [tracks, setTracks] = useState({});
  const [expandedTrack, setExpandedTrack] = useState(null);
  const [chapters, setChapters] = useState({});

  // Breadcrumb state: tracks what's currently "selected" at each level
  // { subject, topic, track } — each is the object or null
  const [crumb, setCrumb] = useState({ subject: null, topic: null, track: null });

  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [addingTopicTo, setAddingTopicTo] = useState(null);
  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [editingTopicId, setEditingTopicId] = useState(null);

  const [addingTrackTo, setAddingTrackTo] = useState(null);
  const [trackForm, setTrackForm] = useState(emptyTrackForm);
  const [editingTrackId, setEditingTrackId] = useState(null);

  // Undo toast state
  const [toast, setToast] = useState(null); // { message, onUndo }
  const toastTimer = useRef(null);

  const showToast = useCallback((message, onUndo) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, onUndo });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 5000);
  }, []);

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  const loadSubjects = () => contentApi.getSubjects().then(({ data }) => setSubjects(data.subjects));

  useEffect(() => { loadSubjects(); }, []);

  const toggleSubject = async (subject) => {
    if (expandedSubject === subject._id) {
      setExpandedSubject(null);
      setCrumb({ subject: null, topic: null, track: null });
      return;
    }
    setExpandedSubject(subject._id);
    setExpandedTopic(null);
    setExpandedTrack(null);
    setCrumb({ subject, topic: null, track: null });
    if (!topics[subject._id]) {
      const { data } = await contentApi.getSubjectBySlug(subject.slug);
      setTopics((prev) => ({ ...prev, [subject._id]: data.topics }));
    }
  };

  const toggleTopic = async (topic, subject) => {
    if (expandedTopic === topic._id) {
      setExpandedTopic(null);
      setCrumb((c) => ({ ...c, topic: null, track: null }));
      return;
    }
    setExpandedTopic(topic._id);
    setExpandedTrack(null);
    setCrumb((c) => ({ ...c, topic, track: null }));
    if (!tracks[topic._id]) {
      const { data } = await contentApi.getTracksForTopic(topic._id);
      setTracks((prev) => ({ ...prev, [topic._id]: data.tracks }));
    }
  };

  const toggleTrack = async (track) => {
    if (expandedTrack === track._id) {
      setExpandedTrack(null);
      setCrumb((c) => ({ ...c, track: null }));
      return;
    }
    setExpandedTrack(track._id);
    setCrumb((c) => ({ ...c, track }));
    if (!chapters[track._id]) {
      const { data } = await contentApi.getChaptersForTrack(track._id);
      setChapters((prev) => ({ ...prev, [track._id]: data.chapters }));
    }
  };

  const refreshChapters = async (trackId) => {
    const { data } = await contentApi.getChaptersForTrack(trackId);
    setChapters((prev) => ({ ...prev, [trackId]: data.chapters }));
  };

  // ---------- Subjects ----------
  const handleAddSubject = async () => {
    if (!subjectForm.name.trim()) return;
    const { data } = await adminApi.createSubject(subjectForm);
    setSubjects((prev) => [...prev, data.subject]);
    setSubjectForm(emptySubjectForm);
    setAddingSubject(false);
  };

  const startEditSubject = (subject) => {
    setSubjectForm({ 
      name: subject.name, 
      description: subject.description || '', 
      icon: subject.icon || 'layers', 
      color: subject.color || '#5EEAD4',
      coverImage: subject.coverImage || ''
    });
    setEditingSubjectId(subject._id);
  };

  const handleSaveSubjectEdit = async () => {
    if (!subjectForm.name.trim()) return;
    const { data } = await adminApi.updateSubject(editingSubjectId, subjectForm);
    setSubjects((prev) => prev.map((s) => (s._id === editingSubjectId ? data.subject : s)));
    setEditingSubjectId(null);
    setSubjectForm(emptySubjectForm);
  };

  const handleDeleteSubject = async (subjectId, subjectName) => {
    // Optimistic delete — then offer 5-sec undo window
    const snapshot = [...subjects];
    setSubjects((prev) => prev.filter((s) => s._id !== subjectId));
    let undone = false;
    showToast(`Deleted subject "${subjectName}"`, async () => {
      undone = true;
      setSubjects(snapshot);
      dismissToast();
    });
    setTimeout(async () => {
      if (!undone) {
        try { await adminApi.deleteSubject(subjectId); } catch {}
      }
    }, 5100);
  };

  // ---------- Topics ----------
  const handleAddTopic = async (subjectId) => {
    if (!topicForm.name.trim()) return;
    const existing = topics[subjectId] || [];
    const { data } = await adminApi.createTopic({ subject: subjectId, ...topicForm, order: existing.length });
    setTopics((prev) => ({ ...prev, [subjectId]: [...existing, data.topic] }));
    setTopicForm(emptyTopicForm);
    setAddingTopicTo(null);
  };

  const startEditTopic = (topic) => {
    setTopicForm({ name: topic.name, description: topic.description || '', difficulty: topic.difficulty, estimatedMinutes: topic.estimatedMinutes });
    setEditingTopicId(topic._id);
  };

  const handleSaveTopicEdit = async (subjectId) => {
    if (!topicForm.name.trim()) return;
    const { data } = await adminApi.updateTopic(editingTopicId, topicForm);
    setTopics((prev) => ({ ...prev, [subjectId]: prev[subjectId].map((t) => (t._id === editingTopicId ? data.topic : t)) }));
    setEditingTopicId(null);
    setTopicForm(emptyTopicForm);
  };

  const handleDeleteTopic = async (subjectId, topicId, topicName) => {
    const snapshot = topics[subjectId] ? [...topics[subjectId]] : [];
    setTopics((prev) => ({ ...prev, [subjectId]: (prev[subjectId] || []).filter((t) => t._id !== topicId) }));
    let undone = false;
    showToast(`Deleted topic "${topicName}"`, () => {
      undone = true;
      setTopics((prev) => ({ ...prev, [subjectId]: snapshot }));
      dismissToast();
    });
    setTimeout(async () => { if (!undone) try { await adminApi.deleteTopic(topicId); } catch {} }, 5100);
  };

  // ---------- Tracks ----------
  const handleAddTrack = async (topicId) => {
    if (!trackForm.name.trim()) return;
    const existing = tracks[topicId] || [];
    const { data } = await adminApi.createTrack({ topic: topicId, name: trackForm.name, order: existing.length });
    setTracks((prev) => ({ ...prev, [topicId]: [...existing, { ...data.track, chapterCount: 0 }] }));
    setTrackForm(emptyTrackForm);
    setAddingTrackTo(null);
  };

  const startEditTrack = (track) => {
    setTrackForm({ name: track.name });
    setEditingTrackId(track._id);
  };

  const handleSaveTrackEdit = async (topicId) => {
    if (!trackForm.name.trim()) return;
    const { data } = await adminApi.updateTrack(editingTrackId, trackForm);
    setTracks((prev) => ({
      ...prev,
      [topicId]: prev[topicId].map((t) => (t._id === editingTrackId ? { ...t, ...data.track } : t)),
    }));
    setEditingTrackId(null);
    setTrackForm(emptyTrackForm);
  };

  const handleDeleteTrack = async (topicId, trackId, trackName) => {
    const snapshot = tracks[topicId] ? [...tracks[topicId]] : [];
    setTracks((prev) => ({ ...prev, [topicId]: (prev[topicId] || []).filter((t) => t._id !== trackId) }));
    let undone = false;
    showToast(`Deleted track "${trackName}"`, () => {
      undone = true;
      setTracks((prev) => ({ ...prev, [topicId]: snapshot }));
      dismissToast();
    });
    setTimeout(async () => { if (!undone) try { await adminApi.deleteTrack(trackId); } catch {} }, 5100);
  };

  // ---------- Chapters ----------
  const handleDeleteChapter = async (trackId, chapterId, chapterTitle) => {
    const snapshot = chapters[trackId] ? [...chapters[trackId]] : [];
    setChapters((prev) => ({ ...prev, [trackId]: (prev[trackId] || []).filter((c) => c._id !== chapterId) }));
    let undone = false;
    showToast(`Deleted chapter "${chapterTitle}"`, () => {
      undone = true;
      setChapters((prev) => ({ ...prev, [trackId]: snapshot }));
      dismissToast();
    });
    setTimeout(async () => { if (!undone) try { await adminApi.deleteChapter(chapterId); } catch {} }, 5100);
  };

  // Breadcrumb navigation handlers
  const navToSubject = (subjectId) => {
    setExpandedSubject(subjectId);
    setExpandedTopic(null);
    setExpandedTrack(null);
    const s = subjects.find((x) => x._id === subjectId);
    setCrumb({ subject: s || null, topic: null, track: null });
  };

  const navToTopic = (topicId) => {
    setExpandedTopic(topicId);
    setExpandedTrack(null);
    const topicList = Object.values(topics).flat();
    const t = topicList.find((x) => x._id === topicId);
    setCrumb((c) => ({ ...c, topic: t || null, track: null }));
  };

  return (
    <div>
      {/* Breadcrumb nav */}
      {crumb.subject && (
        <nav className="flex items-center gap-1.5 mb-5 flex-wrap">
          <button
            onClick={() => { setExpandedSubject(null); setExpandedTopic(null); setExpandedTrack(null); setCrumb({ subject: null, topic: null, track: null }); }}
            className="flex items-center gap-1 text-sm btn-press"
            style={{ color: 'var(--text-muted)' }}
          >
            <Home size={12} /> Content Tree
          </button>
          <ChevronRight size={13} style={{ color: 'var(--border)' }} />
          <button
            onClick={() => navToSubject(crumb.subject._id)}
            className="text-sm font-medium btn-press hover:underline"
            style={{ color: crumb.subject.color || 'var(--accent)' }}
          >
            {crumb.subject.name}
          </button>
          {crumb.topic && (
            <>
              <ChevronRight size={13} style={{ color: 'var(--border)' }} />
              <button
                onClick={() => navToTopic(crumb.topic._id)}
                className="text-sm font-medium btn-press hover:underline"
                style={{ color: 'var(--text)' }}
              >
                {crumb.topic.name}
              </button>
            </>
          )}
          {crumb.track && (
            <>
              <ChevronRight size={13} style={{ color: 'var(--border)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{crumb.track.name}</span>
            </>
          )}
        </nav>
      )}

      <h1 className="text-2xl font-bold mb-1">Content Tree</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
        Subjects → Topics → Tracks (e.g. "Deep Analysis", "Data Research") → Chapters.
        Click the pencil on any item to rename or edit it.
      </p>

      <div className="mb-6">
        {addingSubject ? (
          <InlineForm onSave={handleAddSubject} onCancel={() => { setAddingSubject(false); setSubjectForm(emptySubjectForm); }} saveLabel="Create subject">
            <SubjectFields form={subjectForm} setForm={setSubjectForm} />
          </InlineForm>
        ) : (
          <button
            onClick={() => setAddingSubject(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            <Plus size={16} /> Add subject
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {subjects.map((subject) => (
          <div key={subject._id} className="rounded-xl border card-hover" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            {editingSubjectId === subject._id ? (
              <div className="p-4">
                <InlineForm onSave={handleSaveSubjectEdit} onCancel={() => { setEditingSubjectId(null); setSubjectForm(emptySubjectForm); }}>
                  <SubjectFields form={subjectForm} setForm={setSubjectForm} />
                </InlineForm>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between gap-3 p-4">
                <button onClick={() => toggleSubject(subject)} className="flex items-center gap-2 flex-1 text-left">
                  <span className="font-semibold" style={{ color: subject.color }}>{subject.name}</span>
                  {expandedSubject === subject._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEditSubject(subject)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }} title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteSubject(subject._id, subject.name)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--danger)' }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}

            {expandedSubject === subject._id && (
              <div className="px-4 pb-4 flex flex-col gap-2">
                {(topics[subject._id] || []).map((topic) => (
                  <div key={topic._id} className="rounded-lg border ml-2" style={{ borderColor: 'var(--border)' }}>
                    {editingTopicId === topic._id ? (
                      <div className="p-3">
                        <InlineForm onSave={() => handleSaveTopicEdit(subject._id)} onCancel={() => { setEditingTopicId(null); setTopicForm(emptyTopicForm); }}>
                          <TopicFields form={topicForm} setForm={setTopicForm} />
                        </InlineForm>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between gap-3 p-3">
                        <button onClick={() => toggleTopic(topic, subject)} className="flex items-center gap-2 flex-1 text-left text-sm">
                          <span>{topic.name}</span>
                          {expandedTopic === topic._id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => startEditTopic(topic)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteTopic(subject._id, topic._id, topic.name)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}

                    {expandedTopic === topic._id && (
                      <div className="px-3 pb-3 flex flex-col gap-2">
                        {(tracks[topic._id] || []).map((track) => (
                          <div key={track._id} className="rounded-lg border ml-2" style={{ borderColor: 'var(--border)' }}>
                            {editingTrackId === track._id ? (
                              <div className="p-2.5">
                                <InlineForm onSave={() => handleSaveTrackEdit(topic._id)} onCancel={() => { setEditingTrackId(null); setTrackForm(emptyTrackForm); }}>
                                  <input
                                    value={trackForm.name}
                                    onChange={(e) => setTrackForm({ name: e.target.value })}
                                    placeholder='Track name (e.g. "Deep Analysis")'
                                    className={inputClass}
                                    style={inputStyle}
                                  />
                                </InlineForm>
                              </div>
                            ) : (
                              <div className="w-full flex items-center justify-between gap-3 p-2.5">
                                <button onClick={() => toggleTrack(track)} className="flex items-center gap-2 flex-1 text-left text-sm">
                                  <span style={{ color: 'var(--text-muted)' }}>{track.name}</span>
                                  {expandedTrack === track._id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                </button>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button onClick={() => startEditTrack(track)} className="p-1 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }}>
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => handleDeleteTrack(topic._id, track._id, track.name)} className="p-1 rounded-lg btn-press" style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {expandedTrack === track._id && (
                              <div className="px-3 pb-3">
                                {(chapters[track._id] || []).map((chapter) => (
                                  <div key={chapter._id} className="flex items-center justify-between py-1.5 text-sm group">
                                    <Link to={`/admin-portal/content/chapters/${chapter._id}`} className="hover:text-[var(--accent)] transition-colors">
                                      Ch.{chapter.chapterNumber} — {chapter.title}
                                    </Link>
                                    <div className="flex items-center gap-2">
                                      <Link to={`/admin-portal/content/chapters/${chapter._id}`} style={{ color: 'var(--text-muted)' }}>
                                        <Pencil size={13} />
                                      </Link>
                                      <button onClick={() => handleDeleteChapter(track._id, chapter._id, chapter.title)} style={{ color: 'var(--danger)' }}>
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <Link
                                  to={`/admin-portal/content/chapters/new?track=${track._id}`}
                                  className="flex items-center gap-1.5 text-xs mt-2"
                                  style={{ color: 'var(--accent)' }}
                                  onClick={() => refreshChapters(track._id)}
                                >
                                  <Plus size={13} /> Add chapter
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}

                        {addingTrackTo === topic._id ? (
                          <div className="ml-2 mt-1">
                            <InlineForm onSave={() => handleAddTrack(topic._id)} onCancel={() => { setAddingTrackTo(null); setTrackForm(emptyTrackForm); }} saveLabel="Add track">
                              <input
                                value={trackForm.name}
                                onChange={(e) => setTrackForm({ name: e.target.value })}
                                placeholder='Track name (e.g. "Deep Analysis", "Data Research")'
                                className={inputClass}
                                style={inputStyle}
                              />
                            </InlineForm>
                          </div>
                        ) : (
                          <button onClick={() => setAddingTrackTo(topic._id)} className="flex items-center gap-1.5 text-xs ml-2 mt-1" style={{ color: 'var(--accent)' }}>
                            <Plus size={13} /> Add track
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {addingTopicTo === subject._id ? (
                  <div className="ml-2">
                    <InlineForm onSave={() => handleAddTopic(subject._id)} onCancel={() => { setAddingTopicTo(null); setTopicForm(emptyTopicForm); }} saveLabel="Add topic">
                      <TopicFields form={topicForm} setForm={setTopicForm} />
                    </InlineForm>
                  </div>
                ) : (
                  <button onClick={() => setAddingTopicTo(subject._id)} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)' }}>
                    <Plus size={13} /> Add topic
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Undo toast */}
      {toast && <UndoToast message={toast.message} onUndo={toast.onUndo} onDismiss={dismissToast} />}
    </div>
  );
};

// Shared field groups — larger inputs for comfortable writing
const SubjectFields = ({ form, setForm }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await blogApi.uploadImage(file);
      setForm((f) => ({ ...f, coverImage: data.url }));
    } catch {
      alert('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <p className="text-sm font-semibold">Subject</p>
      <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="Subject name (e.g. System Design)"
        className={inputClass}
        style={inputStyle}
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Short description shown on the homepage card"
        rows={3}
        className={textareaClass}
        style={inputStyle}
      />
      
      {/* Cover Image Upload */}
      <div>
        <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Cover Image (Optional)</p>
        {form.coverImage ? (
          <div className="relative rounded-xl overflow-hidden h-32 border" style={{ borderColor: 'var(--border)' }}>
            <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
              className="absolute top-2 right-2 p-1.5 rounded-lg btn-press bg-black/50 hover:bg-black/70 text-white"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 btn-press"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            <span className="text-xs">{uploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Icon (Used if no Cover Image)</p>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map(({ key, icon: Icon, label }) => (
            <button
              key={key} type="button" title={label}
              onClick={() => setForm((f) => ({ ...f, icon: key }))}
              className="p-2.5 rounded-lg border btn-press"
              style={{
                borderColor: form.icon === key ? 'var(--accent)' : 'var(--border)',
                backgroundColor: form.icon === key ? 'var(--accent-soft)' : 'transparent',
                color: form.icon === key ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Accent color</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color} type="button"
              onClick={() => setForm((f) => ({ ...f, color }))}
              className="w-7 h-7 rounded-full border-2 btn-press"
              style={{ backgroundColor: color, borderColor: form.color === color ? 'var(--text)' : 'transparent' }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const TopicFields = ({ form, setForm }) => (
  <>
    <input
      value={form.name}
      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      placeholder="Topic name (e.g. Load Balancing)"
      className={inputClass}
      style={inputStyle}
    />
    <textarea
      value={form.description}
      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      placeholder="Short description (what will the learner understand after this topic?)"
      rows={3}
      className={textareaClass}
      style={inputStyle}
    />
    <div className="flex gap-2">
      <select
        value={form.difficulty}
        onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
        className={inputClass}
        style={inputStyle}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <input
        type="number" min={5}
        value={form.estimatedMinutes}
        onChange={(e) => setForm((f) => ({ ...f, estimatedMinutes: Number(e.target.value) }))}
        placeholder="Minutes"
        className={inputClass}
        style={inputStyle}
      />
    </div>
  </>
);

export default ContentTreeManager;
