'use client';

import React, { useState } from 'react';
import { Plus, CheckSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg flex flex-col min-h-[500px] p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${badgeStyle}`}>
            {title}
          </span>
          <span className="text-xs font-semibold text-gray-500">({columnTasks.length})</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 pt-3">
        {columnTasks.map((t) => (
          <div
            key={t.id}
            className="p-3.5 rounded-md bg-white border border-gray-200 hover:border-gray-300 shadow-2xs transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xs font-semibold text-gray-900">{t.title}</h3>
              <button
                onClick={() => deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-600 transition-opacity p-0.5 rounded hover:bg-gray-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
            {t.description && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.description}</p>}

            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                t.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {t.priority}
              </span>

              <div className="flex items-center gap-1">
                {statusKey !== 'todo' && (
                  <button
                    className="h-5 text-[10px] px-2 rounded border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => updateTaskStatus(t.id, 'todo')}
                  >
                    To Do
                  </button>
                )}
                {statusKey !== 'in_progress' && (
                  <button
                    className="h-5 text-[10px] px-2 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                    onClick={() => updateTaskStatus(t.id, 'in_progress')}
                  >
                    In Progress
                  </button>
                )}
                {statusKey !== 'completed' && (
                  <button
                    className="h-5 text-[10px] px-2 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
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
          <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-gray-200 rounded-md">
            No items in {title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-gray-700" size={20} /> Tasks Kanban
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Organize academic assignments & coding sprints</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs transition-colors self-start"
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {renderColumn('To Do', todoTasks, 'todo', 'bg-amber-50 text-amber-800 border border-amber-200')}
        {renderColumn('In Progress', inProgressTasks, 'in_progress', 'bg-blue-50 text-blue-800 border border-blue-200')}
        {renderColumn('Completed', completedTasks, 'completed', 'bg-emerald-50 text-emerald-800 border border-emerald-200')}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-gray-200 bg-white rounded-lg p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-gray-900">Add New Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Paxos Consensus Algorithm"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task details or reference notes..."
                  className="w-full h-20 rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as StudentTask['priority'])}
                    className="w-full h-8 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">Category</label>
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
