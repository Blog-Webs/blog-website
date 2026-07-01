import { useEffect, useState } from 'react';
import { BookOpen, AlertTriangle, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { studentOSApi } from '../api';

const PRIORITY_STYLE = {
  high: { bg: 'rgba(248,113,113,0.1)', text: '#F87171', label: 'HIGH' },
  medium: { bg: 'rgba(255,180,84,0.1)', text: '#FFB454', label: 'MEDIUM' },
  low: { bg: 'rgba(94,234,212,0.08)', text: '#5EEAD4', label: 'LOW' },
  overdue: { bg: 'rgba(248,113,113,0.15)', text: '#F87171', label: 'OVERDUE' },
};

const Skeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--surface-raised)' }} />
    ))}
  </div>
);

const ClassroomPage = () => {
  const [tab, setTab] = useState('assignments');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseOpen, setCourseOpen] = useState(false);

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// google.classroom</p>
        <h1 className="text-2xl font-bold">Classroom</h1>
        <p style={{ color: 'var(--text-muted)' }}>{courses.length} active courses</p>
      </div>

      {/* Course filter */}
      <div className="relative">
        <button
          onClick={() => setCourseOpen(!courseOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm btn-press"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <BookOpen size={14} />
          {selectedCourse ? courseName(selectedCourse) : 'All Courses'}
          <ChevronDown size={14} className={`transition-transform ${courseOpen ? 'rotate-180' : ''}`} />
        </button>
        {courseOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border shadow-xl z-20 overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <button
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)] transition-colors"
              onClick={() => { setSelectedCourse(null); setCourseOpen(false); }}
            >All Courses</button>
            {courses.map((c) => (
              <button
                key={c.id}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)] transition-colors"
                onClick={() => { setSelectedCourse(c.id); setCourseOpen(false); }}
              >{c.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', width: 'fit-content' }}>
        {['assignments', 'announcements', 'courses'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize btn-press transition-all"
            style={{
              backgroundColor: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--bg)' : 'var(--text-muted)',
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading && <Skeleton />}

      {/* Assignments */}
      {!loading && tab === 'assignments' && (
        <div className="space-y-3">
          {filterByCourse(assignments).length === 0
            ? <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No assignments found</p>
            : filterByCourse(assignments).map((a) => {
              const p = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.low;
              return (
                <div key={a.id} className="p-4 rounded-2xl border"
                  style={{ backgroundColor: p.bg, borderColor: p.text + '33' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono-display mt-0.5"
                      style={{ backgroundColor: p.text + '22', color: p.text }}>
                      {p.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{a.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {courseName(a.courseId)} ·{' '}
                        {a.dueDate
                          ? `Due ${new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                          : 'No due date'}
                        {a.daysUntilDue !== null && ` (${a.daysUntilDue === 0 ? 'today' : a.daysUntilDue === 1 ? 'tomorrow' : `${a.daysUntilDue}d`})`}
                      </p>
                      {a.description && (
                        <p className="text-sm mt-1.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{a.description}</p>
                      )}
                    </div>
                    {a.alternateLink && (
                      <a href={a.alternateLink} target="_blank" rel="noreferrer"
                        className="p-2 rounded-lg btn-press shrink-0" style={{ color: 'var(--text-muted)' }}>
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Announcements */}
      {!loading && tab === 'announcements' && (
        <div className="space-y-3">
          {filterByCourse(announcements).length === 0
            ? <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No announcements</p>
            : filterByCourse(announcements).map((a) => (
              <div key={a.id} className="p-4 rounded-2xl border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}>
                  {courseName(a.courseId)} · {new Date(a.updateTime).toLocaleDateString()}
                </p>
                <p className="text-sm">{a.text}</p>
                {a.materials?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {a.materials.map((m, i) => m.driveFile && (
                      <a key={i} href={m.driveFile.alternateLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <ExternalLink size={11} /> {m.driveFile.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Courses */}
      {!loading && tab === 'courses' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl border card-hover"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <BookOpen size={18} />
              </div>
              <p className="font-semibold">{c.name}</p>
              {c.section && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.section}</p>}
              {c.alternateLink && (
                <a href={c.alternateLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs mt-3"
                  style={{ color: 'var(--accent)' }}>
                  <ExternalLink size={11} /> Open in Classroom
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassroomPage;
