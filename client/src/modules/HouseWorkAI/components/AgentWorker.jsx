import React from 'react';
import TaskBubble from './TaskBubble';

// Animated status config
const STATUS_CFG = {
  idle:    { dot: '#64748b', glow: 'transparent',         label: 'Idle' },
  working: { dot: '#fbbf24', glow: 'rgba(251,191,36,0.2)', label: 'Working' },
  done:    { dot: '#34d399', glow: 'rgba(52,211,153,0.2)', label: 'Done' },
};

// Mini monitor with animated bars when working
function Monitor({ isWorking, isDone }) {
  return (
    <div
      className="w-11 h-8 rounded-sm border border-white/10 bg-[#0d1b2a] flex items-center justify-center relative overflow-hidden"
      style={{ boxShadow: isWorking ? '0 0 8px rgba(96,165,250,0.3)' : 'none' }}
    >
      {isWorking && (
        <div className="absolute inset-0 flex items-end px-1 pb-1 gap-[2px]">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-blue-400/70"
              style={{
                animationName: 'hwBarPulse',
                animationDuration: `${0.4 + i * 0.12}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
                animationDelay: `${i * 0.08}s`,
                height: '40%',
              }}
            />
          ))}
        </div>
      )}
      {isDone && (
        <span className="text-[10px]">✅</span>
      )}
      {!isWorking && !isDone && (
        <div className="w-6 h-0.5 bg-blue-900/60 rounded" />
      )}
      {/* Screen reflection */}
      <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-white/5 rounded" />
    </div>
  );
}

export default function AgentWorker({ agent }) {
  const sc = STATUS_CFG[agent.status] || STATUS_CFG.idle;
  const isWorking = agent.status === 'working';
  const isDone = agent.status === 'done';

  return (
    <div
      className="relative flex flex-col items-center gap-[3px] p-2.5 rounded-2xl transition-all duration-500 cursor-default group"
      style={{
        backgroundColor: isWorking ? agent.color + '12' : isDone ? '#34d39912' : 'transparent',
        boxShadow: isWorking ? `0 0 20px ${agent.color}25, inset 0 1px 0 ${agent.color}20` : 'none',
        border: `1px solid ${isWorking ? agent.color + '30' : isDone ? '#34d39930' : 'transparent'}`,
      }}
    >
      {/* Task bubble above */}
      {agent.currentTask && (
        <TaskBubble text={agent.currentTask} color={isWorking ? agent.color : '#34d399'} />
      )}

      {/* Monitor */}
      <Monitor isWorking={isWorking} isDone={isDone} />

      {/* Monitor stand */}
      <div className="w-3 h-1 bg-[#1e293b] border border-white/5 rounded-sm" />

      {/* Desk surface */}
      <div
        className="w-12 h-2 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #1e2d3d, #162030)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />

      {/* Worker emoji */}
      <div
        style={{
          fontSize: 22,
          lineHeight: 1,
          filter: isWorking ? `drop-shadow(0 0 8px ${agent.color})` : 'none',
          animationName: isWorking ? 'hwWorkerBob' : 'none',
          animationDuration: '0.9s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          transition: 'filter 0.4s',
        }}
      >
        {agent.emoji}
      </div>

      {/* Chair */}
      <div className="w-8 h-1 rounded-full bg-[#1e293b] border border-white/5" />

      {/* Name */}
      <span className="text-[10px] font-bold text-white/80 mt-0.5 tracking-wide">{agent.name}</span>

      {/* Status row */}
      <div className="flex items-center gap-1">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: sc.dot,
            boxShadow: `0 0 5px ${sc.dot}`,
            animationName: isWorking ? 'hwPulse' : 'none',
            animationDuration: '1s',
            animationIterationCount: 'infinite',
          }}
        />
        <span className="text-[8px] text-white/40 font-medium">{agent.role}</span>
      </div>
    </div>
  );
}
