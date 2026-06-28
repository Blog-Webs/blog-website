import { useEffect, useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { todoApi } from '../api/userFeatures';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';

const PRIORITY_COLOR = { low: '#5EEAD4', medium: '#FFB454', high: '#F87171' };

const TodoPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    todoApi.getAll().then(({ data }) => setTodos(data.todos)).finally(() => setLoading(false));
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await todoApi.create(text, priority);
    setTodos((prev) => [data.todo, ...prev]);
    setText('');
  };

  const handleToggle = async (todo) => {
    const { data } = await todoApi.update(todo._id, { isDone: !todo.isDone });
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? data.todo : t)));
  };

  const handleDelete = async (id) => {
    await todoApi.remove(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Your To-Do List</h1>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to note things down as you learn.</p>
        <div className="flex justify-center"><GoogleSignInButton /></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 glow-title">To-Do List</h1>
      <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Jot down anything important while you study.</p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
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
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : todos.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Nothing here yet — add your first note above.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {todos.map((todo) => (
            <div
              key={todo._id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border card-hover"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => handleToggle(todo)}
                className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 btn-press"
                style={{
                  borderColor: todo.isDone ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: todo.isDone ? 'var(--accent)' : 'transparent',
                }}
              >
                {todo.isDone && <Check size={13} color="var(--bg)" />}
              </button>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: PRIORITY_COLOR[todo.priority] }}
              />
              <p
                className="flex-1 text-sm"
                style={{ textDecoration: todo.isDone ? 'line-through' : 'none', color: todo.isDone ? 'var(--text-muted)' : 'var(--text)' }}
              >
                {todo.text}
              </p>
              <button onClick={() => handleDelete(todo._id)} className="btn-press" style={{ color: 'var(--text-muted)' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoPage;
