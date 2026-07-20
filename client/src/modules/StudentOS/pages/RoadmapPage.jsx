import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, CheckCircle2, Circle, Lock, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronRight, Trophy, Zap } from 'lucide-react';
import { roadmapApi } from '../api/roadmapApi';
import { useRoadmap } from '../context/RoadmapContext';

const TYPE_COLORS = { placement: '#A78BFA', exam: '#F87171', research: '#5EEAD4', certification: '#FFB454', skill: '#60A5FA', higher_studies: '#34D399', entrepreneurship: '#F472B6' };
const DIFFICULTY_COLORS = { beginner: '#34D399', intermediate: '#FFB454', advanced: '#F87171' };

function TopicCard({ topic, roadmapId, onComplete }) {
  const [completing, setCompleting] = useState(false);
  async function handleComplete() {
    if (topic.isCompleted || completing) return;
    setCompleting(true);
    try {
      await roadmapApi.completeTopic(roadmapId, topic.topicId);
      onComplete(topic.topicId);
    } finally { setCompleting(false); }
  }
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px', background: topic.isCompleted ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 14, border: `1px solid ${topic.isCompleted ? 'rgba(52,211,153,0.2)' : 'var(--sos-border)'}`, transition: 'all 0.2s', marginBottom: 8 }}>
      <button onClick={handleComplete} disabled={completing || topic.isCompleted} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: topic.isCompleted ? 'default' : 'pointer', padding: 0, marginTop: 2 }}>
        {completing ? <Loader2 size={20} style={{ color: '#A78BFA', animation: 'spin 1s linear infinite' }} /> : topic.isCompleted ? <CheckCircle2 size={20} color="#34D399" /> : <Circle size={20} color="var(--sos-text-muted)" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ color: topic.isCompleted ? 'var(--sos-text-muted)' : 'var(--sos-text)', fontWeight: 600, fontSize: 14, textDecoration: topic.isCompleted ? 'line-through' : 'none' }}>{topic.title}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${DIFFICULTY_COLORS[topic.difficulty] || '#888'}20`, color: DIFFICULTY_COLORS[topic.difficulty] || '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{topic.difficulty}</span>
          <span style={{ fontSize: 10, color: 'var(--sos-text-muted)' }}>~{topic.estimatedHours}h</span>
        </div>
        {topic.description && <p style={{ fontSize: 12, color: 'var(--sos-text-muted)', margin: 0, lineHeight: 1.5 }}>{topic.description}</p>}
        {topic.resources?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {topic.resources.slice(0, 3).map((r, i) => (
              r.url ? (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)', textDecoration: 'none' }}>
                  {r.title || r.platform || r.type}
                </a>
              ) : (
                <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'var(--sos-text-muted)', border: '1px solid var(--sos-border)' }}>
                  {r.title || r.type}
                </span>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseBlock({ phase, roadmapId, onTopicComplete }) {
  const [expanded, setExpanded] = useState(phase.phase === 1);
  const done = phase.topics.filter((t) => t.isCompleted).length;
  const total = phase.topics.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 16, borderRadius: 18, border: '1px solid var(--sos-border)', overflow: 'hidden', background: phase.isUnlocked ? 'var(--sos-card)' : 'rgba(255,255,255,0.02)', opacity: phase.isUnlocked ? 1 : 0.6 }}>
      <button onClick={() => phase.isUnlocked && setExpanded(!expanded)} disabled={!phase.isUnlocked} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'none', border: 'none', cursor: phase.isUnlocked ? 'pointer' : 'not-allowed', textAlign: 'left' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: phase.isUnlocked ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
          {!phase.isUnlocked ? <Lock size={16} color="var(--sos-text-muted)" /> : pct === 100 ? <Trophy size={16} color="#FFB454" /> : <Zap size={16} color="#A78BFA" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 15 }}>Phase {phase.phase}: {phase.title}</span>
            {!phase.isUnlocked && <span style={{ fontSize: 10, color: 'var(--sos-text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 999 }}>LOCKED</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', maxWidth: 200 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#34D399' : 'linear-gradient(90deg, #7C3AED, #A78BFA)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--sos-text-muted)', whiteSpace: 'nowrap' }}>{done}/{total} · {phase.durationWeeks}w</span>
          </div>
        </div>
        {phase.isUnlocked && (expanded ? <ChevronDown size={16} color="var(--sos-text-muted)" /> : <ChevronRight size={16} color="var(--sos-text-muted)" />)}
      </button>
      {expanded && phase.isUnlocked && (
        <div style={{ padding: '0 20px 16px' }}>
          {phase.description && <p style={{ fontSize: 13, color: 'var(--sos-text-muted)', marginBottom: 14, lineHeight: 1.6 }}>{phase.description}</p>}
          {phase.topics.map((topic) => (
            <TopicCard key={topic.topicId} topic={topic} roadmapId={roadmapId} onComplete={onTopicComplete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const { roadmap, roadmapStatus, setRoadmap } = useRoadmap();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try { await roadmapApi.generateRoadmap(); } finally { setGenerating(false); }
  };

  const handleTopicComplete = (topicId) => {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, phases: prev.phases.map((phase) => ({ ...phase, topics: phase.topics.map((t) => t.topicId === topicId ? { ...t, isCompleted: true, completedAt: new Date() } : t) })) };
      const total = updated.phases.reduce((s, p) => s + p.topics.length, 0);
      const done = updated.phases.reduce((s, p) => s + p.topics.filter((t) => t.isCompleted).length, 0);
      updated.completionPercent = Math.round((done / total) * 100);
      return updated;
    });
  };

  if (roadmapStatus === 'generating') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={36} color="#A78BFA" />
        </div>
        <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 22, margin: 0 }}>Building Your Roadmap</h2>
        <p style={{ color: 'var(--sos-text-muted)', fontSize: 15, margin: 0, textAlign: 'center', maxWidth: 420 }}>
          Our AI is analyzing your profile, performing gap analysis, and creating a personalized roadmap for you. This takes about 10-15 seconds.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA', animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <Map size={48} color="var(--sos-text-muted)" style={{ marginBottom: 16 }} />
          <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>No Roadmap Yet</h2>
          <p style={{ color: 'var(--sos-text-muted)', marginBottom: 24 }}>Your AI roadmap hasn't been generated yet. Click below to create your personalized roadmap.</p>
          <button onClick={handleGenerate} disabled={generating} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: 'white', fontWeight: 700, fontSize: 15, cursor: generating ? 'not-allowed' : 'pointer' }}>
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generating ? 'Generating...' : 'Generate My Roadmap'}
          </button>
        </div>
      </div>
    );
  }

  const typeColor = TYPE_COLORS[roadmap.type] || '#A78BFA';
  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `${typeColor}20`, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{roadmap.type?.replace('_', ' ')}</span>
              <span style={{ fontSize: 11, color: 'var(--sos-text-muted)' }}>{roadmap.domain}</span>
            </div>
            <h1 style={{ color: 'var(--sos-text)', fontWeight: 800, fontSize: 24, margin: 0, marginBottom: 4 }}>{roadmap.title}</h1>
            <p style={{ color: 'var(--sos-text-muted)', fontSize: 14, margin: 0 }}>Goal: {roadmap.careerGoal?.replace(/_/g, ' ')}</p>
          </div>
          <button onClick={handleGenerate} disabled={generating} title="Regenerate roadmap" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--sos-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--sos-text-muted)', cursor: 'pointer', fontSize: 13 }}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Regenerate
          </button>
        </div>

        {/* Overall Progress */}
        <div style={{ marginTop: 16, background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--sos-text)', fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 700 }}>{roadmap.completionPercent}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${roadmap.completionPercent}%`, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Gap Analysis */}
        {roadmap.gapAnalysis && (
          <div style={{ marginTop: 12, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={13} color="#A78BFA" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Gap Analysis</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--sos-text-muted)', margin: 0, lineHeight: 1.6 }}>{roadmap.gapAnalysis}</p>
          </div>
        )}
      </div>

      {/* Phases */}
      {roadmap.phases.map((phase) => (
        <PhaseBlock key={phase.phase} phase={phase} roadmapId={roadmap._id} onTopicComplete={handleTopicComplete} />
      ))}
    </div>
  );
}
