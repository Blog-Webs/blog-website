import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FolderOpen, Mail, Calendar, AlertTriangle,
  Sparkles, Bell, ExternalLink, CheckCircle2, ArrowRight
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

const StatCard = ({ icon: Icon, label, value, color, to, delay = 0 }) => (
  <Link 
    to={to || '#'} 
    className="p-6 rounded-2xl border card-hover flex items-center gap-5 glass-panel relative overflow-hidden group fade-up visible"
    style={{ transitionDelay: `${delay}ms` }}
  >
    {/* Subtle gradient glow behind the icon */}
    <div className="absolute -inset-10 opacity-20 group-hover:opacity-40 blur-2xl transition-opacity duration-500" style={{ backgroundColor: color, zIndex: -1 }} />
    
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30`, color }}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-3xl font-bold font-mono-display leading-none mb-1 text-white">{value}</p>
      <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── AI Assistant Search Bar (Top Hero) ── */}
      <Link 
        to="/student-os/ai"
        className="block relative rounded-3xl border border-[rgba(255,255,255,0.1)] overflow-hidden card-hover group"
        style={{ background: 'linear-gradient(135deg, rgba(13,17,23,0.8) 0%, rgba(20,25,35,0.9) 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(94,234,212,0.03)] to-[rgba(62,126,198,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="p-6 sm:p-8 flex items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative image-glow"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
              <Sparkles size={24} color="white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold sparkle-text mb-1">Ask AI Assistant</h2>
              <p className="text-sm sm:text-base opacity-70">
                <span className="font-mono-display text-xs opacity-50 mr-2">/prompt</span>
                "Summarize my unread emails and find my DBMS notes"
              </p>
            </div>
          </div>
          <div className="hidden sm:flex w-10 h-10 rounded-full border items-center justify-center border-[rgba(255,255,255,0.1)] group-hover:bg-white/5 transition-colors">
            <ArrowRight size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 fade-up visible">
        <div>
          <p className="text-xs font-mono-display uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>// Overview</p>
          <h1 className="text-4xl font-bold glow-title">{greeting}!</h1>
        </div>
        <p className="font-mono-display text-sm px-4 py-2 rounded-xl glass-panel text-[var(--text-muted)]">
          {now.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ borderColor: 'var(--danger)', backgroundColor: 'rgba(248,113,113,0.08)', color: 'var(--danger)' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl glass-panel">
            <Skeleton h="12" w="12" />
            <div className="mt-4 space-y-2"><Skeleton h="8" w="16" /><Skeleton h="3" w="24" /></div>
          </div>
        )) : (
          <>
            <StatCard icon={AlertTriangle} label="High Priority" value={data?.stats?.highPriorityCount ?? 0} color="#F87171" to="/student-os/classroom" delay={100} />
            <StatCard icon={Mail} label="Unread Emails" value={data?.stats?.unreadEmailCount ?? 0} color="var(--accent)" to="/student-os/gmail" delay={200} />
            <StatCard icon={FolderOpen} label="New Files" value={data?.stats?.newFilesCount ?? 0} color="#5EEAD4" to="/student-os/drive" delay={300} />
            <StatCard icon={BookOpen} label="Assignments" value={data?.stats?.totalAssignments ?? 0} color="#A78BFA" to="/student-os/classroom" delay={400} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline (Today's Schedule) */}
        <div className="lg:col-span-1 rounded-3xl p-6 glass-panel fade-up visible relative overflow-hidden" style={{ transitionDelay: '200ms' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.03] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={18} style={{ color: 'var(--accent)' }} /> Today's Timeline
            </h2>
          </div>
          
          {loading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h="16" />)}</div>
            : (!data?.todayEvents?.length
              ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <CheckCircle2 size={32} className="mb-3" />
                  <p className="text-sm">Your schedule is clear</p>
                </div>
              )
              : <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-[var(--border)]">
                {data.todayEvents.map((ev) => (
                  <div key={ev.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-[#0D1117] z-10"
                      style={{ backgroundColor: EVENT_TYPE_COLOR[ev.type] || 'var(--accent)' }} />
                    
                    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                      <p className="text-sm font-semibold mb-1 leading-snug">{ev.title}</p>
                      <p className="text-xs font-mono-display opacity-70">
                        {ev.allDay ? 'All day' : new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ev.meetLink && (
                        <a href={ev.meetLink} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs mt-3 px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                          <ExternalLink size={12} /> Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Assignments & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Due Soon */}
          <div className="rounded-3xl p-6 glass-panel fade-up visible relative overflow-hidden" style={{ transitionDelay: '300ms' }}>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A78BFA] opacity-[0.03] blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <BookOpen size={18} style={{ color: '#A78BFA' }} /> Action Required
              </h2>
              <Link to="/student-os/classroom" className="text-xs font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                View all →
              </Link>
            </div>

            {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} h="16" />)}</div>
              : (!data?.upcomingAssignments?.length
                ? <p className="text-sm opacity-60">No upcoming assignments</p>
                : <div className="space-y-3">
                  {data.upcomingAssignments.map((a) => {
                    const p = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.low;
                    return (
                      <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:-translate-y-0.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: p.color, backgroundColor: p.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-white">{a.title}</p>
                          <p className="text-xs mt-1 flex items-center gap-2 opacity-70">
                            <span className="font-mono-display">
                              {a.dueDate ? `Due ${a.daysUntilDue === 0 ? 'Today' : a.daysUntilDue === 1 ? 'Tomorrow' : `in ${a.daysUntilDue} days`}` : 'No due date'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            <span style={{ color: p.color }}>{p.label} PRIORITY</span>
                          </p>
                        </div>
                        {a.alternateLink && (
                          <a href={a.alternateLink} target="_blank" rel="noreferrer"
                            className="p-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] hover:bg-white/10 transition-colors shrink-0">
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {/* Dual columns for Files & Announcements */}
          <div className="grid sm:grid-cols-2 gap-6 fade-up visible" style={{ transitionDelay: '400ms' }}>
            
            {/* Announcements */}
            <div className="rounded-3xl p-6 glass-panel">
              <h2 className="font-bold text-base flex items-center gap-2 mb-5">
                <Bell size={16} style={{ color: '#FFB454' }} /> Bulletins
              </h2>
              {loading ? <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} h="20" />)}</div>
                : (!data?.recentAnnouncements?.length
                  ? <p className="text-sm opacity-60">No recent announcements</p>
                  : <div className="space-y-4">
                    {data.recentAnnouncements.map((a) => (
                      <div key={a.id} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] relative">
                        <p className="text-sm line-clamp-3 leading-relaxed opacity-90">{a.text}</p>
                        <p className="text-[10px] font-mono-display uppercase tracking-wider mt-3 opacity-50">
                          {new Date(a.updateTime).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Recent Files */}
            <div className="rounded-3xl p-6 glass-panel">
              <h2 className="font-bold text-base flex items-center gap-2 mb-5">
                <FolderOpen size={16} style={{ color: '#5EEAD4' }} /> Recent Drive Files
              </h2>
              {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} h="12" />)}</div>
                : (!data?.recentFiles?.length
                  ? <p className="text-sm opacity-60">No recent files</p>
                  : <div className="space-y-2">
                    {data.recentFiles.map((f) => (
                      <a key={f.id} href={f.webViewLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors group">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold font-mono-display text-[9px]"
                          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                          {f.fileType.substring(0,3).toUpperCase()}
                        </span>
                        <span className="text-sm truncate flex-1 font-medium group-hover:text-white transition-colors">{f.name}</span>
                        {f.isNew && (
                          <span className="w-2 h-2 rounded-full bg-[#5EEAD4]" />
                        )}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
