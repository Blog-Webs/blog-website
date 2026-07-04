import { useEffect, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Users, FileText, BookOpen, Layers, Mail } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useLiveUserCount } from '../../core/hooks/useLiveUserCount';
import { StatCardSkeleton } from '../components/AdminSkeleton';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="p-5 rounded-2xl border card-hover" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${color}1A`, color }}>
      <Icon size={18} />
    </div>
    <p className="text-2xl font-bold font-mono-display">{value}</p>
    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const liveCount = useLiveUserCount();

  useEffect(() => {
    adminApi.getStats().then(({ data }) => setStats(data));
    adminApi.getNotifications().then(({ data }) => setNotifications(data));
  }, []);

  if (!stats) return (
    <div>
      <h1 className="text-2xl font-bold mb-1 glow-title">Dashboard</h1>
      <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Loading live overview...</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 glow-title">Dashboard</h1>
      <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Live overview of HttpTechNex.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Live users now" value={liveCount} color="#5EEAD4" />
        <StatCard icon={Users} label="Registered users" value={stats.totalUsers} color="#FFB454" />
        <StatCard icon={FileText} label="Published posts" value={stats.publishedBlogs} color="#A78BFA" />
        <StatCard icon={FileText} label="Draft posts" value={stats.draftBlogs} color="#F87171" />
        <StatCard icon={BookOpen} label="Subjects" value={stats.totalSubjects} color="#5EEAD4" />
        <StatCard icon={Layers} label="Topics" value={stats.totalTopics} color="#FFB454" />
        <StatCard icon={BookOpen} label="Chapters" value={stats.totalChapters} color="#A78BFA" />
        <StatCard icon={Mail} label="Newsletter subs" value={stats.totalSubscribers} color="#F87171" />
            </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell size={20} className="text-primary" /> Recent Activity & Notifications
        </h2>
        
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No recent activity.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {notifications.map(notif => (
                <div key={notif._id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${notif.read ? 'opacity-60' : 'bg-primary/5'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {notif.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{notif.message}</p>
                  </div>
                  
                  {!notif.read && (
                    <button 
                      onClick={async () => {
                        await adminApi.markNotificationRead(notif._id);
                        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
                      }}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-green-500"
                      title="Mark as read"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
