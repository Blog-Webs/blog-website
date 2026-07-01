import { useEffect, useState } from 'react';
import { Calendar, Clock, ExternalLink, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { studentOSApi } from '../api';

const EVENT_TYPE_COLOR = {
  exam: '#F87171',
  class: 'var(--accent)',
  deadline: '#FFB454',
  meeting: '#A78BFA',
  lab: '#5EEAD4',
  event: 'var(--text-muted)',
};

const EVENT_TYPE_LABEL = {
  exam: 'EXAM', class: 'CLASS', deadline: 'DEADLINE',
  meeting: 'MEETING', lab: 'LAB', event: 'EVENT',
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const Skeleton = () => (
  <div className="space-y-3">{[...Array(5)].map((_, i) => (
    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
  ))}</div>
);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week'); // 'today' | 'week' | 'month'
  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => {
    studentOSApi.getEvents(30)
      .then(({ data }) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  }, []);

  const filterEvents = () => {
    const now = new Date();
    if (view === 'today') {
      return events.filter((e) => new Date(e.start).toDateString() === now.toDateString());
    }
    if (view === 'week') {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return events.filter((e) => {
        const d = new Date(e.start);
        return d >= now && d <= weekEnd;
      });
    }
    return events; // month = all 30 days
  };

  const filtered = filterEvents();
  const monthEventsMap = {};
  events.forEach((e) => {
    const d = new Date(e.start).getDate();
    if (!monthEventsMap[d]) monthEventsMap[d] = [];
    monthEventsMap[d].push(e);
  });

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// google.calendar</p>
        <h1 className="text-2xl font-bold">Calendar</h1>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-xl border w-fit" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        {['today', 'week', 'month'].map((v) => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize btn-press transition-all"
            style={{
              backgroundColor: view === v ? 'var(--accent)' : 'transparent',
              color: view === v ? 'var(--bg)' : 'var(--text-muted)',
            }}>
            {v}
          </button>
        ))}
      </div>

      {/* Month calendar grid */}
      {view === 'month' && (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="p-1 btn-press">
              <ChevronLeft size={18} />
            </button>
            <p className="font-semibold">
              {calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="p-1 btn-press">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium py-2"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="h-14 border-b border-r" style={{ borderColor: 'var(--border)' }} />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const dayEvents = monthEventsMap[day] || [];
              return (
                <div key={day}
                  className="h-14 p-1 border-b border-r relative"
                  style={{ borderColor: 'var(--border)', backgroundColor: isToday ? 'var(--accent-soft)' : 'transparent' }}>
                  <span className="text-xs font-medium" style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}>{day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev, ei) => (
                      <div key={ei} className="text-[9px] truncate px-1 rounded"
                        style={{ backgroundColor: (EVENT_TYPE_COLOR[ev.type] || 'var(--accent)') + '30', color: EVENT_TYPE_COLOR[ev.type] || 'var(--accent)' }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>+{dayEvents.length - 2}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event list */}
      {view !== 'month' && (
        loading ? <Skeleton /> : (
          <div className="space-y-3">
            {filtered.length === 0
              ? <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No events {view === 'today' ? 'today' : 'this week'}
                </p>
              : filtered.map((ev) => {
                const color = EVENT_TYPE_COLOR[ev.type] || 'var(--text-muted)';
                const label = EVENT_TYPE_LABEL[ev.type] || 'EVENT';
                return (
                  <div key={ev.id} className="flex items-start gap-4 p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: color, borderLeftWidth: 3 }}>
                    <div className="shrink-0 text-center w-12">
                      <p className="text-lg font-bold font-mono-display"
                        style={{ color }}>{new Date(ev.start).getDate()}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {new Date(ev.start).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{ev.title}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: color + '20', color }}>{label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {ev.allDay ? 'All day' : new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {!ev.allDay && ` – ${new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ev.meetLink && (
                        <a href={ev.meetLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-press"
                          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                          <Video size={11} /> Join
                        </a>
                      )}
                      {ev.htmlLink && (
                        <a href={ev.htmlLink} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )
      )}
    </div>
  );
};

export default CalendarPage;
