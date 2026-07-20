import { useState, useEffect, useCallback } from 'react';
import { Brain, ChevronRight, Loader2, CheckCircle2, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { roadmapApi } from '../api/roadmapApi';
import { useRoadmap } from '../context/RoadmapContext';

const LEVEL_COLORS = { beginner: '#F87171', intermediate: '#FFB454', advanced: '#34D399' };

export default function AssessmentPage() {
  const { profile } = useRoadmap();
  const [skills, setSkills] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [answeredAll, setAnsweredAll] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');
  const [difficultyProgression, setDifficultyProgression] = useState([]);
  const [answers, setAnswers] = useState({});
  const [batchIdx, setBatchIdx] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('select'); // 'select' | 'quiz' | 'result'

  useEffect(() => {
    if (!profile) return;
    const domain = profile.subDomain || profile.domain;
    Promise.all([
      roadmapApi.getAssessmentSkills(domain),
      roadmapApi.getAssessmentHistory(),
    ]).then(([s, h]) => {
      setSkills(s.data.skills || []);
      setHistory(h.data.history || []);
    }).catch(() => {});
  }, [profile]);

  const startQuiz = async (skill) => {
    setLoading(true);
    setSelectedSkill(skill);
    setAnswers({});
    setAnsweredAll([]);
    setResult(null);
    try {
      const { data } = await roadmapApi.startAssessment(skill.key, profile?.subDomain || profile?.domain);
      setQuiz(data.quiz);
      setCurrentBatch(data.quiz.questions || []);
      setCurrentDifficulty(data.quiz.startingDifficulty || 'easy');
      setDifficultyProgression([data.quiz.startingDifficulty || 'easy']);
      setStartTime(Date.now());
      setBatchIdx(0);
      setTotalAnswered(0);
      setPhase('quiz');
    } catch { alert('Failed to start assessment. Please try again.'); }
    setLoading(false);
  };

  const selectAnswer = (qIdx, option) => {
    setAnswers((prev) => ({ ...prev, [`${batchIdx}_${qIdx}`]: option }));
  };

  const submitBatch = async () => {
    const batchAnswered = currentBatch.map((q, i) => ({ ...q, selected: answers[`${batchIdx}_${i}`] || '' }));
    const correctCount = batchAnswered.filter((q) => q.selected === q.correct).length;
    const newAll = [...answeredAll, ...batchAnswered];
    setAnsweredAll(newAll);
    const newTotal = totalAnswered + currentBatch.length;
    setTotalAnswered(newTotal);

    // If we've hit 10+ questions, submit
    if (newTotal >= 10) {
      await finalSubmit(newAll);
      return;
    }

    // Get next adaptive batch
    setLoading(true);
    try {
      const correctRatio = correctCount / currentBatch.length;
      const { data } = await roadmapApi.getNextBatch({
        skill: selectedSkill.key,
        domain: profile?.subDomain || profile?.domain,
        currentDifficulty,
        answeredQuestions: newAll,
        correctCount,
      });
      setCurrentBatch(data.questions || []);
      setCurrentDifficulty(data.difficulty);
      setDifficultyProgression((prev) => [...prev, data.difficulty]);
      setAnswers({});
      setBatchIdx((i) => i + 1);
    } catch { await finalSubmit(newAll); }
    setLoading(false);
  };

  const finalSubmit = async (allQs) => {
    const timeTaken = Math.round((Date.now() - (startTime || Date.now())) / 1000);
    setLoading(true);
    try {
      const { data } = await roadmapApi.submitAssessment({
        skill: selectedSkill.key,
        domain: profile?.subDomain || profile?.domain,
        questions: allQs,
        difficultyProgression,
        timeTakenSeconds: timeTaken,
        isRetake: quiz?.isRetake || false,
      });
      setResult(data);
      setHistory((prev) => [{ skill: selectedSkill.key, score: data.score, level: data.level, createdAt: new Date() }, ...prev]);
      setPhase('result');
    } catch { alert('Failed to submit. Please try again.'); }
    setLoading(false);
  };

  const allBatchAnswered = currentBatch.every((_, i) => answers[`${batchIdx}_${i}`]);

  return (
    <div style={{ padding: '24px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={22} color="#A78BFA" />
        </div>
        <div>
          <h1 style={{ color: 'var(--sos-text)', fontWeight: 800, fontSize: 22, margin: 0 }}>Skill Assessment</h1>
          <p style={{ color: 'var(--sos-text-muted)', fontSize: 13, margin: 0 }}>Adaptive quizzes · AI-scored · Updates your roadmap</p>
        </div>
      </div>

      {/* Select Phase */}
      {phase === 'select' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Skill Grid */}
          <div>
            <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Select a Skill to Assess</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {skills.filter((s) => s.assessable).map((skill) => {
                const prior = history.find((h) => h.skill === skill.key);
                return (
                  <button key={skill.key} onClick={() => startQuiz(skill)} disabled={loading} style={{ padding: '16px', borderRadius: 14, border: '1px solid var(--sos-border)', background: 'var(--sos-card)', color: 'var(--sos-text)', cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{skill.label}</span>
                    {prior ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={11} color={LEVEL_COLORS[prior.level]} />
                        <span style={{ fontSize: 11, color: LEVEL_COLORS[prior.level], fontWeight: 600, textTransform: 'capitalize' }}>{prior.level} · {prior.score}%</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--sos-text-muted)' }}>Not assessed yet</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Recent Assessments</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {history.slice(0, 6).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${LEVEL_COLORS[h.level] || '#888'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: LEVEL_COLORS[h.level] }}>
                      {h.score}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--sos-text)', fontWeight: 600, fontSize: 14 }}>{h.skill?.replace(/_/g, ' ')}</span>
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: LEVEL_COLORS[h.level], fontWeight: 600, textTransform: 'capitalize' }}>{h.level}</span>
                        <span style={{ fontSize: 11, color: 'var(--sos-text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--sos-text-muted)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 999 }}>Retake</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Phase */}
      {phase === 'quiz' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 18, margin: '0 0 4px' }}>
                {selectedSkill?.label} Assessment
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: currentDifficulty === 'hard' ? '#F87171' : currentDifficulty === 'medium' ? '#FFB454' : '#34D399', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize' }}>
                  {currentDifficulty} difficulty
                </span>
                <span style={{ fontSize: 12, color: 'var(--sos-text-muted)' }}>{totalAnswered} / 10 answered</span>
              </div>
            </div>
            {loading && <Loader2 size={20} color="#A78BFA" style={{ animation: 'spin 1s linear infinite' }} />}
          </div>

          {currentBatch.map((q, i) => (
            <div key={i} style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <p style={{ color: 'var(--sos-text)', fontWeight: 600, fontSize: 15, margin: '0 0 16px', lineHeight: 1.5 }}>
                Q{totalAnswered + i + 1}. {q.question}
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {(q.options || []).map((option, j) => {
                  const isSelected = answers[`${batchIdx}_${i}`] === option;
                  return (
                    <button key={j} onClick={() => selectAnswer(i, option)} style={{ padding: '10px 16px', borderRadius: 12, border: `1px solid ${isSelected ? '#A78BFA' : 'var(--sos-border)'}`, background: isSelected ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)', color: isSelected ? '#A78BFA' : 'var(--sos-text)', fontSize: 14, cursor: 'pointer', textAlign: 'left', fontWeight: isSelected ? 600 : 400, transition: 'all 0.15s' }}>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={submitBatch} disabled={!allBatchAnswered || loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: allBatchAnswered ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : 'rgba(255,255,255,0.06)', color: allBatchAnswered ? 'white' : 'var(--sos-text-muted)', fontWeight: 700, fontSize: 15, cursor: allBatchAnswered && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : totalAnswered + currentBatch.length >= 10 ? 'Submit Assessment' : `Next Questions →`}
          </button>
        </div>
      )}

      {/* Result Phase */}
      {phase === 'result' && result && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: `${LEVEL_COLORS[result.level]}15`, border: `3px solid ${LEVEL_COLORS[result.level]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', flexDirection: 'column' }}>
            <span style={{ fontWeight: 900, fontSize: 28, color: LEVEL_COLORS[result.level] }}>{result.score}</span>
            <span style={{ fontSize: 10, color: LEVEL_COLORS[result.level], fontWeight: 600 }}>%</span>
          </div>
          <h2 style={{ color: 'var(--sos-text)', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>
            {result.level.charAt(0).toUpperCase() + result.level.slice(1)} Level
          </h2>
          <p style={{ color: 'var(--sos-text-muted)', marginBottom: 8 }}>{selectedSkill?.label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            <Sparkles size={14} color="#A78BFA" />
            <span style={{ fontSize: 13, color: '#A78BFA' }}>Roadmap has been updated with your result</span>
          </div>
          <button onClick={() => setPhase('select')} style={{ padding: '12px 28px', borderRadius: 12, border: '1px solid var(--sos-border)', background: 'var(--sos-card)', color: 'var(--sos-text)', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>
            Assess Another Skill
          </button>
        </div>
      )}
    </div>
  );
}
