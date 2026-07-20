import { useEffect, useState } from 'react';
import { AlertTriangle, BookOpen, ExternalLink, Loader2, Sparkles, Star, CheckCircle } from 'lucide-react';
import { roadmapApi } from '../api/roadmapApi';
import { useRoadmap } from '../context/RoadmapContext';

export default function WeakAreasPage() {
  const { profile } = useRoadmap();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roadmapApi.getRecommendations()
      .then(({ data }) => setData(data.recommendations || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#A78BFA" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const topPicks = data?.topPicks || [];
  const byWeakArea = data?.byWeakArea || {};

  return (
    <div style={{ padding: '24px', maxWidth: 880, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={22} color="#F87171" />
        </div>
        <div>
          <h1 style={{ color: 'var(--sos-text)', fontWeight: 800, fontSize: 22, margin: 0 }}>Weak Areas & AI Resources</h1>
          <p style={{ color: 'var(--sos-text-muted)', fontSize: 13, margin: 0 }}>Targeted learning resources matched to your identified skill gaps and learning style.</p>
        </div>
      </div>

      {/* Top Recommendations */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="#A78BFA" />
          <h2 style={{ color: 'var(--sos-text)', fontSize: 18, fontWeight: 700, margin: 0 }}>Top Recommended for You</h2>
        </div>

        {topPicks.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {topPicks.map((res) => (
              <div key={res._id} style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(167,139,250,0.15)', color: '#A78BFA', textTransform: 'uppercase' }}>
                      {res.type}
                    </span>
                    {res.isVerified && (
                      <span style={{ fontSize: 11, color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <h3 style={{ color: 'var(--sos-text)', fontSize: 15, fontWeight: 600, margin: '0 0 6px', lineHeight: 1.4 }}>{res.title}</h3>
                  <p style={{ color: 'var(--sos-text-muted)', fontSize: 12, margin: '0 0 14px', lineHeight: 1.5 }}>
                    {res.description || `High quality ${res.type} resource for ${res.skill}.`}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--sos-text-muted)' }}>{res.platform || 'Curated'}</span>
                  {res.url ? (
                    <a href={res.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#60A5FA', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      Open Resource <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--sos-text-muted)' }}>Available in Library</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--sos-text-muted)', margin: 0 }}>No weak area recommendations yet! Take more assessments to get customized recommendations.</p>
          </div>
        )}
      </div>

      {/* Weak Areas Breakdown */}
      {Object.keys(byWeakArea).length > 0 && (
        <div>
          <h2 style={{ color: 'var(--sos-text)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Resources by Weak Skill</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(byWeakArea).map(([skill, resources]) => (
              <div key={skill} style={{ background: 'var(--sos-card)', border: '1px solid var(--sos-border)', borderRadius: 16, padding: 20 }}>
                <h3 style={{ color: '#F87171', fontSize: 15, fontWeight: 700, margin: '0 0 12px', textTransform: 'capitalize' }}>
                  Targeting: {skill.replace(/_/g, ' ')}
                </h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {resources.map((res) => (
                    <div key={res._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--sos-border)' }}>
                      <div>
                        <span style={{ color: 'var(--sos-text)', fontSize: 13, fontWeight: 600 }}>{res.title}</span>
                        <span style={{ fontSize: 11, color: 'var(--sos-text-muted)', marginLeft: 8 }}>({res.type})</span>
                      </div>
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                          Study <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
