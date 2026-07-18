import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FolderOpen, AlertCircle,
  Bell, ExternalLink, CheckCircle2, ArrowRight, MoreVertical,
  Calendar, Cloud
} from 'lucide-react';
import { studentOSApi } from '../api';
import { useStudentOS } from '../context/StudentOSContext';
import ConnectPage from './ConnectPage';

const PRIORITY_STYLE = {
  high: { dot: '#F87171', label: 'HIGH' },
  medium: { dot: '#FFB454', label: 'MED' },
  low: { dot: '#5EEAD4', label: 'LOW' },
  overdue: { dot: '#F87171', label: 'OVERDUE' },
};

const FILE_TYPE_COLOR = {
  pdf: '#F87171',
  doc: '#60A5FA',
  docx: '#60A5FA',
  she: '#A78BFA',
  xls: '#34D399',
  xlsx: '#34D399',
  default: '#94A3B8',
};

const FILE_TYPE_BG = {
  pdf: 'rgba(248,113,113,0.15)',
  doc: 'rgba(96,165,250,0.15)',
  docx: 'rgba(96,165,250,0.15)',
  she: 'rgba(167,139,250,0.15)',
  xls: 'rgba(52,211,153,0.15)',
  xlsx: 'rgba(52,211,153,0.15)',
  default: 'rgba(148,163,184,0.15)',
};

const Skeleton = () => (
  <div className="h-16 w-full rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
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

  return (
    <div className="sos-dashboard">

      {/* ── Top Stat Cards Row ── */}
      <div className="sos-stat-row">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="sos-stat-card">
              <div className="animate-pulse h-20 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))
        ) : (
          <>
            <Link to="/student-os/classroom" className="sos-stat-card sos-stat-purple">
              <div className="sos-stat-icon-wrap" style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>
                <BookOpen size={20} />
              </div>
              <div className="sos-stat-num">{data?.stats?.totalAssignments ?? 6}</div>
              <div className="sos-stat-label">ASSIGNMENTS</div>
            </Link>

            <Link to="/student-os/gmail" className="sos-stat-card sos-stat-teal">
              <div className="sos-stat-icon-wrap" style={{ background: 'rgba(94,234,212,0.15)', color: '#5EEAD4' }}>
                <Bell size={20} />
              </div>
              <div className="sos-stat-num">{data?.stats?.unreadEmailCount ?? 0}</div>
              <div className="sos-stat-label">UNREAD EMAILS</div>
            </Link>

            <Link to="/student-os/classroom" className="sos-stat-card sos-stat-red">
              <div className="sos-stat-icon-wrap" style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171' }}>
                <AlertCircle size={20} />
              </div>
              <div className="sos-stat-num">{data?.stats?.highPriorityCount ?? 0}</div>
              <div className="sos-stat-label">HIGH PRIORITY</div>
            </Link>
          </>
        )}
      </div>

      {/* ── Main Grid ── */}
      <div className="sos-main-grid">

        {/* ── Today's Timeline ── */}
        <div className="sos-card sos-timeline-card">
          <div className="sos-card-header">
            <h2 className="sos-card-title">
              <Calendar size={16} className="sos-card-title-icon" />
              Today's Timeline
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3 mt-4">
              {[...Array(2)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : !data?.todayEvents?.length ? (
            <div className="sos-empty-state">
              <div className="sos-empty-icon">
                <CheckCircle2 size={28} style={{ color: 'var(--sos-text-muted)' }} />
              </div>
              <p className="sos-empty-text">Your schedule is clear</p>
              <p className="sos-empty-sub">Enjoy your free evening!</p>
            </div>
          ) : (
            <div className="sos-timeline-list">
              {data.todayEvents.map((ev) => (
                <div key={ev.id} className="sos-timeline-item">
                  <div className="sos-timeline-dot" />
                  <div className="sos-timeline-content">
                    <p className="sos-timeline-title">{ev.title}</p>
                    <p className="sos-timeline-time">
                      {ev.allDay ? 'All day' : new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {ev.meetLink && (
                      <a href={ev.meetLink} target="_blank" rel="noreferrer" className="sos-meet-link">
                        <ExternalLink size={11} /> Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="sos-right-col">

          {/* Action Required */}
          <div className="sos-card sos-action-card">
            <div className="sos-card-header">
              <h2 className="sos-card-title">
                <AlertCircle size={15} className="sos-card-title-icon-warn" />
                Action Required
              </h2>
              <Link to="/student-os/classroom" className="sos-view-all">
                VIEW ALL <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 mt-3">
                {[...Array(2)].map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : !data?.upcomingAssignments?.length ? (
              <p className="sos-empty-text mt-4">No upcoming assignments</p>
            ) : (
              <div className="sos-action-list">
                {data.upcomingAssignments.map((a) => {
                  const p = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.low;
                  return (
                    <div key={a.id} className="sos-action-item">
                      <span className="sos-action-dot" style={{ backgroundColor: p.dot }} />
                      <div className="flex-1 min-w-0">
                        <p className="sos-action-title">{a.title}</p>
                        <p className="sos-action-meta">
                          {a.dueDate
                            ? `Due ${a.daysUntilDue === 0 ? 'Today' : a.daysUntilDue === 1 ? 'Tomorrow' : `in ${a.daysUntilDue} days`}`
                            : 'No due date'} &bull;{' '}
                          <span style={{ color: p.dot }}>{p.label} PRIORITY</span>
                        </p>
                      </div>
                      {a.alternateLink && (
                        <a href={a.alternateLink} target="_blank" rel="noreferrer" className="sos-action-link">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Bottom Two Columns ── */}
          <div className="sos-bottom-grid">

            {/* Bulletins */}
            <div className="sos-card sos-bulletin-card">
              <div className="sos-card-header">
                <h2 className="sos-card-title">
                  <Bell size={15} className="sos-card-title-icon-warn" />
                  Bulletins
                </h2>
              </div>
              {loading ? (
                <div className="space-y-3 mt-3">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} />)}
                </div>
              ) : !data?.recentAnnouncements?.length ? (
                <p className="sos-empty-text mt-4">No recent announcements</p>
              ) : (
                <div className="sos-bulletin-list">
                  {data.recentAnnouncements.map((a) => (
                    <div key={a.id} className="sos-bulletin-item">
                      <p className="sos-bulletin-text">{a.text}</p>
                      <p className="sos-bulletin-date">{new Date(a.updateTime).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Drive Files */}
            <div className="sos-card sos-files-card">
              <div className="sos-card-header">
                <h2 className="sos-card-title">
                  <Cloud size={15} className="sos-card-title-icon" />
                  Recent Drive Files
                </h2>
              </div>
              {loading ? (
                <div className="space-y-3 mt-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} />)}
                </div>
              ) : !data?.recentFiles?.length ? (
                <p className="sos-empty-text mt-4">No recent files</p>
              ) : (
                <div className="sos-file-list">
                  {data.recentFiles.map((f) => {
                    const ext = f.fileType?.toLowerCase() || 'default';
                    const color = FILE_TYPE_COLOR[ext] || FILE_TYPE_COLOR.default;
                    const bg = FILE_TYPE_BG[ext] || FILE_TYPE_BG.default;
                    return (
                      <a
                        key={f.id}
                        href={f.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="sos-file-item"
                      >
                        <span className="sos-file-badge" style={{ backgroundColor: bg, color }}>
                          {ext.substring(0, 3).toUpperCase()}
                        </span>
                        <span className="sos-file-name">{f.name}</span>
                        <button
                          className="sos-file-more"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </a>
                    );
                  })}
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
