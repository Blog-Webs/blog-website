import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { adminApi } from '../../api/admin';
import { ListSkeleton } from '../../components/ui/Skeleton';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSubscribers().then(({ data }) => setSubscribers(data.subscribers)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 glow-title">Newsletter Subscribers</h1>
      <p className="mb-8" style={{ color: 'var(--text-muted)' }}>{subscribers.length} active subscribers.</p>

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {subscribers.map((s, i) => (
            <div
              key={s._id}
              className="flex items-center justify-between px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--surface)',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span>{s.email}</span>
              <span style={{ color: 'var(--text-muted)' }}>{new Date(s.subscribedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscribers;
