import { useEffect, useState } from 'react';
import { Calendar, Clock, ExternalLink, Video, ChevronLeft, ChevronRight, Search, Bell, Settings, Plus } from 'lucide-react';
import { studentOSApi } from '../api';

const EVENT_STYLE = {
  exam: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'EXAM' },
  class: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'CLASS' },
  deadline: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: 'DEADLINE' },
  meeting: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'MEETING' },
  lab: { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', label: 'LAB' },
  event: { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', label: 'EVENT' },
  personal: { border: '#3b82f6', bg: '#1e293b', text: '#60a5fa', label: 'PERSONAL' },
  school: { border: '#8b5cf6', bg: '#2e1065', text: '#a78bfa', label: 'SCHOOL' },
  ai: { border: '#06b6d4', bg: '#083344', text: '#22d3ee', label: 'AI AGENT' }
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const Skeleton = () => (
  <div className="space-y-4">{[...Array(5)].map((_, i) => (
    <div key={i} className="h-20 rounded-2xl animate-pulse bg-[#161b22] border border-[#30363d]" />
  ))}</div>
);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // 'today' | 'week' | 'month'
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

  // Helper to map event type to our new styling, defaulting nicely if not found
  const getEventStyle = (type, title) => {
    const t = type?.toLowerCase() || '';
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('birthday') || titleLower.includes('personal')) return EVENT_STYLE.personal;
    if (titleLower.includes('lab') || titleLower.includes('school')) return EVENT_STYLE.school;
    if (titleLower.includes('focus') || titleLower.includes('ai')) return EVENT_STYLE.ai;
    return EVENT_STYLE[t] || EVENT_STYLE.event;
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0d1117] text-white font-sans relative">
      
      {/* Top Search Bar / Global Nav Area */}
      <div className="flex items-center justify-between px-10 py-6 border-b border-[#161b22]">
        <div className="flex-1" />
        <div className="flex-1 max-w-xl">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 flex items-center gap-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
            <Search size={18} className="text-gray-500" />
            <input 
              placeholder="Search calendar..." 
              className="bg-transparent border-none outline-none text-sm w-full text-gray-300 placeholder-gray-600" 
            />
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center gap-6 text-gray-400">
          <button className="hover:text-white transition-colors"><Bell size={20} /></button>
          <button className="hover:text-white transition-colors"><Settings size={20} /></button>
        </div>
      </div>

      <div className="p-10 max-w-[1400px] mx-auto w-full space-y-8 flex-1 pb-24">
        {/* Header Section */}
        <div className="space-y-1">
          <p className="text-sm font-mono text-gray-500">// google.calendar</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Calendar</h1>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* View toggle */}
          <div className="flex p-1 rounded-xl border border-[#30363d] bg-[#161b22] w-fit shadow-sm">
            {['today', 'week', 'month'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  view === v 
                    ? 'bg-[#30363d] text-white shadow' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}>
                {v}
              </button>
            ))}
          </div>

          {/* Date Navigator */}
          <div className="flex items-center rounded-xl border border-[#30363d] bg-[#161b22] shadow-sm">
            <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="p-3 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft size={16} strokeWidth={3} />
            </button>
            <p className="font-semibold text-sm w-32 text-center text-gray-100">
              {calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="p-3 text-gray-400 hover:text-white transition-colors">
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Month calendar grid */}
        {view === 'month' && (
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-lg">
            <div className="grid grid-cols-7 text-center text-xs font-bold py-4 border-b border-[#30363d] bg-[#0d1117]/50 text-gray-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-[#30363d] -ml-[1px] -mt-[1px]">
              {/* Previous month empty days */}
              {[...Array(firstDay)].map((_, i) => {
                const prevDays = getDaysInMonth(year, month - 1);
                return (
                  <div key={`empty-${i}`} className="min-h-[140px] border-b border-r border-[#30363d] p-3 opacity-50 bg-[#0d1117]/30">
                    <span className="text-sm font-semibold text-gray-600">{prevDays - firstDay + i + 1}</span>
                  </div>
                );
              })}
              
              {/* Current month days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const dayEvents = monthEventsMap[day] || [];
                return (
                  <div key={day}
                    className="min-h-[140px] p-3 border-b border-r border-[#30363d] relative transition-colors hover:bg-[#21262d]/50">
                    <div className="flex justify-start mb-2">
                      <span className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full ${
                        isToday ? 'bg-blue-300 text-blue-900 shadow-[0_0_15px_rgba(147,197,253,0.5)]' : 'text-gray-300'
                      }`}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.slice(0, 3).map((ev, ei) => {
                        const style = getEventStyle(ev.type, ev.title);
                        return (
                          <div key={ei} className="px-2 py-1.5 rounded flex flex-col text-left border-l-[3px] shadow-sm"
                            style={{ backgroundColor: style.bg, borderLeftColor: style.border }}>
                            <span className="text-[8px] font-bold tracking-wider uppercase mb-0.5" style={{ color: style.text }}>
                              {style.label}
                            </span>
                            <span className="text-xs text-gray-200 font-medium truncate leading-tight">
                              {ev.title}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] font-semibold text-gray-500 pl-1 mt-1">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Next month empty days to complete the grid */}
              {[...Array((7 - ((firstDay + daysInMonth) % 7)) % 7)].map((_, i) => (
                <div key={`next-empty-${i}`} className="min-h-[140px] border-b border-r border-[#30363d] p-3 opacity-50 bg-[#0d1117]/30">
                  <span className="text-sm font-semibold text-gray-600">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List Views (Today / Week) */}
        {view !== 'month' && (
          loading ? <Skeleton /> : (
            <div className="space-y-4">
              {filtered.length === 0
                ? (
                  <div className="py-20 text-center flex flex-col items-center opacity-70">
                    <div className="w-16 h-16 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-6">
                      <Calendar size={28} className="text-gray-500" />
                    </div>
                    <p className="text-lg italic text-gray-500">
                      No events {view === 'today' ? 'today' : 'this week'}
                    </p>
                  </div>
                )
                : filtered.map((ev) => {
                  const style = getEventStyle(ev.type, ev.title);
                  return (
                    <div key={ev.id} className="flex items-start gap-5 p-5 rounded-2xl border border-[#30363d] bg-[#161b22] border-l-4 shadow-sm hover:border-gray-500 transition-colors"
                      style={{ borderLeftColor: style.border }}>
                      <div className="shrink-0 text-center w-14 bg-[#0d1117] py-2 rounded-xl border border-[#30363d]">
                        <p className="text-xl font-bold tracking-tight" style={{ color: style.text }}>
                          {new Date(ev.start).getDate()}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">
                          {new Date(ev.start).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <p className="text-base font-bold text-gray-100 truncate">{ev.title}</p>
                          <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase"
                            style={{ backgroundColor: style.bg, color: style.text }}>{style.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {ev.allDay ? 'All day' : new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {!ev.allDay && ` – ${new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          {ev.location && <span className="flex items-center gap-1.5">📍 {ev.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {ev.meetLink && (
                          <a href={ev.meetLink} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                            <Video size={14} /> Join Call
                          </a>
                        )}
                        {ev.htmlLink && (
                          <a href={ev.htmlLink} target="_blank" rel="noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors">
                            <ExternalLink size={16} />
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

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center shadow-[0_0_30px_rgba(191,219,254,0.3)] hover:shadow-[0_0_40px_rgba(191,219,254,0.5)] hover:bg-blue-300 transition-all hover:scale-105 active:scale-95 group z-50">
        <Plus size={28} className="text-blue-900 group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
};

export default CalendarPage;
