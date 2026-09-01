import React from 'react';
import { ZONES_LAYOUT } from '../simulation/movementEngine';
import { AGENT_STATES } from '../simulation/agentState';
import { Code, Server, Coffee } from 'lucide-react';

export default function OfficeCanvas({ agents, selectedAgentId, onSelectAgent, onViewCode }) {

  return (
    <div className="relative w-full h-full bg-[#0a0c10] overflow-hidden select-none flex items-center justify-center p-2 lg:p-4">
      {/* Grid Floor Pattern Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #334155 1px, transparent 1px),
            linear-gradient(to bottom, #334155 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Main Office Container (Isometric 16:9 bounds) */}
      <div className="relative w-full max-w-[1400px] aspect-[16/9] bg-[#11141c] border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Office Ambient Lighting Glow */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* ── 1. RENDER OFFICE ZONES & ROOMS ────────────────────────────────────── */}
        {Object.entries(ZONES_LAYOUT).map(([zoneName, zone]) => (
          <div
            key={zoneName}
            className="absolute rounded-xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm transition-all p-3"
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`
            }}
          >
            {/* Zone Label Header */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                {zone.label}
              </span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
            </div>

            {/* Zone Room Furniture Details */}
            {zoneName === 'Meeting Room' && (
              <div className="absolute inset-x-4 inset-y-8 border-2 border-amber-900/40 bg-amber-950/20 rounded-xl flex items-center justify-center">
                <div className="w-24 h-10 bg-amber-900/40 border border-amber-700/40 rounded-lg flex items-center justify-center shadow-inner">
                  <span className="text-[9px] font-mono font-bold text-amber-300">CONF TABLE</span>
                </div>
              </div>
            )}

            {zoneName === 'Server / Infrastructure Area' && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <div className="w-6 h-12 bg-slate-800 border border-slate-700 rounded flex flex-col justify-around p-1 items-center">
                  <Server size={12} className="text-amber-400 animate-pulse" />
                  <Server size={12} className="text-amber-400 animate-pulse" />
                </div>
              </div>
            )}

            {zoneName === 'Manager Office' && (
              <div className="absolute top-8 right-3 text-slate-700 opacity-60">
                <Coffee size={18} />
              </div>
            )}
          </div>
        ))}

        {/* ── 2. RENDER WORKSTATIONS / DESKS & COMPUTERS ───────────────────────── */}
        {agents.map((agent) => (
          <div
            key={`desk-${agent.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${agent.deskX}%`, top: `${agent.deskY}%` }}
            onClick={() => onViewCode(agent)}
            title={`Workstation: ${agent.name} (${agent.role})`}
          >
            {/* Desk Surface */}
            <div className="w-14 h-9 bg-slate-800/90 border border-slate-700/80 rounded-md shadow-md flex items-center justify-center relative hover:border-indigo-500 transition-colors">
              {/* Computer Monitor */}
              <div className="w-8 h-5 bg-slate-950 border border-slate-600 rounded flex items-center justify-center relative overflow-hidden">
                {/* Code Screen Glow */}
                <div
                  className={`w-full h-full text-[6px] font-mono p-0.5 opacity-80 leading-none overflow-hidden ${
                    agent.status === 'CODING' || agent.status === 'WORKING'
                      ? 'text-emerald-400 bg-emerald-950/40'
                      : 'text-indigo-400 bg-indigo-950/40'
                  }`}
                >
                  <code>const app = express();</code>
                </div>
              </div>

              {/* Workstation Hover Icon */}
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                <Code size={10} /> View Code
              </div>
            </div>
          </div>
        ))}

        {/* ── 3. RENDER AGENT AVATARS & SPEECH BUBBLES ────────────────────────── */}
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          const stateInfo = AGENT_STATES[agent.status] || AGENT_STATES.WORKING;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ${
                isSelected ? 'scale-110 z-30' : 'hover:scale-105'
              }`}
              style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            >
              {/* Thought / Speech Bubble */}
              {agent.thoughtBubble && (
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-slate-700 text-slate-200 text-[10px] px-2 py-1 rounded-xl shadow-xl flex items-center gap-1 z-20 animate-bounce duration-1000">
                  <span className="text-[11px]">💭</span>
                  <span className="font-mono text-[9px]">{agent.thoughtBubble}</span>
                </div>
              )}

              {/* Agent Character Sprite Card */}
              <div
                className={`relative px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all ${
                  isSelected
                    ? 'bg-indigo-900/90 border-indigo-400 ring-2 ring-indigo-400/50'
                    : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Character Emoji & Status Dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shadow-inner">
                    {agent.avatar}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900"
                    style={{ backgroundColor: stateInfo.color }}
                  />
                </div>

                {/* Name & Role text */}
                <div className="text-left leading-none pr-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    {agent.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {agent.role.split(' ')[0]}
                  </p>
                </div>

                {/* State Tag */}
                <div
                  className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${stateInfo.color}20`,
                    color: stateInfo.color
                  }}
                >
                  {stateInfo.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
