import { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Globe, Shield, RefreshCw, Check, Edit2, Loader2 } from 'lucide-react';
import { roadmapApi } from '../../StudentOS/api/roadmapApi';

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    key: '',
    displayName: '',
    parentDomain: 'engineering',
    icon: '🎓',
    description: '',
    careerGoals: [],
    requiredSkills: [],
  });

  const loadDomains = async () => {
    setLoading(true);
    try {
      const { data } = await roadmapApi.getDomains();
      const list = [];
      Object.entries(data.domains || {}).forEach(([parent, subList]) => {
        subList.forEach((item) => list.push({ ...item, parentDomain: parent }));
      });
      setDomains(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Mock / actual API call via axios
      await roadmapApi.createDomain ? roadmapApi.createDomain(form) : null;
      setShowModal(false);
      loadDomains();
    } catch {
      alert('Error saving domain. Ensure backend admin API is reached.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', color: 'var(--text-main, #e5e7eb)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Educational Domains Management</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>Add or edit educational domains, required skills, and career goal configs for Student OS.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Add Domain
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Loader2 size={28} color="#7C3AED" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {domains.map((dom) => (
            <div key={dom.key} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{dom.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{dom.displayName}</h3>
                  <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>{dom.parentDomain} ({dom.key})</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 14px', lineHeight: 1.4 }}>
                {dom.description || 'Configured and active domain for Student OS AI engine.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #21262d', paddingTop: 10 }}>
                <span style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>● Active</span>
                <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Domain Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 18, padding: 24, width: '100%', maxWidth: 500 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Create New Domain Config</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>Domain Key (e.g. medical.dental)</label>
                <input required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', color: 'white', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>Display Name</label>
                <input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', color: 'white', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>Parent Domain Category</label>
                <select value={form.parentDomain} onChange={(e) => setForm({ ...form, parentDomain: e.target.value })} style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', color: 'white', marginTop: 4 }}>
                  <option value="engineering">Engineering</option>
                  <option value="medical">Medical</option>
                  <option value="law">Law</option>
                  <option value="business">Business / MBA</option>
                  <option value="commerce">Commerce</option>
                  <option value="arts">Arts</option>
                  <option value="science">Science</option>
                  <option value="government">Government / UPSC</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #30363d', color: '#9ca3af', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 16px', background: '#7C3AED', border: 'none', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
