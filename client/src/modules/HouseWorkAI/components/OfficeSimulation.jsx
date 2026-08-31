import React from 'react';
import { useHouseWork } from '../context/HouseWorkContext';
import AgentWorker from './AgentWorker';

// Room definitions — which agents sit in each room
const ROOMS = [
  {
    id: 'reception',
    label: 'Reception',
    icon: '🏛️',
    color: '#8B5CF6',
    agentIds: ['aria'],
    cols: 'col-span-2',
    description: 'Project coordination & management hub',
  },
  {
    id: 'dev',
    label: 'Engineering',
    icon: '💻',
    color: '#3B82F6',
    agentIds: ['dev', 'nova'],
    cols: 'col-span-2',
    description: 'Code, debug and quality assurance',
  },
  {
    id: 'design',
    label: 'Design Studio',
    icon: '🎨',
    color: '#EC4899',
    agentIds: ['pixel'],
    cols: 'col-span-1',
    description: 'UI/UX & visual design',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    color: '#10B981',
    agentIds: ['sage'],
    cols: 'col-span-1',
    description: 'Data analysis & reporting',
  },
  {
    id: 'server',
    label: 'DevOps',
    icon: '⚙️',
    color: '#6366F1',
    agentIds: ['byte'],
    cols: 'col-span-2',
    description: 'Infrastructure, CI/CD & deployments',
  },
];

export default function OfficeSimulation() {
  const { agents } = useHouseWork();

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const workingCount = agents.filter(a => a.status === 'working').length;

  return (
    <div className="relative bg-[#060d18] rounded-2xl border border-white/8 overflow-hidden shadow-2xl">
      {/* Grid background — pixel art floor */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floor pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #475569 25%, transparent 25%), linear-gradient(-45deg, #475569 25%, transparent 25%)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-[#0a1525]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-[10px] font-mono font-bold text-white/40 ml-1">HQ OFFICE FLOOR</span>
        </div>
        <div className="flex items-center gap-2">
          {workingCount > 0 ? (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {workingCount} agent{workingCount > 1 ? 's' : ''} working
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/60 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
              All idle
            </div>
          )}
        </div>
      </div>

      {/* Rooms grid */}
      <div className="relative z-10 p-4 grid grid-cols-4 gap-3">
        {ROOMS.map(room => {
          const roomAgents = room.agentIds
            .map(id => agentMap[id])
            .filter(Boolean);
          const roomActive = roomAgents.some(a => a.status === 'working');

          return (
            <div
              key={room.id}
              className={`${room.cols} rounded-xl border transition-all duration-500`}
              style={{
                background: roomActive
                  ? `linear-gradient(135deg, ${room.color}10, ${room.color}06)`
                  : 'rgba(15,23,42,0.6)',
                borderColor: roomActive ? `${room.color}35` : 'rgba(255,255,255,0.06)',
                boxShadow: roomActive ? `0 0 20px ${room.color}15` : 'none',
              }}
            >
              {/* Room header */}
              <div
                className="px-3 py-2 border-b flex items-center gap-2"
                style={{ borderColor: `${room.color}20` }}
              >
                <span style={{ fontSize: 12 }}>{room.icon}</span>
                <div>
                  <div
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: room.color }}
                  >
                    {room.label}
                  </div>
                  <div className="text-[8px] text-white/25">{room.description}</div>
                </div>
                {roomActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: room.color }}
                  />
                )}
              </div>

              {/* Workers */}
              <div className="p-3 flex flex-wrap gap-3 justify-center">
                {roomAgents.map(agent => (
                  <AgentWorker key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity ticker at bottom */}
      <div className="relative z-10 border-t border-white/5 px-4 py-2 bg-[#0a1525]/60 flex items-center gap-2">
        <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest shrink-0">Activity:</span>
        <div className="flex gap-3 overflow-x-auto scrollbar-none">
          {agents.map(a => (
            <div key={a.id} className="flex items-center gap-1 shrink-0">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: a.status === 'working' ? a.color : a.status === 'done' ? '#34d399' : '#334155' }}
              />
              <span className="text-[9px] font-mono" style={{ color: a.status !== 'idle' ? a.color : '#475569' }}>
                {a.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
