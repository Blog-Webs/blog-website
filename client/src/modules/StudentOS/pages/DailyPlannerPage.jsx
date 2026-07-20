import { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Sparkles, CheckCircle2, Circle, Calendar, Zap, RefreshCw } from 'lucide-react';
import { roadmapApi } from '../api/roadmapApi';

const TYPE_COLORS = { study: '#60A5FA', practice: '#A78BFA', revision: '#FFB454', assessment: '#F87171', project: '#34D399', break: 'rgba(255,255,255,0.2)', mock_test: '#F87171' };
const PRIORITY_COLORS = { high: '#F87171', medium: '#FFB454', low: '#34D399' };

function TaskCard({ task, planId, onComplete }) {
  const [completing, setCompleting] = useState(false);
  const tc = TYPE_COLORS[task.type] || '#888';

  const handle = async () => {
    if (task.isCompleted || completing) return;
    setCompleting(true);
    try {
      await roadmapApi.completeTask(planId, task.taskId);
      onComplete(task.taskId);
    } finally { setCompleting(false); }
  };

  const startTime = task.scheduledStart ? new Date(task.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const endTime = task.scheduledEnd ? new Date(task.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 16px', background: task.isCompleted ? 'rgba(52,211,153,0.05)' : 'var(--sos-card)', border: `1px solid ${task.isCompleted ? 'rgba(52,211,153,0.15)' : 'var(--sos-border)'}`, borderLeft: `3px solid ${tc}`, borderRadius: '0 14px 14px 0', transition: 'all 0.2s', marginBottom: 8 }}>
      <button onClick={handle} disabled={completing || task.isCompleted || task.type === 'break'} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: task.isCompleted || task.type === 'break' ? 'default' : 'pointer', padding: '2px 0' }}>
        {completing ? <Loader2 size={20} style={{ color: tc, animation: 'spin 1s linear infinite' }} /> : task.isCompleted ? <CheckCircle2 size={20} color="#34D399" /> : task.type === 'break' ? <Circle size={20} color="rgba(255,255,255,0.15)" /> : <Circle size={20} color="var(--sos-text-muted)" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ color: task.isCompleted ? 'var(--sos-text-muted)' : 'var(--sos-text)', fontWeight: 600, fontSize: 14, textDecoration: task.isCompleted ? 'line-through' : 'none' }}>{task.title}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${tc}20`, color: tc, textTransform: 'uppercase' }}>{task.type}</span>
          {task.priority && task.priority !== 'medium' && (
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority], fontWeight: 700, textTransform: 'uppercase' }}>{task.priority}</span>
          )}
        </div>
        {task.description && <p style={{ fontSize: 12, color: 'var(--sos-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{task.description}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--sos-text-muted)' }}>
          {startTime && <span>⏰ {startTime} – {endTime}</span>}
          <span>{task.durationMins} min</span>
        </div>
        {task.resources?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {task.resources.slice(0, 2).map((r, i) =>
              r.url ? <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)', textDecoration: 'none' }}>{r.title || r.platform}</a>
                : <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', color: 'var(--sos-text-muted)' }}>{r.title}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyPlannerPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await roadmapApi.getDailyPlan(today);
      setPlan(data.plan);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await roadmapApi.generateDailyPlan(today);
      setPlan(data.plan);
    } catch { alert('Could not generate plan. Please ensure your roadmap is active.'); }
    setGenerating(false);
  };

  const handleTaskComplete = (taskId) => {
    setPlan((prev) => {
      if (!prev) return prev;
      const tasks = prev.tasks.map((t) => t.taskId === taskId ? { ...t, isCompleted: true } : t);
      const completedMins = tasks.filter((t) => t.isCompleted && t.type !== 'break').reduce((s, t) => s + (t.durationMins || 0), 0);
      return { ...prev, tasks, completedMins };
    });
  };

  const studyTasks = plan?.tasks.filter((t) => t.type !== 'break') || [];
  const completedCount = studyTasks.filter((t) => t.isCompleted).length;
  const completedMins = plan?.completedMins || 0;
  const pct = studyTasks.length > 0 ? Math.round((completedCount / studyTasks.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader2 size={32} color="#A78BFA" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} color="#60A5FA" />
          </div>
          <div>
            <h1 style={{ color: 'var(--sos-text)', fontWeight: 800, fontSize: 22, margin: 0 }}>Daily Planner</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Calendar size={11} color="var(--sos-text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--sos-text-muted)' }}>{displayDate}</span>
            </div>
          </div>
        </div>
        <button onClick={generate} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)', color: '#A78BFA', cursor: generating ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
          {generating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
          {generating ? 'Generating...' : plan ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {!plan ? (
        <div style={{ textAlign: 'center', padding: '60px 32px', background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 20 }}>
          <ClipboardList size={48} color="var(--sos-text-muted)" style={{ marginBottom: 16 }} />
          <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No Plan for Today</h2>
          <p style={{ color: 'var(--sos-text-muted)', marginBottom: 24 }}>Generate your AI-powered personalized study plan for today. Tasks will sync to Google Calendar if connected.</p>
          <button onClick={generate} disabled={generating} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {generating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
            {generating ? 'Generating...' : 'Generate My Plan'}
          </button>
        </div>
      ) : (
        <div>
          {/* Progress bar */}
          <div style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sos-text)', fontWeight: 600 }}>Today's Progress</span>
                <span style={{ fontSize: 13, color: '#60A5FA', fontWeight: 700 }}>{completedCount}/{studyTasks.length} tasks</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#60A5FA' }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--sos-text-muted)' }}>{completedMins} min done</div>
            </div>
          </div>

          {/* AI Insight */}
          {plan.aiInsight && (
            <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10 }}>
              <Sparkles size={16} color="#A78BFA" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--sos-text-muted)', margin: 0, lineHeight: 1.6 }}>{plan.aiInsight}</p>
            </div>
          )}

          {/* Calendar sync badge */}
          {plan.calendarSynced && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34D399', marginBottom: 14 }}>
              <CheckCircle2 size={13} />
              Tasks synced to Google Calendar
            </div>
          )}

          {/* Tasks */}
          <div>
            {plan.tasks.map((task) => (
              <TaskCard key={task.taskId} task={task} planId={plan._id} onComplete={handleTaskComplete} />
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
            {[
              { label: 'Total Time', val: `${plan.totalStudyMins} min`, color: '#60A5FA' },
              { label: 'Focus Area', val: plan.focusArea || 'General', color: '#A78BFA' },
              { label: 'Tasks Done', val: `${completedCount}/${studyTasks.length}`, color: '#34D399' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: s.color, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--sos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
