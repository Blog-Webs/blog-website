'use client';

import React, { useState } from 'react';
import { Plus, CheckSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

  const renderColumn = (title: string, columnTasks: StudentTask[], statusKey: StudentTask['status'], badgeVariant: 'warning' | 'apple' | 'success') => (
    <Card className="flex-1 bg-zinc-950/50 border-zinc-800/80 flex flex-col min-h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant} className="text-xs px-2.5">{title}</Badge>
          <span className="text-xs font-semibold text-zinc-400">({columnTasks.length})</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-4">
        {columnTasks.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all shadow-sm group"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">{t.title}</h3>
              <button
                onClick={() => deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {t.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{t.description}</p>}

            <div className="mt-4 flex items-center justify-between text-xs">
              <Badge variant={t.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                {t.priority}
              </Badge>

              <div className="flex items-center gap-1">
                {statusKey !== 'todo' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => updateTaskStatus(t.id, 'todo')}
                  >
                    To Do
                  </Button>
                )}
                {statusKey !== 'in_progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-blue-400 border-blue-500/30"
                    onClick={() => updateTaskStatus(t.id, 'in_progress')}
                  >
                    In Progress
                  </Button>
                )}
                {statusKey !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-emerald-400 border-emerald-500/30"
                    onClick={() => updateTaskStatus(t.id, 'completed')}
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-400" /> Tasks Kanban
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Organize academic assignments & coding sprints</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="apple" className="gap-2 self-start">
          <Plus size={16} /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('To Do', todoTasks, 'todo', 'warning')}
        {renderColumn('In Progress', inProgressTasks, 'in_progress', 'apple')}
        {renderColumn('Completed', completedTasks, 'completed', 'success')}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <CardTitle>Add New Task</CardTitle>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Title</label>
                <Input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Paxos Consensus Algorithm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task details or reference notes..."
                  className="w-full h-24 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as StudentTask['priority'])}
                    className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Category</label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="apple">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
