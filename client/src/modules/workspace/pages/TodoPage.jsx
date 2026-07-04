import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, StickyNote, ListTodo, X, Tag } from 'lucide-react';
import { todoApi, noteApi } from '../api/userFeatures';
import { ListSkeleton } from '../../core/components/ui/Skeleton';
import { useAuth } from '../../core/context/AuthContext';
import GoogleSignInButton from '../../core/components/ui/GoogleSignInButton';

const PRIORITY_COLOR = { low: '#5EEAD4', medium: '#FFB454', high: '#F87171' };
const NOTE_COLORS = ['#5EEAD4', '#FFB454', '#A78BFA', '#F87171', '#60A5FA', '#34D399'];
const SUBJECTS = ['DSA', 'Java', 'Aptitude', 'System Design', 'Database', 'OS', 'General'];

/* ── Tab pill ── */
const Tab = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 btn-press"
    style={{
      backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
    }}
  >
    <Icon size={15} />
    {label}
  </button>
);

/* ── Note card ── */
const NoteCard = ({ note, onDelete }) => (
  <div
    className="note-card border p-4"
    style={{
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--border)',
      '--note-color': note.color,
    }}
  >
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{note.title}</p>
        {note.subject && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono-display px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: `${note.color}22`, color: note.color }}
          >
            <Tag size={9} /> {note.subject}
          </span>
        )}
      </div>
      <button
        onClick={() => onDelete(note._id)}
        className="shrink-0 p-1 rounded btn-press"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={14} />
      </button>
    </div>
    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
      {note.content}
    </p>
  </div>
);

const TodoPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState('todos'); // 'todos' | 'notes'

  // Todos state
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteColor, setNoteColor] = useState('#5EEAD4');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      todoApi.getAll().then(({ data }) => setTodos(data.todos)),
      noteApi.getAll().then(({ data }) => setNotes(data.notes)),
    ]).finally(() => setLoading(false));
  }, [user]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await todoApi.create(text, priority);
    setTodos((prev) => [data.todo, ...prev]);
    setText('');
  };

  const handleToggleTodo = async (todo) => {
    const { data } = await todoApi.update(todo._id, { isDone: !todo.isDone });
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? data.todo : t)));
  };

  const handleDeleteTodo = async (id) => {
    await todoApi.remove(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const { data } = await noteApi.create({ title: noteTitle, content: noteContent, subject: noteSubject, color: noteColor });
    setNotes((prev) => [data.note, ...prev]);
    setNoteTitle('');
    setNoteContent('');
    setNoteSubject('');
    setNoteColor('#5EEAD4');
  };

  const handleDeleteNote = async (id) => {
    await noteApi.remove(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Your Workspace</h1>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to access your to-dos and notes.</p>
        <div className="flex justify-center"><GoogleSignInButton /></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-1 glow-title">Workspace</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Your to-dos and notes, all in one place.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-7">
        <Tab active={tab === 'todos'} onClick={() => setTab('todos')} icon={ListTodo} label={`To-Do (${todos.length})`} />
        <Tab active={tab === 'notes'} onClick={() => setTab('notes')} icon={StickyNote} label={`Notes (${notes.length})`} />
      </div>

      {/* ── TODOS TAB ── */}
      {tab === 'todos' && (
        <>
          <form onSubmit={handleAddTodo} className="flex gap-2 mb-7">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Revise sliding window pattern…"
              className="flex-1 px-3.5 py-3 rounded-xl border text-sm outline-none input-focus"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-3 rounded-xl border text-sm outline-none input-focus"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="px-4 py-3 rounded-xl btn-press" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
              <Plus size={17} />
            </button>
          </form>

          {loading ? (
            <ListSkeleton count={3} />
          ) : todos.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Nothing here yet — add your first task above.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todos.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border card-hover"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => handleToggleTodo(todo)}
                    className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 btn-press"
                    style={{
                      borderColor: todo.isDone ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: todo.isDone ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {todo.isDone && <Check size={13} color="var(--bg)" />}
                  </button>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLOR[todo.priority] }} />
                  <p
                    className="flex-1 text-sm"
                    style={{ textDecoration: todo.isDone ? 'line-through' : 'none', color: todo.isDone ? 'var(--text-muted)' : 'var(--text)' }}
                  >
                    {todo.text}
                  </p>
                  <button onClick={() => handleDeleteTodo(todo._id)} className="btn-press" style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── NOTES TAB ── */}
      {tab === 'notes' && (
        <>
          <form
            onSubmit={handleAddNote}
            className="flex flex-col gap-3 mb-7 p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>New note</p>

            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title…"
              className="w-full px-3.5 py-3 rounded-xl border text-sm font-medium outline-none input-focus"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />

            <div className="flex gap-2">
              <select
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none input-focus"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="">Subject (optional)</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Color picker */}
              <div className="flex items-center gap-1.5 px-2">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNoteColor(c)}
                    className="w-5 h-5 rounded-full btn-press shrink-0"
                    style={{
                      backgroundColor: c,
                      outline: noteColor === c ? `2px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here… concepts, reminders, code snippets."
              rows={5}
              className="w-full px-3.5 py-3 rounded-xl border text-sm outline-none input-focus resize-none"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium self-end btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              <Plus size={15} /> Add note
            </button>
          </form>

          {loading ? (
            <ListSkeleton count={2} />
          ) : notes.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No notes yet — write your first one above.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} onDelete={handleDeleteNote} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodoPage;
