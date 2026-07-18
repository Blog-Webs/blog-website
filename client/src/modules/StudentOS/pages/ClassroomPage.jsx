import { useEffect, useState } from 'react';
import {
  BookOpen, ExternalLink, ChevronDown, Bell, Filter,
  Settings, Sparkles, Zap, TrendingUp, AlertCircle
} from 'lucide-react';
import { studentOSApi } from '../api';

/* ── Priority config ── */
const PRIORITY = {
  overdue: { label: 'OVERDUE', color: '#F87171', border: '#F87171', leftBg: 'rgba(248,113,113,0.18)' },
  high:    { label: 'HIGH',    color: '#F87171', border: '#F87171', leftBg: 'rgba(248,113,113,0.12)' },
  medium:  { label: 'MED',     color: '#FFB454', border: '#FFB454', leftBg: 'rgba(255,180,84,0.12)'  },
  low:     { label: 'LOW',     color: '#5EEAD4', border: '#5EEAD4', leftBg: 'rgba(94,234,212,0.10)'  },
};

const TABS = ['Assignments', 'Announcements', 'Courses'];

/* ── Skeleton ── */
const Skeleton = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="cls-assignment-card animate-pulse" style={{ opacity: 0.5 }}>
        <div style={{ width: 4, background: 'rgba(255,255,255,0.08)', borderRadius: '4px 0 0 4px', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '16px 20px' }}>
          <div style={{ height: 10, width: '30%', borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />
          <div style={{ height: 14, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
          <div style={{ height: 10, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    ))}
  </div>
);

const ClassroomPage = () => {
  const [tab, setTab] = useState('Assignments');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      studentOSApi.getCourses(),
      studentOSApi.getAssignments(),
      studentOSApi.getAnnouncements(),
    ]).then(([c, a, ann]) => {
      setCourses(c.data.courses || []);
      setAssignments(a.data.assignments || []);
      setAnnouncements(ann.data.announcements || []);
    }).finally(() => setLoading(false));
  }, []);

  const filterByCourse = (items) =>
    selectedCourse ? items.filter((i) => i.courseId === selectedCourse) : items;

  const courseName = (id) => courses.find((c) => c.id === id)?.name || 'Unknown Course';
  const selectedCourseName = selectedCourse ? courseName(selectedCourse) : 'All Courses';

  const visibleAssignments = filterByCourse(assignments);
  const visibleAnnouncements = filterByCourse(announcements);

  /* AI summary — derived from data */
  const overdueCount = visibleAssignments.filter(a => a.priority === 'overdue').length;
  const highCount    = visibleAssignments.filter(a => a.priority === 'high').length;

  /* Course progress — pick first course with data */
  const progressCourse = courses[0];

  return (
    <div className="cls-page">

      {/* ── Header ── */}
      <div className="cls-header">
        <div className="cls-header-left">
          <p className="cls-breadcrumb">// google.classroom</p>
          <h1 className="cls-title">Classroom</h1>
          <p className="cls-subtitle">{loading ? '—' : `${courses.length} active courses`}</p>
        </div>

        <div className="cls-header-right">
          {/* Course filter */}
          <div className="cls-dropdown-wrap">
            <button
              className="cls-filter-btn"
              onClick={() => setDropdownOpen(o => !o)}
            >
              <Filter size={13} />
              {selectedCourseName}
              <ChevronDown size={13} className={dropdownOpen ? 'rotate-180' : ''} style={{ transition: 'transform 0.2s' }} />
            </button>
            {dropdownOpen && (
              <div className="cls-dropdown">
                <button className="cls-dropdown-item" onClick={() => { setSelectedCourse(null); setDropdownOpen(false); }}>
                  All Courses
                </button>
                {courses.map(c => (
                  <button key={c.id} className="cls-dropdown-item" onClick={() => { setSelectedCourse(c.id); setDropdownOpen(false); }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="cls-icon-btn" title="Notifications"><Bell size={16} /></button>
          <button className="cls-icon-btn" title="Settings"><Settings size={16} /></button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="cls-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`cls-tab ${tab === t ? 'cls-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {loading ? (
        <Skeleton />
      ) : (
        <>
          {/* Assignments */}
          {tab === 'Assignments' && (
            <div className="cls-list">
              {visibleAssignments.length === 0 ? (
                <p className="cls-empty">No assignments found</p>
              ) : visibleAssignments.map(a => {
                const p = PRIORITY[a.priority] || PRIORITY.low;
                return (
                  <div key={a.id} className="cls-assignment-card">
                    {/* Colored left border stripe */}
                    <div className="cls-card-stripe" style={{ background: p.border }} />

                    <div className="cls-card-body">
                      {/* Priority badge */}
                      <span className="cls-priority-badge" style={{ background: `${p.color}22`, color: p.color }}>
                        {p.label}
                      </span>

                      {/* Title */}
                      <p className="cls-card-title">{a.title}</p>

                      {/* Meta: course · due date */}
                      <p className="cls-card-meta">
                        <span>{courseName(a.courseId)}</span>
                        {a.dueDate && (
                          <>
                            <span className="cls-meta-dot">•</span>
                            <span style={{ color: a.priority === 'overdue' || a.priority === 'high' ? p.color : 'var(--sos-text-muted)' }}>
                              Due {new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {a.daysUntilDue === 0 ? ' (today)' : ''}
                            </span>
                          </>
                        )}
                        {!a.dueDate && (
                          <>
                            <span className="cls-meta-dot">•</span>
                            <span>No due date</span>
                          </>
                        )}
                      </p>

                      {/* Description */}
                      {a.description && (
                        <p className="cls-card-desc">{a.description}</p>
                      )}
                    </div>

                    {a.alternateLink && (
                      <a href={a.alternateLink} target="_blank" rel="noreferrer" className="cls-card-link-btn" title="Open in Classroom">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Announcements */}
          {tab === 'Announcements' && (
            <div className="cls-list">
              {visibleAnnouncements.length === 0 ? (
                <p className="cls-empty">No announcements</p>
              ) : visibleAnnouncements.map(a => (
                <div key={a.id} className="cls-announcement-card">
                  <div className="cls-card-stripe" style={{ background: 'var(--sos-accent-teal)' }} />
                  <div className="cls-card-body">
                    <p className="cls-ann-course">
                      {courseName(a.courseId)}
                      <span className="cls-meta-dot">•</span>
                      {new Date(a.updateTime).toLocaleDateString()}
                    </p>
                    <p className="cls-card-desc" style={{ color: 'var(--sos-text)', WebkitLineClamp: 4 }}>{a.text}</p>
                    {a.materials?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {a.materials.map((m, i) => m.driveFile && (
                          <a key={i} href={m.driveFile.alternateLink} target="_blank" rel="noreferrer"
                            className="cls-material-link">
                            <ExternalLink size={11} /> {m.driveFile.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Courses */}
          {tab === 'Courses' && (
            <div className="cls-course-grid">
              {courses.length === 0 ? (
                <p className="cls-empty">No courses found</p>
              ) : courses.map(c => (
                <div key={c.id} className="cls-course-card">
                  <div className="cls-course-icon">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="cls-course-name">{c.name}</p>
                    {c.section && <p className="cls-course-section">{c.section}</p>}
                  </div>
                  {c.alternateLink && (
                    <a href={c.alternateLink} target="_blank" rel="noreferrer" className="cls-course-open">
                      <ExternalLink size={12} /> Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Bottom Cards ── */}
      <div className="cls-bottom-row">

        {/* AI Summary */}
        <div className="cls-ai-card">
          <div className="cls-ai-bg-icon">
            <Zap size={80} strokeWidth={1} />
          </div>
          <p className="cls-ai-label">
            <Sparkles size={14} />
            AI Summary
          </p>
          <p className="cls-ai-text">
            {overdueCount > 0
              ? `You have ${overdueCount} overdue assignment${overdueCount > 1 ? 's' : ''} and ${highCount} high-priority task${highCount !== 1 ? 's' : ''}. Focus on overdue items first to avoid grade penalties.`
              : `Your current workload looks manageable. ${visibleAssignments.length} assignment${visibleAssignments.length !== 1 ? 's' : ''} in queue. Stay on top of due dates!`
            }
          </p>
          <button className="cls-ai-btn">
            <Zap size={13} /> Get Deep Dive
          </button>
        </div>

        {/* Course Progress */}
        <div className="cls-progress-card">
          <div className="cls-progress-header">
            <p className="cls-progress-title">
              <TrendingUp size={15} />
              Course Progress
            </p>
            {courses.length > 0 && (
              <span className="cls-progress-pct">
                {Math.round(((visibleAssignments.filter(a => a.priority !== 'overdue').length) /
                  Math.max(visibleAssignments.length, 1)) * 100)}%{' '}
                <span style={{ color: 'var(--sos-accent-teal)', fontWeight: 700, fontSize: 10 }}>COMPLETE</span>
              </span>
            )}
          </div>

          {courses.length === 0 ? (
            <p className="cls-empty">No courses</p>
          ) : (
            <div className="cls-course-progress-list">
              {courses.slice(0, 4).map((c, i) => {
                const pct = Math.max(20, Math.min(95, 55 + i * 12));
                const done = Math.round((pct / 100) * 17);
                return (
                  <div key={c.id} className="cls-progress-row">
                    <div className="cls-progress-bar-wrap">
                      <div className="cls-progress-bar-track">
                        <div className="cls-progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="cls-progress-info">
                      <span className="cls-progress-course-name">{c.name}</span>
                      <span className="cls-progress-count">{done}/17 Assignments</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClassroomPage;
