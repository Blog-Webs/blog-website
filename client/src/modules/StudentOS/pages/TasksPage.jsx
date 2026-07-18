import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Check, Calendar, ChevronDown, ListTodo, CheckSquare } from 'lucide-react';
import { studentOSApi } from '../api';

const Skeleton = () => (
  <div className="space-y-4">{[...Array(5)].map((_, i) => (
    <div key={i} className="h-16 rounded-2xl animate-pulse bg-[#161b22] border border-[#30363d]" />
  ))}</div>
);

const TasksPage = () => {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState('@default');
  const [listDropOpen, setListDropOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setListDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="min-h-full p-10 max-w-4xl mx-auto space-y-8 bg-[#0d1117] text-white font-sans transition-all duration-500">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm font-mono text-gray-500">// google.tasks</p>
        <h1 className="text-4xl font-bold tracking-tight text-white pb-1">Tasks</h1>
        <p className="text-sm font-medium">
          <span className="text-[#34d399]">{pending.length} pending</span>
          <span className="text-gray-500 mx-2">·</span>
          <span className="text-gray-500">{done.length} completed</span>
        </p>
      </div>

      {/* List selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setListDropOpen(!listDropOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#30363d] bg-[#161b22] text-sm font-semibold text-gray-200 hover:bg-[#21262d] transition-colors shadow-sm">
          <ListTodo size={16} className="text-gray-400" />
          {selectedList === '@default' ? 'My Tasks' : listName}
          <ChevronDown size={14} className={`text-gray-500 transition-transform ${listDropOpen ? 'rotate-180' : ''}`} />
        </button>
        {listDropOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-[#30363d] bg-[#161b22] shadow-xl z-20 overflow-hidden py-1">
            <button
              className="w-full text-left px-5 py-3 text-sm font-medium text-gray-300 hover:bg-[#21262d] hover:text-white transition-colors"
              onClick={() => { setSelectedList('@default'); setListDropOpen(false); }}>
              My Tasks (default)
            </button>
            {lists.filter((l) => l.id !== '@default').map((l) => (
              <button key={l.id}
                className="w-full text-left px-5 py-3 text-sm font-medium text-gray-300 hover:bg-[#21262d] hover:text-white transition-colors"
                onClick={() => { setSelectedList(l.id); setListDropOpen(false); }}>
                {l.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add task Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          {saving ? <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /> : <Plus size={20} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />}
        </div>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Add a task..."
          className="w-full pl-14 pr-5 py-5 rounded-2xl border border-[#30363d] bg-[#161b22] text-base text-gray-200 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 shadow-sm"
          disabled={saving}
        />
        {newTitle.trim() && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded-lg">
              <Calendar size={14} className="text-gray-500" />
              <input type="datetime-local" value={newDue} onChange={(e) => setNewDue(e.target.value)}
                className="bg-transparent text-xs outline-none text-gray-400" />
            </div>
            <p className="text-xs font-bold text-gray-500 mr-2">Press Enter ↵</p>
          </div>
        )}
      </div>

      {loading ? <Skeleton /> : (
        <div className="space-y-10 mt-4">
          {/* Pending Tasks */}
          <div className="space-y-3">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-[#30363d] bg-[#161b22] group hover:border-gray-500 transition-colors shadow-sm">
                <button
                  onClick={() => handleComplete(t.id)}
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 border border-gray-500 hover:border-blue-500 hover:bg-blue-500/10 transition-colors">
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-200">{t.title}</p>
                  {t.due && (
                    <p className="text-xs mt-1.5 font-medium text-gray-500 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(t.due).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:bg-[#21262d] hover:text-[#ef4444]">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {pending.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-70">
                <div className="w-16 h-16 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-6 shadow-sm">
                  <Check size={28} className="text-gray-500" />
                </div>
                <p className="text-lg italic text-gray-500">All caught up! No pending tasks.</p>
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {done.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-4 mb-6">
                <p className="text-[11px] font-bold tracking-[0.2em] text-gray-500 uppercase shrink-0">
                  Completed ({done.length})
                </p>
                <div className="h-px bg-[#30363d] flex-1" />
              </div>
              
              <div className="space-y-4 px-2">
                {done.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0 flex justify-between items-center">
                      <p className="text-base line-through text-gray-500">{t.title}</p>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-[#ef4444]">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
