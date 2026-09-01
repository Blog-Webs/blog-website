import React from 'react';
import { X, Code, Terminal, Wrench, Clock, MessageSquare } from 'lucide-react';
import { AGENT_STATES } from '../simulation/agentState';

export default function RightAgentPanel({ agent, onClose, onViewCode, onOpenTerminal }) {
  if (!agent) return null;

  const stateInfo = AGENT_STATES[agent.status] || AGENT_STATES.WORKING;

  return (
    <aside className="w-80 lg:w-96 bg-[#0e1017] border-l border-slate-800/80 flex flex-col h-full z-20 shrink-0 select-none shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
            {agent.avatar}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{agent.name}</h3>
            <p className="text-[11px] text-slate-400 font-medium">{agent.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {/* Status Badge */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Status</span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
            style={{
              backgroundColor: `${stateInfo.color}15`,
              borderColor: `${stateInfo.color}40`,
              color: stateInfo.color
            }}
          >
            <span>{stateInfo.icon}</span>
            <span>{stateInfo.label}</span>
          </div>
        </div>

        {/* Current Task Card */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Task</p>
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-semibold text-slate-100 text-xs leading-snug">{agent.currentTask}</h4>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Progress</span>
                <span className="font-bold text-indigo-400">{agent.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>

            {/* Current Activity detail */}
            <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider mb-0.5">Activity:</span>
              {agent.currentActivity}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewCode(agent)}
            className="flex items-center justify-center gap-1.5 p-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl font-bold transition-all"
          >
            <Code size={14} />
            <span>View Code</span>
          </button>
          <button
            onClick={() => onOpenTerminal(agent)}
            className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
          >
            <Terminal size={14} />
            <span>Terminal</span>
          </button>
        </div>

        {/* Assignment & Dependencies */}
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned By:</span>
            <span className="text-slate-200 font-medium">{agent.assignedBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Zone Area:</span>
            <span className="text-indigo-300 font-medium">{agent.zone}</span>
          </div>
        </div>

        {/* Tools Used */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Wrench size={12} /> Tools & Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.map((tool, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] border border-slate-700/60 font-mono"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Actions Timeline */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Clock size={12} /> Recent Actions
          </p>
          <div className="space-y-1.5">
            {agent.recentActions.map((action, idx) => (
              <div key={idx} className="flex gap-2 text-[11px] p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                <span className="text-slate-400 font-mono text-[10px]">{action.time}</span>
                <span className="text-slate-200">{action.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Speech/Thought bubble summary */}
        {agent.speechBubble && (
          <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 text-[11px]">
            <p className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-wider mb-1">
              <MessageSquare size={11} /> Agent Speech
            </p>
            <p className="text-indigo-200 italic font-sans">"{agent.speechBubble}"</p>
          </div>
        )}
      </div>
    </aside>
  );
}
