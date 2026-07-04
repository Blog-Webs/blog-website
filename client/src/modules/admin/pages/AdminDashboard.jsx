import { useEffect, useState } from 'react';
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
  const liveCount = useLiveUserCount();

  useEffect(() => {
    adminApi.getStats().then(({ data }) => setStats(data));
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
    </div>
  );
};

export default AdminDashboard;
