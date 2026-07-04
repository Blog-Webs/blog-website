import { useEffect, useState } from 'react';
import { Bug, LifeBuoy, Star, Mail } from 'lucide-react';
import { contactApi } from '../../core/api/contact';
import { ListSkeleton } from '../../core/components/ui/Skeleton';

const TYPE_META = {
  bug: { label: 'Bug report', icon: Bug, color: '#F87171' },
  support: { label: 'Support', icon: LifeBuoy, color: '#FFB454' },
  review: { label: 'Review', icon: Star, color: '#A78BFA' },
};

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'bug', label: 'Bugs' },
  { key: 'support', label: 'Support' },
  { key: 'review', label: 'Reviews' },
];

const ContactSubmissions = () => {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (type) => {
    setLoading(true);
    contactApi.getAll(type || undefined).then(({ data }) => setContacts(data.contacts)).finally(() => setLoading(false));
  };

  useEffect(() => load(filter), [filter]);

  const handleMarkRead = async (id) => {
    await contactApi.markAsRead(id);
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isRead: true } : c)));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 glow-title">Contact Submissions</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Bug reports, support requests, and reviews from the Help widget.</p>

      <div className="flex gap-2 mb-6">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium border btn-press"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: filter === key ? 'var(--accent-soft)' : 'transparent',
              color: filter === key ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : contacts.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map((c) => {
            const meta = TYPE_META[c.type];
            const Icon = meta.icon;
            return (
              <div
                key={c._id}
                className="p-4 rounded-xl border card-hover"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  opacity: c.isRead ? 0.7 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={15} style={{ color: meta.color }} />
                    <span className="text-xs font-mono-display uppercase" style={{ color: meta.color }}>{meta.label}</span>
                    {!c.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={11} /> {c.email}
                  </span>
                </div>

                {c.type === 'review' ? (
                  <div className="text-sm">
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role: {c.role}</p>
                    <p>{c.review}</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="font-medium mb-1">{c.subject}</p>
                    <p style={{ color: 'var(--text-muted)' }}>{c.message}</p>
                  </div>
                )}

                {!c.isRead && (
                  <button
                    onClick={() => handleMarkRead(c._id)}
                    className="mt-3 text-xs px-3 py-1.5 rounded-lg border btn-press"
                    style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
