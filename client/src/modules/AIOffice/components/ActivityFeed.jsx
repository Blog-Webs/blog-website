import React from 'react';
import { Activity, MessageSquare, Code, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ActivityFeed({ events = [] }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'COMMUNICATION':
        return <MessageSquare size={13} className="text-sky-400" />;
      case 'CODE_PATCHED':
        return <Code size={13} className="text-emerald-400" />;
      case 'TEST_PASSED':
        return <CheckCircle2 size={13} className="text-emerald-400" />;
      case 'TEST_RESULTS':
      case 'BLOCKED':
        return <AlertTriangle size={13} className="text-amber-400" />;
      default:
        return <Activity size={13} className="text-indigo-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-[#0b0d13] p-4 lg:p-6 overflow-y-auto select-none">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="text-indigo-400" size={18} />
            Real-Time Agent Activity & Communication Feed
          </h2>
          <p className="text-xs text-slate-400">Streaming event logs from AI employee collaboration</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          Total Events: {events.length}
        </span>
      </div>

      <div className="space-y-2.5 max-w-4xl mx-auto">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-all"
          >
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shrink-0 mt-0.5">
              {getEventIcon(evt.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-white">{evt.agentName}</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                  {evt.type}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">{evt.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{evt.message}</p>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 italic">No events logged yet</div>
        )}
      </div>
    </div>
  );
}
