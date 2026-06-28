import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Layers } from 'lucide-react';
import { seriesApi } from '../../api/series';

const emptyForm = { title: '', description: '', coverImage: '' };

const AdminSeriesList = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | series object
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    seriesApi.getAll().then(({ data }) => setSeries(data.series)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };

  const openEdit = (s) => {
    setForm({ title: s.title, description: s.description || '', coverImage: s.coverImage || '' });
    setEditing(s);
  };

  const close = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Title is required.');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        await seriesApi.create(form);
      } else {
        await seriesApi.update(editing._id, form);
      }
      close();
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save series.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this series? Posts inside it stay published, just ungrouped.')) return;
    await seriesApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Blog Series</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Group related posts into an ordered playlist readers can follow start to finish.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 btn-press"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
        >
          <Plus size={16} /> New series
        </button>
      </div>

      {editing && (
        <div className="mb-8 p-5 rounded-xl border flex flex-col gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editing === 'new' ? 'New series' : 'Edit series'}</p>
            <button onClick={close} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Series title (e.g. System Design Series)"
            className="px-3.5 py-2.5 rounded-lg border text-sm outline-none input-focus"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            rows={2}
            className="px-3.5 py-2.5 rounded-lg border text-sm outline-none input-focus"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              {editing === 'new' ? 'Create series' : 'Save changes'}
            </button>
            <button onClick={close} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : series.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          No series yet. Create one, then assign posts to it from the post editor.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {series.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border card-hover"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <Layers size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.postCount} posts</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg border btn-press" style={{ borderColor: 'var(--border)' }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg border btn-press" style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSeriesList;
