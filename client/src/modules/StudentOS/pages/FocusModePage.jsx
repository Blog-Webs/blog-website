import { useEffect, useRef, useState } from 'react';
import { Focus, Timer, Pause, Play, RotateCcw, CheckSquare, StickyNote, Sparkles, X } from 'lucide-react';
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
  const circumference = 2 * Math.PI * 54;
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
    <div className="min-h-full p-6 max-w-5xl mx-auto"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="mb-6">
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// studentos.focus</p>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Focus size={22} style={{ color: 'var(--accent)' }} /> Focus Mode
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Distraction-free study environment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-1 rounded-2xl border p-6 flex flex-col items-center gap-5"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium self-start">Pomodoro Timer</p>

          {/* Presets */}
          <div className="flex gap-1.5 self-start">
            {TIMER_PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => handlePreset(i)}
                className="text-xs px-2.5 py-1.5 rounded-lg btn-press transition-all"
                style={{
                  backgroundColor: preset === i ? 'var(--accent)' : 'var(--surface-raised)',
                  color: preset === i ? 'var(--bg)' : 'var(--text-muted)',
                }}>
                {p.label}
              </button>
            ))}
          </div>

          {preset === 3 && (
            <div className="flex items-center gap-2 self-start">
              <input type="number" min={1} max={120} value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="min" className="w-16 px-2 py-1 rounded-lg border text-xs text-center outline-none"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', color: 'var(--text)' }} />
              <button onClick={handleCustomSet} className="text-xs px-3 py-1.5 rounded-lg btn-press"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>Set</button>
            </div>
          )}

          {/* SVG Progress Ring */}
          <div className="relative">
            <svg width="140" height="140" className="-rotate-90">
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="70" cy="70" r="54" fill="none"
                stroke="var(--accent)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold font-mono-display">
                {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}% remaining</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={reset} className="p-3 rounded-xl border btn-press" style={{ borderColor: 'var(--border)' }}>
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setRunning(!running)}
              className="px-8 py-3 rounded-xl font-semibold text-sm btn-press flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)', color: 'var(--bg)' }}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : secondsLeft === 0 ? 'Restart' : 'Start'}
            </button>
          </div>

          {secondsLeft === 0 && (
            <div className="text-center p-3 rounded-xl w-full"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <p className="font-semibold">🎉 Session complete!</p>
              <p className="text-xs">Take a 5-minute break.</p>
            </div>
          )}
        </div>

        {/* Notes + Tasks */}
        <div className="lg:col-span-2 space-y-5">
          {/* Focus notes */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <StickyNote size={15} style={{ color: 'var(--accent)' }} /> Session Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your thoughts, key points, or questions here..."
              rows={7}
              className="w-full bg-transparent text-sm outline-none resize-none leading-relaxed"
              style={{ color: 'var(--text)' }}
            />
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckSquare size={15} style={{ color: 'var(--accent)' }} /> Focus Tasks
            </p>
            {tasks.length === 0
              ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pending tasks</p>
              : tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2">
                  <div className="w-4 h-4 rounded border shrink-0" style={{ borderColor: 'var(--border)' }} />
                  <p className="text-sm">{t.title}</p>
                </div>
              ))}
          </div>

          {/* Quick AI */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles size={15} style={{ color: 'var(--accent)' }} /> Quick AI
            </p>
            <div className="flex gap-2">
              <input value={aiMsg} onChange={(e) => setAiMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAi()}
                placeholder="Ask a quick question..."
                className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', color: 'var(--text)' }} />
              <button onClick={askAi} disabled={loadingAi || !aiMsg.trim()}
                className="px-4 py-2 rounded-xl text-sm btn-press"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)', opacity: !aiMsg.trim() ? 0.5 : 1 }}>
                Ask
              </button>
            </div>
            {aiReply && (
              <div className="mt-3 p-3 rounded-xl text-sm leading-relaxed"
                style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text)' }}>
                {aiReply}
              </div>
            )}
            {loadingAi && (
              <div className="mt-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusModePage;
