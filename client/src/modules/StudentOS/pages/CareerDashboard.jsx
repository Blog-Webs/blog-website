import { useEffect, useState } from 'react';
import { TrendingUp, Flame, Clock, Award, Target, Trophy, Sparkles, BookOpen, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { roadmapApi } from '../api/roadmapApi';
import { useRoadmap } from '../context/RoadmapContext';
import { Link } from 'react-router-dom';

export default function CareerDashboard() {
  const { profile } = useRoadmap();
  const [data, setData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      roadmapApi.getProgress(),
      roadmapApi.getLeaderboard(),
    ]).then(([p, l]) => {
      setData(p.data);
      setLeaderboardData(l.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#A78BFA" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const stats = data?.stats || {};
  const roadmap = data?.roadmap;
  const leaderboard = leaderboardData?.leaderboard || [];

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.05))', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 20, padding: '24px 28px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(167,139,250,0.2)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              <Sparkles size={12} /> {data?.profile?.domain || 'Academic'} Career Center
            </div>
            <h1 style={{ color: 'var(--sos-text)', fontWeight: 800, fontSize: 24, margin: '0 0 4px' }}>
              Target Goal: {data?.profile?.careerGoal || 'Career Path'}
            </h1>
            <p style={{ color: 'var(--sos-text-muted)', fontSize: 14, margin: 0 }}>
              Track your academic streak, domain skill progression, and competitive rank.
            </p>
          </div>
          <Link to="/student-os/roadmap" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            View Active Roadmap <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Current Streak', value: `${stats.streak || 0} Days`, icon: Flame, color: '#FF7B00', bg: 'rgba(255,123,0,0.1)' },
          { label: 'Total Study Time', value: `${stats.totalStudyHours || 0} Hours`, icon: Clock, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
          { label: 'Roadmap Completion', value: `${stats.completionPercent || 0}%`, icon: Target, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
          { label: 'Domain Rank', value: leaderboardData?.userRank ? `#${leaderboardData.userRank}` : 'Top 10%', icon: Trophy, color: '#FFB454', bg: 'rgba(255,180,84,0.1)' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <card.icon size={22} color={card.color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--sos-text)', lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'var(--sos-text-muted)', marginTop: 2 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Left Column: Weak & Strong Areas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Weak Areas Card */}
          <div style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#F87171" />
                <h2 style={{ color: 'var(--sos-text)', fontSize: 16, fontWeight: 700, margin: 0 }}>Priority Focus Areas</h2>
              </div>
              <Link to="/student-os/weak-areas" style={{ fontSize: 12, color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Explore Resources →</Link>
            </div>
            {data?.weakAreas?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.weakAreas.map((item, idx) => (
                  <span key={idx} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    {item.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--sos-text-muted)', fontSize: 13, margin: 0 }}>No critical weak areas identified yet! Keep completing assessments.</p>
            )}
          </div>

          {/* Strong Areas Card */}
          <div style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Award size={18} color="#34D399" />
              <h2 style={{ color: 'var(--sos-text)', fontSize: 16, fontWeight: 700, margin: 0 }}>Mastered Skills</h2>
            </div>
            {data?.strongAreas?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.strongAreas.map((item, idx) => (
                  <span key={idx} style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    ✓ {item.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--sos-text-muted)', fontSize: 13, margin: 0 }}>Score above 80% on skill assessments to mark them as mastered!</p>
            )}
          </div>
        </div>

        {/* Right Column: Peer Leaderboard */}
        <div style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Trophy size={18} color="#FFB454" />
            <h2 style={{ color: 'var(--sos-text)', fontSize: 16, fontWeight: 700, margin: 0 }}>
              {leaderboardData?.domain || 'Domain'} Peer Comparison
            </h2>
          </div>
          <p style={{ color: 'var(--sos-text-muted)', fontSize: 12, margin: '0 0 16px' }}>Anonymized roadmap completion comparison among peers in your educational background.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.map((student) => (
              <div key={student.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: student.isCurrentUser ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${student.isCurrentUser ? '#A78BFA' : 'var(--sos-border)'}`, borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: student.rank <= 3 ? '#FFB454' : 'var(--sos-text-muted)', width: 20 }}>#{student.rank}</span>
                  <span style={{ fontSize: 13, fontWeight: student.isCurrentUser ? 700 : 500, color: student.isCurrentUser ? '#A78BFA' : 'var(--sos-text)' }}>
                    {student.label} {student.isCurrentUser && ' (You)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${student.completionPercent}%`, background: student.isCurrentUser ? '#A78BFA' : '#34D399', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sos-text)', width: 34, textAlign: 'right' }}>{student.completionPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
