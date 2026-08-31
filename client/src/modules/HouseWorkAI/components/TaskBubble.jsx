import React from 'react';

// Floating speech-bubble showing current task
export default function TaskBubble({ text, color = '#60a5fa' }) {
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'hwTaskPop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <div
        className="relative px-2.5 py-1.5 rounded-xl text-[9px] font-semibold text-white/90 shadow-xl max-w-[160px] truncate whitespace-nowrap"
        style={{
          background: `linear-gradient(135deg, #0f172a, #1e293b)`,
          border: `1px solid ${color}40`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${color}20`,
        }}
      >
        {text}
        {/* Pointer */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0"
          style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid #1e293b`,
          }}
        />
      </div>
    </div>
  );
}
