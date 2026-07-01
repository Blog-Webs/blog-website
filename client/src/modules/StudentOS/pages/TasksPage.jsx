import { useEffect, useState } from 'react';
import { CheckSquare, Plus, Trash2, Check, Calendar, ChevronDown, ListTodo } from 'lucide-react';
import { studentOSApi } from '../api';

const PRIORITY_COLOR = { high: '#F87171', medium: '#FFB454', low: '#5EEAD4' };

const Skeleton = () => (
  <div className="space-y-2">{[...Array(5)].map((_, i) => (
    <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
  ))}</div>
);

const TasksPage = () => {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState('@default');
  const [listDropOpen, setListDropOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentOSApi.getTaskLists()
      .then(({ data }) => setLists(data.lists || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    studentOSApi.getTasks(selectedList === '@default' ? null : selectedList)
      .then(({ data }) => setTasks(data.tasks || []))
      .finally(() => setLoading(false));
  }, [selectedList]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const { data } = await studentOSApi.createTask(
        { title: newTitle, due: newDue || undefined },
        selectedList === '@default' ? null : selectedList
      );
      setTasks((prev) => [data.task, ...prev]);
      setNewTitle('');
      setNewDue('');
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (taskId) => {
    await studentOSApi.completeTask(taskId, selectedList === '@default' ? null : selectedList);
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  const handleDelete = async (taskId) => {
    await studentOSApi.deleteTask(taskId, selectedList === '@default' ? null : selectedList);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const listName = lists.find((l) => l.id === selectedList)?.title || 'My Tasks';
  const pending = tasks.filter((t) => t.status !== 'completed');
  const done = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// google.tasks</p>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p style={{ color: 'var(--text-muted)' }}>{pending.length} pending · {done.length} completed</p>
      </div>

      {/* List selector */}
      <div className="relative">
        <button
          onClick={() => setListDropOpen(!listDropOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm btn-press"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <ListTodo size={14} />
          {selectedList === '@default' ? 'My Tasks' : listName}
          <ChevronDown size={14} className={`transition-transform ${listDropOpen ? 'rotate-180' : ''}`} />
        </button>
        {listDropOpen && (
          <div className="absolute top-full left-0 mt-1 w-60 rounded-xl border shadow-xl z-20 overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <button
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)] transition-colors"
              onClick={() => { setSelectedList('@default'); setListDropOpen(false); }}>
              My Tasks (default)
            </button>
            {lists.filter((l) => l.id !== '@default').map((l) => (
              <button key={l.id}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)] transition-colors"
                onClick={() => { setSelectedList(l.id); setListDropOpen(false); }}>
                {l.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add task */}
      {adding ? (
        <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)' }}>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Task title..."
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
              <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)}
                className="bg-transparent text-xs outline-none" style={{ color: 'var(--text-muted)' }} />
            </div>
            <button onClick={handleCreate} disabled={saving || !newTitle.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
              {saving ? '...' : 'Add'}
            </button>
            <button onClick={() => { setAdding(false); setNewTitle(''); setNewDue(''); }}
              className="px-3 py-1.5 rounded-lg text-xs border btn-press"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl border w-full text-sm btn-press transition-colors hover:border-[var(--accent)]"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }}>
          <Plus size={16} /> Add a task...
        </button>
      )}

      {loading ? <Skeleton /> : (
        <div className="space-y-6">
          {/* Pending */}
          <div className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-xl group"
                style={{ backgroundColor: 'var(--surface)' }}>
                <button
                  onClick={() => handleComplete(t.id)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{t.title}</p>
                  {t.due && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={10} className="inline mr-1" />
                      {new Date(t.due).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity btn-press"
                  style={{ color: 'var(--danger)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                All caught up! No pending tasks.
              </p>
            )}
          </div>

          {/* Completed */}
          {done.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Completed ({done.length})
              </p>
              <div className="space-y-1.5">
                {done.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl opacity-60">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--accent)' }}>
                      <Check size={11} color="var(--bg)" />
                    </div>
                    <p className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>{t.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
