import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, Pencil, ChevronRight, ChevronDown, Binary, Coffee, Calculator,
  Network, Database, Cpu, Globe, Layers,
} from 'lucide-react';
import { contentApi } from '../../api/content';
import { adminApi } from '../../api/admin';

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

const inputClass = 'px-3 py-2.5 rounded-lg border text-sm outline-none w-full input-focus';
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' };

const emptySubjectForm = { name: '', description: '', icon: 'layers', color: '#5EEAD4' };
const emptyTopicForm = { name: '', description: '', difficulty: 'beginner', estimatedMinutes: 30 };
const emptyTrackForm = { name: '' };

// Small inline rename/edit form, reused for Subject/Topic/Track since they
// all share the same edit-or-delete interaction shape.
const InlineForm = ({ children, onSave, onCancel, saveLabel = 'Save' }) => (
  <div className="flex flex-col gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-raised)' }}>
    {children}
    <div className="flex gap-2">
      <button onClick={onSave} className="px-3 py-1.5 rounded-lg text-xs font-medium btn-press" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
        {saveLabel}
      </button>
      <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>
        Cancel
      </button>
    </div>
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

  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [addingTopicTo, setAddingTopicTo] = useState(null);
  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [editingTopicId, setEditingTopicId] = useState(null);

  const [addingTrackTo, setAddingTrackTo] = useState(null);
  const [trackForm, setTrackForm] = useState(emptyTrackForm);
  const [editingTrackId, setEditingTrackId] = useState(null);

  const loadSubjects = () => contentApi.getSubjects().then(({ data }) => setSubjects(data.subjects));

  useEffect(() => {
    loadSubjects();
  }, []);

  const toggleSubject = async (subject) => {
    if (expandedSubject === subject._id) {
      setExpandedSubject(null);
      return;
    }
    setExpandedSubject(subject._id);
    if (!topics[subject._id]) {
      const { data } = await contentApi.getSubjectBySlug(subject.slug);
      setTopics((prev) => ({ ...prev, [subject._id]: data.topics }));
    }
  };

  const toggleTopic = async (topic) => {
    if (expandedTopic === topic._id) {
      setExpandedTopic(null);
      return;
    }
    setExpandedTopic(topic._id);
    if (!tracks[topic._id]) {
      const { data } = await contentApi.getTracksForTopic(topic._id);
      setTracks((prev) => ({ ...prev, [topic._id]: data.tracks }));
    }
  };

  const toggleTrack = async (track) => {
    if (expandedTrack === track._id) {
      setExpandedTrack(null);
      return;
    }
    setExpandedTrack(track._id);
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
    if (!subjectForm.name.trim()) return alert('Subject name is required.');
    const { data } = await adminApi.createSubject(subjectForm);
    setSubjects((prev) => [...prev, data.subject]);
    setSubjectForm(emptySubjectForm);
    setAddingSubject(false);
  };

  const startEditSubject = (subject) => {
    setSubjectForm({ name: subject.name, description: subject.description || '', icon: subject.icon || 'layers', color: subject.color || '#5EEAD4' });
    setEditingSubjectId(subject._id);
  };

  const handleSaveSubjectEdit = async () => {
    if (!subjectForm.name.trim()) return alert('Subject name is required.');
    const { data } = await adminApi.updateSubject(editingSubjectId, subjectForm);
    setSubjects((prev) => prev.map((s) => (s._id === editingSubjectId ? data.subject : s)));
    setEditingSubjectId(null);
    setSubjectForm(emptySubjectForm);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Delete this subject and ALL of its topics, tracks, and chapters? This cannot be undone.')) return;
    await adminApi.deleteSubject(subjectId);
    setSubjects((prev) => prev.filter((s) => s._id !== subjectId));
  };

  // ---------- Topics ----------
  const handleAddTopic = async (subjectId) => {
    if (!topicForm.name.trim()) return alert('Topic name is required.');
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
    if (!topicForm.name.trim()) return alert('Topic name is required.');
    const { data } = await adminApi.updateTopic(editingTopicId, topicForm);
    setTopics((prev) => ({ ...prev, [subjectId]: prev[subjectId].map((t) => (t._id === editingTopicId ? data.topic : t)) }));
    setEditingTopicId(null);
    setTopicForm(emptyTopicForm);
  };

  const handleDeleteTopic = async (subjectId, topicId) => {
    if (!window.confirm('Delete this topic and all of its tracks and chapters?')) return;
    await adminApi.deleteTopic(topicId);
    setTopics((prev) => ({ ...prev, [subjectId]: prev[subjectId].filter((t) => t._id !== topicId) }));
  };

  // ---------- Tracks ----------
  const handleAddTrack = async (topicId) => {
    if (!trackForm.name.trim()) return alert('Track name is required.');
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
    if (!trackForm.name.trim()) return alert('Track name is required.');
    const { data } = await adminApi.updateTrack(editingTrackId, trackForm);
    setTracks((prev) => ({
      ...prev,
      [topicId]: prev[topicId].map((t) => (t._id === editingTrackId ? { ...t, ...data.track } : t)),
    }));
    setEditingTrackId(null);
    setTrackForm(emptyTrackForm);
  };

  const handleDeleteTrack = async (topicId, trackId) => {
    if (!window.confirm('Delete this track and all of its chapters?')) return;
    await adminApi.deleteTrack(trackId);
    setTracks((prev) => ({ ...prev, [topicId]: prev[topicId].filter((t) => t._id !== trackId) }));
  };

  // ---------- Chapters ----------
  const handleDeleteChapter = async (trackId, chapterId) => {
    if (!window.confirm('Delete this chapter?')) return;
    await adminApi.deleteChapter(chapterId);
    setChapters((prev) => ({ ...prev, [trackId]: prev[trackId].filter((c) => c._id !== chapterId) }));
  };

  return (
    <div>
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
                  <button onClick={() => startEditSubject(subject)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }} title="Edit subject">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteSubject(subject._id)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--danger)' }} title="Delete subject">
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
                        <button onClick={() => toggleTopic(topic)} className="flex items-center gap-2 flex-1 text-left text-sm">
                          <span>{topic.name}</span>
                          {expandedTopic === topic._id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => startEditTopic(topic)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }} title="Edit topic">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteTopic(subject._id, topic._id)} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--danger)' }} title="Delete topic">
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
                                  <button onClick={() => startEditTrack(track)} className="p-1 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }} title="Rename track">
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => handleDeleteTrack(topic._id, track._id)} className="p-1 rounded-lg btn-press" style={{ color: 'var(--danger)' }} title="Delete track">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {expandedTrack === track._id && (
                              <div className="px-3 pb-3">
                                {(chapters[track._id] || []).map((chapter) => (
                                  <div key={chapter._id} className="flex items-center justify-between py-1.5 text-sm group">
                                    <Link
                                      to={`/admin-portal/content/chapters/${chapter._id}`}
                                      className="hover:text-[var(--accent)] transition-colors"
                                    >
                                      Ch.{chapter.chapterNumber} — {chapter.title}
                                    </Link>
                                    <div className="flex items-center gap-2">
                                      <Link to={`/admin-portal/content/chapters/${chapter._id}`} style={{ color: 'var(--text-muted)' }} title="Edit chapter">
                                        <Pencil size={13} />
                                      </Link>
                                      <button onClick={() => handleDeleteChapter(track._id, chapter._id)} style={{ color: 'var(--danger)' }} title="Delete chapter">
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
                          <button
                            onClick={() => setAddingTrackTo(topic._id)}
                            className="flex items-center gap-1.5 text-xs ml-2 mt-1"
                            style={{ color: 'var(--accent)' }}
                          >
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
                  <button
                    onClick={() => setAddingTopicTo(subject._id)}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Plus size={13} /> Add topic
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Shared field group for Subject create/edit forms
const SubjectFields = ({ form, setForm }) => (
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
      rows={2}
      className={inputClass}
      style={inputStyle}
    />
    <div>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Icon</p>
      <div className="flex flex-wrap gap-2">
        {ICON_OPTIONS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            title={label}
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
            key={color}
            type="button"
            onClick={() => setForm((f) => ({ ...f, color }))}
            className="w-7 h-7 rounded-full border-2 btn-press"
            style={{ backgroundColor: color, borderColor: form.color === color ? 'var(--text)' : 'transparent' }}
          />
        ))}
      </div>
    </div>
  </>
);

// Shared field group for Topic create/edit forms
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
      placeholder="Short description"
      rows={2}
      className={inputClass}
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
        type="number"
        min={5}
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
