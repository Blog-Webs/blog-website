import { useEffect, useRef, useState } from 'react';
import { Focus, Pause, Play, RotateCcw, CheckSquare, StickyNote, Sparkles, Settings, Eye, Headphones, Bold, Italic, List, Save, Square } from 'lucide-react';
import { studentOSApi } from '../api';

const TIMER_PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
  { label: 'Custom', minutes: null },
];

const pad = (n) => String(n).padStart(2, '0');

const FocusModePage = () => {
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState(0);
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState([]);
  const [aiMsg, setAiMsg] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    studentOSApi.getTasks(null)
      .then(({ data }) => setTasks((data.tasks || []).filter((t) => t.status !== 'completed').slice(0, 5)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handlePreset = (idx) => {
    setPreset(idx);
    const p = TIMER_PRESETS[idx];
    if (p.minutes) {
      setTimerMinutes(p.minutes);
      setSecondsLeft(p.minutes * 60);
      setRunning(false);
    }
  };

  const handleCustomSet = () => {
    const m = parseInt(customMinutes);
    if (m > 0 && m <= 120) {
      setTimerMinutes(m);
      setSecondsLeft(m * 60);
      setRunning(false);
    }
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(timerMinutes * 60);
  };

  const pct = Math.round((secondsLeft / (timerMinutes * 60)) * 100);
  const circumference = 2 * Math.PI * 120; // Adjusted for larger circle
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const askAi = async () => {
    if (!aiMsg.trim()) return;
    setLoadingAi(true);
    setAiReply('');
    try {
      const { data } = await studentOSApi.chat(aiMsg);
      setAiReply(data.reply || 'No response.');
    } catch {
      setAiReply('Could not reach AI. Check your GEMINI_API_KEY.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-full p-10 max-w-7xl mx-auto space-y-6 bg-[#0d1117] text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-sm font-mono text-gray-500">// studentos.focus</p>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Focus size={32} className="text-blue-500" /> Focus Mode
          </h1>
          <p className="text-gray-400 text-sm">Distraction-free study environment</p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#065f46]/30 border border-[#059669]/30 text-[#34d399] text-xs font-semibold tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            LIVE SYNCING
          </div>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tanish" alt="avatar" className="w-10 h-10 rounded-full border border-[#30363d]" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Left Column: Timer HUD */}
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 flex flex-col items-center shadow-lg relative min-h-[500px]">
          <div className="w-full flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-100">Timer HUD</h2>
            <button className="text-gray-500 hover:text-gray-300 transition-colors">
              <Settings size={20} />
            </button>
          </div>

          {/* Presets */}
          <div className="flex gap-1 w-full bg-[#0d1117] p-1 rounded-xl mb-12 border border-[#30363d]">
            {TIMER_PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => handlePreset(i)}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                  preset === i 
                    ? 'bg-[#30363d] text-white shadow' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {preset === 3 && (
            <div className="flex items-center gap-2 mb-8 -mt-6">
              <input type="number" min={1} max={120} value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="min" className="w-20 px-3 py-1.5 rounded-lg border border-[#30363d] bg-[#0d1117] text-sm text-center outline-none text-white focus:border-blue-500 transition-colors" />
              <button onClick={handleCustomSet} className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors">Set</button>
            </div>
          )}

          {/* Huge Progress Ring */}
          <div className="relative flex-1 flex flex-col items-center justify-center mb-8">
            <svg width="260" height="260" className="-rotate-90">
              <circle cx="130" cy="130" r="120" fill="none" stroke="#21262d" strokeWidth="4" />
              <circle cx="130" cy="130" r="120" fill="none"
                stroke="#3b82f6" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
              <p className="text-7xl font-bold tracking-tighter tabular-nums" style={{ fontFamily: 'Inter, sans-serif' }}>
                {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
              </p>
              <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 mt-2">
                {pct}% REMAINING
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-auto">
            <button onClick={reset} className="w-12 h-12 rounded-full border border-[#30363d] bg-[#0d1117] hover:bg-[#21262d] flex items-center justify-center transition-colors group">
              <RotateCcw size={20} className="text-gray-400 group-hover:text-white" />
            </button>
            <button
              onClick={() => setRunning(!running)}
              className="w-20 h-20 rounded-full flex items-center justify-center bg-blue-200 hover:bg-blue-300 transition-all shadow-[0_0_30px_rgba(191,219,254,0.3)] hover:shadow-[0_0_40px_rgba(191,219,254,0.5)]">
              {running ? <Pause size={28} fill="currentColor" className="text-blue-900" /> : <Play size={28} fill="currentColor" className="text-blue-900 ml-1" />}
            </button>
            <button onClick={() => { setRunning(false); setSecondsLeft(timerMinutes * 60); }} 
              className="w-12 h-12 rounded-full border border-[#30363d] bg-[#0d1117] hover:bg-[#21262d] flex items-center justify-center transition-colors group">
              <Square size={16} fill="currentColor" className="text-gray-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Focus notes */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-lg flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-3">
                <StickyNote size={20} className="text-blue-400" /> Session Notes
              </h2>
              <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-white transition-colors"><Bold size={16} /></button>
                <button className="hover:text-white transition-colors"><Italic size={16} /></button>
                <button className="hover:text-white transition-colors"><List size={16} /></button>
                <div className="w-px h-4 bg-[#30363d]" />
                <button className="hover:text-white transition-colors"><Save size={16} /></button>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your thoughts, key points, or questions here..."
              className="w-full flex-1 bg-transparent text-sm text-gray-300 outline-none resize-none leading-relaxed placeholder-gray-600 mt-2"
            />
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-3">
                <CheckSquare size={20} className="text-blue-400" /> Focus Tasks
              </h2>
              <button className="px-3 py-1.5 rounded-lg bg-[#30363d] hover:bg-[#3b434b] text-xs font-semibold transition-colors flex items-center gap-1.5 text-gray-200">
                + Add Task
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="border border-dashed border-[#30363d] rounded-xl py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0d1117] flex items-center justify-center border border-[#30363d]">
                  <CheckSquare size={24} className="text-[#30363d]" />
                </div>
                <p className="text-sm font-medium text-gray-500">No pending tasks for this session</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#30363d] bg-[#0d1117] hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="w-4 h-4 rounded border border-gray-500 shrink-0" />
                    <p className="text-sm text-gray-200">{t.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick AI Panel */}
      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-2 flex items-center shadow-lg w-full">
        <div className="w-12 h-12 rounded-xl bg-[#0d1117] flex items-center justify-center ml-2 border border-[#30363d] shrink-0">
          <Sparkles size={20} className="text-cyan-400" />
        </div>
        <input 
          value={aiMsg} 
          onChange={(e) => setAiMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askAi()}
          placeholder="Ask a quick question..."
          className="flex-1 bg-transparent px-6 py-4 text-sm text-gray-300 outline-none placeholder-gray-600"
        />
        <div className="flex items-center gap-3 pr-2 shrink-0">
          <div className="px-2 py-1 rounded bg-[#0d1117] border border-[#30363d] text-[10px] font-bold text-gray-500 flex items-center gap-1">
            <span className="text-xs">⌘</span> ENTER
          </div>
          <button 
            onClick={askAi} 
            disabled={loadingAi || !aiMsg.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-200 text-blue-900 hover:bg-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingAi ? '...' : 'Ask'}
          </button>
        </div>
      </div>
      
      {/* AI Reply Area */}
      {aiReply && (
        <div className="rounded-2xl border border-blue-500/50 bg-[#161b22] p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <p className="text-sm leading-relaxed text-gray-300">{aiReply}</p>
        </div>
      )}

      {/* Footer Nav */}
      <div className="flex justify-between items-center px-2 pt-4 pb-8 text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 hover:text-gray-300 cursor-pointer transition-colors"><Eye size={14} /> Private Session</span>
          <span className="flex items-center gap-2 hover:text-gray-300 cursor-pointer transition-colors"><Headphones size={14} /> Focus Music: Lofi Tech</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-gray-300 cursor-pointer transition-colors">Session History</span>
          <span className="hover:text-gray-300 cursor-pointer transition-colors">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default FocusModePage;
