import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FolderOpen, Mail, Calendar, AlertTriangle, Clock,
  Sparkles, FileText, Bell, TrendingUp, ExternalLink, CheckCircle2, Star
} from 'lucide-react';
import { studentOSApi } from '../api';
import { useStudentOS } from '../context/StudentOSContext';
import ConnectPage from './ConnectPage';

const PRIORITY_STYLE = {
  high: { bg: 'rgba(248,113,113,0.1)', border: '#F87171', color: '#F87171', label: 'HIGH' },
  medium: { bg: 'rgba(255,180,84,0.1)', border: '#FFB454', color: '#FFB454', label: 'MED' },
  low: { bg: 'rgba(94,234,212,0.1)', border: '#5EEAD4', color: '#5EEAD4', label: 'LOW' },
  overdue: { bg: 'rgba(248,113,113,0.15)', border: '#F87171', color: '#F87171', label: 'OVERDUE' },
};

const EVENT_TYPE_COLOR = {
  exam: '#F87171', class: 'var(--accent)', deadline: '#FFB454',
  meeting: '#A78BFA', lab: '#5EEAD4', event: 'var(--text-muted)',
};

const Skeleton = ({ h = '16', w = 'full' }) => (
  <div className={`h-${h} w-${w} rounded-lg animate-pulse`} style={{ backgroundColor: 'var(--surface-raised)' }} />
);

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to || '#'} className="p-5 rounded-2xl border card-hover flex items-center gap-4"
    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}20`, color }}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold font-mono-display">{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { connected, statusLoading } = useStudentOS();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connected) { setLoading(false); return; }
    studentOSApi.getDashboard()
      .then(({ data: d }) => { setData(d); setError(null); })
      .catch(() => setError('Failed to load dashboard. Please try again.'))
      .finally(() => setLoading(false));
  }, [connected]);

  if (statusLoading) return null;
  if (!connected) return <ConnectPage />;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// studentos.dashboard</p>
        <h1 className="text-3xl font-bold glow-title">{greeting}! 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ borderColor: 'var(--danger)', backgroundColor: 'rgba(248,113,113,0.08)', color: 'var(--danger)' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <Skeleton h="10" w="10" />
            <div className="mt-3 space-y-2"><Skeleton h="7" w="12" /><Skeleton h="3" w="20" /></div>
          </div>
        )) : (
          <>
            <StatCard icon={AlertTriangle} label="High Priority" value={data?.stats?.highPriorityCount ?? 0} color="#F87171" to="/student-os/classroom" />
            <StatCard icon={Mail} label="Unread Emails" value={data?.stats?.unreadEmailCount ?? 0} color="var(--accent)" to="/student-os/gmail" />
            <StatCard icon={FolderOpen} label="New Files" value={data?.stats?.newFilesCount ?? 0} color="#5EEAD4" to="/student-os/drive" />
            <StatCard icon={BookOpen} label="Assignments" value={data?.stats?.totalAssignments ?? 0} color="#A78BFA" to="/student-os/classroom" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-1 rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Calendar size={15} style={{ color: 'var(--accent)' }} /> Today's Schedule
          </h2>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} h="12" />)}</div>
            : (!data?.todayEvents?.length
              ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No events today</p>
              : <div className="space-y-2">
                {data.todayEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--surface-raised)' }}>
                    <div className="w-1 h-full min-h-[2rem] rounded-full shrink-0"
                      style={{ backgroundColor: EVENT_TYPE_COLOR[ev.type] || 'var(--text-muted)' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {ev.allDay ? 'All day' : new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ev.meetLink && (
                        <a href={ev.meetLink} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                          <ExternalLink size={10} /> Join Meet
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          <Link to="/student-os/calendar" className="text-xs mt-4 block" style={{ color: 'var(--accent)' }}>
            View full calendar →
          </Link>
        </div>

        {/* Upcoming assignments */}
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <BookOpen size={15} style={{ color: 'var(--accent)' }} /> Due Soon
          </h2>
          {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} h="14" />)}</div>
            : (!data?.upcomingAssignments?.length
              ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming assignments</p>
              : <div className="space-y-2">
                {data.upcomingAssignments.map((a) => {
                  const p = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.low;
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ backgroundColor: p.bg, borderColor: p.border + '44' }}>
                      <span className="text-[10px] font-bold font-mono-display px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: p.border + '22', color: p.color }}>
                        {p.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {a.dueDate
                            ? `Due ${a.daysUntilDue === 0 ? 'today' : a.daysUntilDue === 1 ? 'tomorrow' : `in ${a.daysUntilDue} days`}`
                            : 'No due date'}
                        </p>
                      </div>
                      {a.alternateLink && (
                        <a href={a.alternateLink} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          <Link to="/student-os/classroom" className="text-xs mt-4 block" style={{ color: 'var(--accent)' }}>
            View all assignments →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent announcements */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Bell size={15} style={{ color: 'var(--accent)' }} /> Teacher Announcements
          </h2>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} h="16" />)}</div>
            : (!data?.recentAnnouncements?.length
              ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No announcements</p>
              : <div className="space-y-3">
                {data.recentAnnouncements.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-raised)' }}>
                    <p className="text-sm line-clamp-2">{a.text}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {new Date(a.updateTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Recent files */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <FolderOpen size={15} style={{ color: 'var(--accent)' }} /> Recent Files
          </h2>
          {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} h="12" />)}</div>
            : (!data?.recentFiles?.length
              ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recent files</p>
              : <div className="space-y-2">
                {data.recentFiles.map((f) => (
                  <a key={f.id} href={f.webViewLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-raised)] transition-colors">
                    <span className="text-[10px] font-bold font-mono-display px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      {f.fileType}
                    </span>
                    <span className="text-sm truncate flex-1">{f.name}</span>
                    {f.isNew && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: '#5EEAD4', color: '#0f172a' }}>NEW</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          <Link to="/student-os/drive" className="text-xs mt-4 block" style={{ color: 'var(--accent)' }}>
            Browse Drive →
          </Link>
        </div>
      </div>

      {/* AI CTA */}
      <Link to="/student-os/ai"
        className="block p-6 rounded-2xl border card-hover"
        style={{
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(94,234,212,0.08) 100%)',
          borderColor: 'var(--accent)',
        }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <p className="font-bold">Ask AI Assistant</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              "What's due tomorrow?" · "Summarize my emails" · "Find DBMS notes"
            </p>
          </div>
          <ExternalLink size={18} className="ml-auto" style={{ color: 'var(--accent)' }} />
        </div>
      </Link>
    </div>
  );
};

export default DashboardPage;
