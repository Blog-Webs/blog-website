import React from 'react';
import { GitMerge, ArrowDown } from 'lucide-react';

export default function TaskGraph({ tasks = [] }) {
  const steps = [
    { title: '1. Requirements Analysis', role: 'AI Project Manager', taskId: 'TASK-001' },
    { title: '2. System Architecture & Spec', role: 'AI Project Manager', taskId: 'TASK-001' },
    { title: '3. Database Schemas', role: 'Database Engineer', taskId: 'TASK-002' },
    { title: '4. Backend REST APIs & Auth', role: 'Backend Engineer', taskId: 'TASK-003' },
    { title: '5. Frontend Dashboard UI', role: 'Frontend Lead', taskId: 'TASK-004' },
    { title: '6. Integration & Security Audit', role: 'Security Specialist', taskId: 'TASK-007' },
    { title: '7. Automated E2E Testing', role: 'QA Engineer', taskId: 'TASK-006' },
    { title: '8. CI/CD & Cloud Deployment', role: 'DevOps Engineer', taskId: 'TASK-005' }
  ];

  return (
    <div className="w-full h-full bg-[#0b0d13] p-6 overflow-y-auto select-none">
      <div className="mb-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <GitMerge className="text-indigo-400" size={18} />
          Project Task Graph & Dependency Flow
        </h2>
        <p className="text-xs text-slate-400">Sequential DAG (Directed Acyclic Graph) of software orchestration</p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {steps.map((step, idx) => {
          const matchedTask = tasks.find((t) => t.id === step.taskId);
          const isCompleted = matchedTask?.status === 'COMPLETED';
          const isInProgress = matchedTask?.status === 'IN_PROGRESS' || matchedTask?.status === 'TESTING';

          return (
            <React.Fragment key={idx}>
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : isInProgress
                    ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs font-mono">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{step.title}</h3>
                    <p className="text-[11px] text-slate-400">Assigned: {step.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isInProgress
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? 'COMPLETED' : isInProgress ? 'IN PROGRESS' : 'QUEUED'}
                  </span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex justify-center my-1 text-slate-600">
                  <ArrowDown size={16} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
