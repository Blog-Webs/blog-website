'use client';

import React, { useState } from 'react';
import { Plus, CheckSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStudentOS } from '@/context/StudentOSContext';
import { StudentTask } from '@/types/studentos';

export default function TasksPage() {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useStudentOS();
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<StudentTask['priority']>('medium');
  const [newCategory, setNewCategory] = useState('Academic');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask({
      title: newTitle,
      description: newDesc,
      status: 'todo',
      priority: newPriority,
      dueDate: 'Soon',
      category: newCategory,
    });
    setNewTitle('');
    setNewDesc('');
    setShowModal(false);
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const renderColumn = (
    title: string,
    columnTasks: StudentTask[],
    statusKey: StudentTask['status'],
    badgeStyle: string
  ) => (
    <div className="flex-1 bg-slate-100/80 border border-slate-200/80 rounded-3xl flex flex-col min-h-[520px] p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeStyle}`}>
            {title}
          </span>
          <span className="text-xs font-semibold text-slate-500">({columnTasks.length})</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 pt-4">
        {columnTasks.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all shadow-xs group"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
              <button
                onClick={() => deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 rounded hover:bg-slate-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {t.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>}

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                t.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {t.priority}
              </span>

              <div className="flex items-center gap-1">
                {statusKey !== 'todo' && (
                  <button
                    className="h-6 text-[10px] px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    onClick={() => updateTaskStatus(t.id, 'todo')}
                  >
                    To Do
                  </button>
                )}
                {statusKey !== 'in_progress' && (
                  <button
                    className="h-6 text-[10px] px-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                    onClick={() => updateTaskStatus(t.id, 'in_progress')}
                  >
                    In Progress
                  </button>
                )}
                {statusKey !== 'completed' && (
                  <button
                    className="h-6 text-[10px] px-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
                    onClick={() => updateTaskStatus(t.id, 'completed')}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {columnTasks.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-300 rounded-2xl">
            No items in {title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-600" /> Tasks Kanban
          </h1>
          <p className="text-xs text-slate-500 mt-1">Organize academic assignments & coding sprints</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 self-start bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
          <Plus size={16} /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('To Do', todoTasks, 'todo', 'bg-amber-100 text-amber-800 border border-amber-200')}
        {renderColumn('In Progress', inProgressTasks, 'in_progress', 'bg-blue-100 text-blue-800 border border-blue-200')}
        {renderColumn('Completed', completedTasks, 'completed', 'bg-emerald-100 text-emerald-800 border border-emerald-200')}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-slate-200 bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add New Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Title</label>
                <Input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Paxos Consensus Algorithm"
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task details or reference notes..."
                  className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as StudentTask['priority'])}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 focus:bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Category</label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

