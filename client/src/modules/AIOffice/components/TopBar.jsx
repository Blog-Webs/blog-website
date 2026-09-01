import React from 'react';
import { Play, Pause, Settings, Plus, Cpu, Activity } from 'lucide-react';

export default function TopBar({
  projectName,
  projectProgress,
  agentsOnline,
  totalAgents,
  totalTasks,
  tasksCompleted,
  tasksInProgress,
  tasksBlocked,
  systemStatus,
  isPaused,
  speedMultiplier,
  onTogglePause,
  onSetSpeed,
  onOpenNewProject,
  onOpenSettings
}) {
  return (
    <header className="h-16 bg-[#0f1117]/95 border-b border-slate-800/80 px-4 flex items-center justify-between z-30 shrink-0 text-slate-200 select-none shadow-lg backdrop-blur-md">
      {/* Left: Project Title & Progress */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-inner">
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">{projectName}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
                ● Live AI Office
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Software Development Simulation</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-36 bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${projectProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300">{projectProgress}%</span>
        </div>
      </div>

      {/* Center: Live Office Quick Stats */}
      <div className="hidden xl:flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-emerald-400 font-bold">●</span> Agents:
          <span className="text-white font-bold">{agentsOnline}/{totalAgents}</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          Tasks: <span className="text-white font-bold">{totalTasks}</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          Done: {tasksCompleted}
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-sky-400 font-semibold">
          Active: {tasksInProgress}
        </div>
        {tasksBlocked > 0 && (
          <>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              Blocked: {tasksBlocked}
            </div>
          </>
        )}
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <Activity size={12} className="animate-pulse" /> {systemStatus}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Speed Controls */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => onSetSpeed(spd)}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-all ${
                speedMultiplier === spd
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Pause / Resume */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isPaused
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isPaused ? <Play size={13} className="fill-current" /> : <Pause size={13} className="fill-current" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* New Project Button */}
        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-900/30 transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>New AI Project</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          title="Simulation Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
