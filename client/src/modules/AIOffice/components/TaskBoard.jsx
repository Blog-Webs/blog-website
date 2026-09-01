import React from 'react';
import { CheckSquare, Code, User } from 'lucide-react';

const COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', color: '#9CA3AF' },
  { id: 'ASSIGNED', label: 'Assigned', color: '#60A5FA' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#38BDF8' },
  { id: 'REVIEW', label: 'Review', color: '#F59E0B' },
  { id: 'TESTING', label: 'Testing', color: '#EC4899' },
  { id: 'BLOCKED', label: 'Blocked', color: '#EF4444' },
  { id: 'COMPLETED', label: 'Completed', color: '#10B981' }
];

export default function TaskBoard({ tasks = [], agents = [], onViewCode }) {
  const getAgentName = (agentId) => {
    const ag = agents.find((a) => a.id === agentId);
    return ag ? ag.name : 'Unassigned';
  };

  return (
    <div className="w-full h-full bg-[#0b0d13] p-4 lg:p-6 overflow-x-auto select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="text-indigo-400" size={18} />
            AI Project Task Board
          </h2>
          <p className="text-xs text-slate-400">Live orchestration status across all 10 specialized agent roles</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Total Tasks: <span className="text-white font-bold">{tasks.length}</span>
        </div>
      </div>

      {/* Kanban Columns Layout */}
      <div className="grid grid-cols-7 gap-3 min-w-[1200px] h-[calc(100%-4rem)] overflow-hidden">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-3 flex flex-col h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="text-xs font-bold text-slate-200">{col.label}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{task.id}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          task.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 leading-snug">{task.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="text-indigo-400 font-bold">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer / Assigned Agent */}
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User size={11} className="text-slate-400" />
                        {getAgentName(task.assignedAgentId)}
                      </span>
                      {task.codeSnippet && (
                        <button
                          onClick={() => onViewCode(task)}
                          className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
                          title="View Task Code Snippet"
                        >
                          <Code size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="p-4 text-center text-[11px] text-slate-400 italic">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
