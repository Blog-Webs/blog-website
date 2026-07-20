import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight, ChevronLeft, Sparkles, Check, Loader2, BookOpen, Target, Zap, Clock } from 'lucide-react';
import { roadmapApi } from '../api/roadmapApi';
import { useRoadmap } from '../context/RoadmapContext';

const STEPS = [
  { id: 1, title: 'Academic Info', icon: BookOpen, desc: 'Tell us about your studies' },
  { id: 2, title: 'Your Domain', icon: GraduationCap, desc: 'What field are you in?' },
  { id: 3, title: 'Career Goal', icon: Target, desc: 'Where do you want to go?' },
  { id: 4, title: 'Skills & Style', icon: Zap, desc: 'How do you learn best?' },
];

const LEARNING_STYLES = [
  { key: 'visual', label: 'Visual', desc: 'Videos, diagrams, charts', emoji: '👁️' },
  { key: 'reading', label: 'Reading', desc: 'Books, articles, notes', emoji: '📖' },
  { key: 'practical', label: 'Practical', desc: 'Exercises, projects, labs', emoji: '🛠️' },
  { key: 'mixed', label: 'Mixed', desc: 'Variety of everything', emoji: '🔀' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshProfile, setOnboardingComplete, setRoadmapStatus } = useRoadmap();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 state
  const [s1, setS1] = useState({ collegeName: '', degree: '', branch: '', yearOfStudy: 1, semester: 1 });
  // Step 2 state
  const [domains, setDomains] = useState({});
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  // Step 3 state
  const [careerGoals, setCareerGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [targetDate, setTargetDate] = useState('');
  // Step 4 state
  const [skills, setSkills] = useState([]);
  const [skillRatings, setSkillRatings] = useState({});
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [studyHours, setStudyHours] = useState(3);

  useEffect(() => {
    roadmapApi.getDomains().then(({ data }) => setDomains(data.domains || {})).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDomain) {
      roadmapApi.getCareerGoals(selectedDomain).then(({ data }) => setCareerGoals(data.goals || [])).catch(() => {});
    }
  }, [selectedDomain]);

  useEffect(() => {
    if (selectedDomain) {
      roadmapApi.getSkills(selectedDomain).then(({ data }) => setSkills(data.skills || [])).catch(() => {});
    }
  }, [selectedDomain]);

  async function goNext() {
    setError('');
    setSaving(true);
    try {
      if (step === 1) {
        if (!s1.degree.trim()) { setError('Degree is required.'); setSaving(false); return; }
        await roadmapApi.step1(s1);
        setStep(2);
      } else if (step === 2) {
        if (!selectedDomain) { setError('Please select your domain.'); setSaving(false); return; }
        await roadmapApi.step2({ domain: selectedParent, subDomain: selectedDomain });
        setStep(3);
      } else if (step === 3) {
        if (!selectedGoal) { setError('Please select a career goal.'); setSaving(false); return; }
        await roadmapApi.step3({ careerGoal: selectedGoal.key, careerGoalLabel: selectedGoal.label, roadmapType: selectedGoal.roadmapType, targetExamDate: targetDate || undefined });
        setStep(4);
      } else if (step === 4) {
        const selfSkillRatings = Object.entries(skillRatings).map(([skill, level]) => ({ skill, level }));
        await roadmapApi.step4({ selfSkillRatings, learningStyle, studyHoursPerDay: parseFloat(studyHours) });
        await roadmapApi.completeOnboarding();
        setOnboardingComplete(true);
        setRoadmapStatus('generating');
        await refreshProfile();
        navigate('/student-os/roadmap');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const progress = ((step - 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sos-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 999, padding: '8px 16px', marginBottom: 16 }}>
            <Sparkles size={16} color="#A78BFA" />
            <span style={{ color: '#A78BFA', fontWeight: 600, fontSize: 13 }}>AI Personalization Setup</span>
          </div>
          <h1 style={{ color: 'var(--sos-text)', fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>
            Let's build your personalized roadmap
          </h1>
          <p style={{ color: 'var(--sos-text-muted)', fontSize: 15 }}>
            Answer 4 quick questions — your AI roadmap will be ready in seconds
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: step < s.id ? 0.4 : 1, transition: 'opacity 0.3s' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > s.id ? '#22c55e' : step === s.id ? '#A78BFA' : 'rgba(255,255,255,0.08)', border: step >= s.id ? 'none' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s' }}>
                {step > s.id ? <Check size={14} color="white" /> : <s.icon size={14} color="white" />}
              </div>
              <span style={{ fontSize: 10, color: step >= s.id ? 'var(--sos-text)' : 'var(--sos-text-muted)', textAlign: 'center', fontWeight: step === s.id ? 600 : 400 }}>{s.title}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>

        {/* Card */}
        <div style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 20, padding: 32 }}>
          <h2 style={{ color: 'var(--sos-text)', fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>{STEPS[step - 1].title}</h2>
          <p style={{ color: 'var(--sos-text-muted)', fontSize: 13, margin: '0 0 24px' }}>{STEPS[step - 1].desc}</p>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { label: 'College / University Name', key: 'collegeName', placeholder: 'e.g. IIT Delhi, AIIMS, NLU Delhi' },
                { label: 'Degree', key: 'degree', placeholder: 'e.g. B.Tech, MBBS, LLB, MBA' },
                { label: 'Branch / Specialization', key: 'branch', placeholder: 'e.g. Computer Science, Cardiology, Criminal Law' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                  <input value={s1[key]} onChange={(e) => setS1({ ...s1, [key]: e.target.value })} placeholder={placeholder}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sos-border)', borderRadius: 10, padding: '10px 14px', color: 'var(--sos-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ label: 'Year of Study', key: 'yearOfStudy', min: 1, max: 7 }, { label: 'Semester', key: 'semester', min: 1, max: 14 }].map(({ label, key, min, max }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                    <input type="number" min={min} max={max} value={s1[key]} onChange={(e) => setS1({ ...s1, [key]: parseInt(e.target.value) || min })}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sos-border)', borderRadius: 10, padding: '10px 14px', color: 'var(--sos-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.keys(domains).map((parent) => (
                    <button key={parent} onClick={() => { setSelectedParent(parent); setSelectedDomain(''); }}
                      style={{ padding: '8px 16px', borderRadius: 999, border: `1px solid ${selectedParent === parent ? '#A78BFA' : 'var(--sos-border)'}`, background: selectedParent === parent ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: selectedParent === parent ? '#A78BFA' : 'var(--sos-text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                      {parent}
                    </button>
                  ))}
                </div>
              </div>
              {selectedParent && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialization</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                    {(domains[selectedParent] || []).map((d) => (
                      <button key={d.key} onClick={() => setSelectedDomain(d.key)}
                        style={{ padding: '12px 16px', borderRadius: 14, border: `1px solid ${selectedDomain === d.key ? '#A78BFA' : 'var(--sos-border)'}`, background: selectedDomain === d.key ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: 'var(--sos-text)', fontSize: 13, fontWeight: selectedDomain === d.key ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                        <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{d.icon}</span>
                        {d.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {careerGoals.map((goal) => (
                  <button key={goal.key} onClick={() => setSelectedGoal(goal)}
                    style={{ padding: '16px', borderRadius: 14, border: `1px solid ${selectedGoal?.key === goal.key ? '#A78BFA' : 'var(--sos-border)'}`, background: selectedGoal?.key === goal.key ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: 'var(--sos-text)', fontSize: 14, fontWeight: selectedGoal?.key === goal.key ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <span style={{ display: 'block', marginBottom: 4, fontSize: 13, color: '#A78BFA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{goal.roadmapType?.replace('_', ' ')}</span>
                    {goal.label}
                  </button>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Date (optional)</label>
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sos-border)', borderRadius: 10, padding: '10px 14px', color: 'var(--sos-text)', fontSize: 14, outline: 'none' }} />
              </div>
            </div>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && (
            <div style={{ display: 'grid', gap: 24 }}>
              {skills.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate Your Current Skills</label>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {skills.slice(0, 8).map((skill) => (
                      <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--sos-border)' }}>
                        <span style={{ flex: 1, color: 'var(--sos-text)', fontSize: 14 }}>{skill.label}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {['beginner', 'intermediate', 'advanced'].map((level) => (
                            <button key={level} onClick={() => setSkillRatings({ ...skillRatings, [skill.key]: level })}
                              style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${skillRatings[skill.key] === level ? '#A78BFA' : 'var(--sos-border)'}`, background: skillRatings[skill.key] === level ? 'rgba(167,139,250,0.2)' : 'transparent', color: skillRatings[skill.key] === level ? '#A78BFA' : 'var(--sos-text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learning Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {LEARNING_STYLES.map((ls) => (
                    <button key={ls.key} onClick={() => setLearningStyle(ls.key)}
                      style={{ padding: '14px', borderRadius: 14, border: `1px solid ${learningStyle === ls.key ? '#A78BFA' : 'var(--sos-border)'}`, background: learningStyle === ls.key ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: 'var(--sos-text)', fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>{ls.emoji}</span>
                      <strong style={{ display: 'block', marginBottom: 2 }}>{ls.label}</strong>
                      <span style={{ fontSize: 11, color: 'var(--sos-text-muted)' }}>{ls.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--sos-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Clock size={13} />
                  Available Study Time: <strong style={{ color: '#A78BFA' }}>{studyHours} hours/day</strong>
                </label>
                <input type="range" min="0.5" max="12" step="0.5" value={studyHours} onChange={(e) => setStudyHours(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#A78BFA' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--sos-text-muted)', marginTop: 4 }}>
                  <span>30 min</span><span>12 hours</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            <button onClick={() => { setError(''); setStep(Math.max(1, step - 1)); }} disabled={step === 1 || saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: '1px solid var(--sos-border)', background: 'transparent', color: step === 1 ? 'var(--sos-text-muted)' : 'var(--sos-text)', cursor: step === 1 ? 'default' : 'pointer', fontSize: 14, opacity: step === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={goNext} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: 'white', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {step === 4 ? (saving ? 'Generating...' : '✨ Generate My Roadmap') : (saving ? 'Saving...' : 'Continue')}
              {step !== 4 && !saving && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
