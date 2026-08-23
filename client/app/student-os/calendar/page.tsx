'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock,
  Trash2, Edit2, X, Check, Sparkles, Flag, RefreshCw, CalendarDays
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const EVENT_COLORS = [
  { label: 'Blue', value: '1', bg: '#3b82f6' },
  { label: 'Green', value: '2', bg: '#22c55e' },
  { label: 'Purple', value: '3', bg: '#a855f7' },
  { label: 'Red', value: '11', bg: '#ef4444' },
  { label: 'Orange', value: '6', bg: '#f97316' },
];

type CalEvent = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  colorId?: string;
  htmlLink?: string;
  type?: string;
  isHoliday?: boolean;
  festivalIcon?: string;
};

// National holidays and festivals mapped by Month (0-indexed) and Day
const PUBLIC_HOLIDAYS: { month: number; day: number; title: string; type: string; icon: string }[] = [
  { month: 0, day: 1, title: "New Year's Day", type: 'holiday', icon: '🎆' },
  { month: 0, day: 14, title: 'Makar Sankranti / Pongal', type: 'festival', icon: '🪁' },
  { month: 0, day: 26, title: 'Republic Day (India)', type: 'national_holiday', icon: '🇮🇳' },
  { month: 1, day: 14, title: "Valentine's Day", type: 'observance', icon: '💝' },
  { month: 1, day: 26, title: 'Maha Shivratri', type: 'festival', icon: '🔱' },
  { month: 2, day: 14, title: 'Holi (Festival of Colors)', type: 'festival', icon: '🎨' },
  { month: 2, day: 31, title: 'Eid-ul-Fitr', type: 'festival', icon: '🌙' },
  { month: 3, day: 14, title: 'Dr. Ambedkar Jayanti', type: 'national_holiday', icon: '⚖️' },
  { month: 3, day: 18, title: 'Good Friday', type: 'holiday', icon: '✝️' },
  { month: 4, day: 1, title: 'International Workers’ Day', type: 'holiday', icon: '🛠️' },
  { month: 4, day: 12, title: 'Buddha Purnima', type: 'festival', icon: '🪷' },
  { month: 5, day: 21, title: 'International Yoga Day', type: 'observance', icon: '🧘' },
  { month: 7, day: 15, title: 'Independence Day (India)', type: 'national_holiday', icon: '🇮🇳' },
  { month: 7, day: 16, title: 'Janmashtami', type: 'festival', icon: '🦚' },
  { month: 7, day: 27, title: 'Ganesh Chaturthi', type: 'festival', icon: '🐘' },
  { month: 8, day: 5, title: "Teachers' Day", type: 'observance', icon: '📚' },
  { month: 9, day: 2, title: 'Mahatma Gandhi Jayanti', type: 'national_holiday', icon: '🕊️' },
  { month: 9, day: 12, title: 'Dussehra / Vijayadashami', type: 'festival', icon: '🏹' },
  { month: 9, day: 31, title: 'Halloween', type: 'observance', icon: '🎃' },
  { month: 10, day: 1, title: 'Diwali (Deepavali)', type: 'festival', icon: '🪔' },
  { month: 10, day: 15, title: 'Guru Nanak Jayanti', type: 'festival', icon: '✨' },
  { month: 11, day: 25, title: 'Christmas Day', type: 'holiday', icon: '🎄' },
  { month: 11, day: 31, title: "New Year's Eve", type: 'holiday', icon: '🥂' },
];

function formatEventDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

function getColorBg(colorId?: string) {
  return EVENT_COLORS.find(c => c.value === colorId)?.bg || '#3b82f6';
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CalEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHolidays, setShowHolidays] = useState(true);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Form state
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '10:00', color: '1', allDay: false });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/student-os/calendar/events', { params: { days: 90 } });
      const apiEvents = res.data?.events || [];
      setEvents(apiEvents);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreate = (defaultDate?: string) => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      date: defaultDate || today.toISOString().split('T')[0],
      time: '10:00',
      color: '1',
      allDay: false,
    });
    setShowModal(true);
  };

  const openEdit = (evt: CalEvent) => {
    if (evt.isHoliday) return;
    setEditing(evt);
    const d = new Date(evt.start);
    setForm({
      title: evt.title,
      description: evt.description || '',
      date: d.toISOString().split('T')[0],
      time: d.toTimeString().slice(0, 5),
      color: evt.colorId || '1',
      allDay: !!evt.allDay,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSaving(true);

    const start = form.allDay ? form.date : `${form.date}T${form.time}:00`;
    const payload = { title: form.title, description: form.description, start, allDay: form.allDay, color: form.color };

    try {
      if (editing) {
        await api.patch(`/student-os/calendar/events/${editing.id}`, payload);
      } else {
        await api.post('/student-os/calendar/events', payload);
      }
      // Automatically close modal immediately upon saving
      setShowModal(false);
      await fetchEvents();
    } catch (err) {
      console.error(err);
      // Still close modal to maintain clean UI flow
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/student-os/calendar/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {}
    finally { setDeletingId(null); }
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // Get holidays for active view month and year
  const monthHolidays = PUBLIC_HOLIDAYS.filter(h => h.month === viewMonth);

  const getHolidaysOnDay = (day: number) => {
    if (!showHolidays) return [];
    return monthHolidays.filter(h => h.day === day);
  };

  const getEventsOnDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.start);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
    });
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-emerald-400" /> Calendar, Holidays & Deadlines
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real Google Calendar sync with national public holidays and academic milestone tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button
            variant={showHolidays ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowHolidays(!showHolidays)}
            className="text-xs gap-1.5 h-9"
          >
            <Flag size={13} className="text-amber-400" />
            {showHolidays ? 'Holidays: ON' : 'Holidays: OFF'}
          </Button>

          <Button onClick={() => openCreate()} variant="apple" size="sm" className="gap-2 h-9">
            <Plus size={16} /> Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 p-6 space-y-4 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-sans">{MONTHS[viewMonth]} {viewYear}</h2>
              <Badge variant="secondary" className="text-[10px] py-0 font-mono">
                {events.length} Events
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft size={18} /></Button>
              <Button variant="ghost" size="sm" onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} className="text-xs">
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight size={18} /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 pb-2">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="min-h-[70px]" />;
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              const dayEvents = getEventsOnDay(day);
              const dayHolidays = getHolidaysOnDay(day);
              const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <div
                  key={day}
                  className={`min-h-[70px] p-1.5 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer overflow-hidden ${
                    isToday
                      ? 'bg-blue-600/15 border-blue-500/60 shadow-sm'
                      : dayHolidays.length > 0
                      ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                  onClick={() => openCreate(dateKey)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isToday ? 'text-blue-400 bg-blue-500/20 px-1.5 rounded-full' : 'text-zinc-400'}`}>
                      {day}
                    </span>
                    {dayHolidays.length > 0 && (
                      <span className="text-xs" title={dayHolidays[0].title}>{dayHolidays[0].icon}</span>
                    )}
                  </div>

                  {/* Holiday chips */}
                  {dayHolidays.map((h, hi) => (
                    <span
                      key={`h-${hi}`}
                      className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold truncate border border-amber-500/30"
                      title={h.title}
                    >
                      {h.icon} {h.title}
                    </span>
                  ))}

                  {/* User Event chips */}
                  {dayEvents.slice(0, 2).map(e => (
                    <span
                      key={e.id}
                      className="text-[9px] px-1 py-0.5 rounded font-medium truncate text-white shadow-xs"
                      style={{ backgroundColor: getColorBg(e.colorId) + 'cc' }}
                      title={e.title}
                    >
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-zinc-500 font-mono">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Events & Holidays Feed */}
        <Card className="p-6 space-y-4 bg-zinc-950 border-zinc-800 flex flex-col max-h-[640px]">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={15} className="text-emerald-400" /> Upcoming Schedule
            </h3>
            {loading && <RefreshCw size={13} className="animate-spin text-zinc-500" />}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Month holidays list */}
            {showHolidays && monthHolidays.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1">
                  <Flag size={11} /> {MONTHS[viewMonth]} Holidays & Festivals
                </p>
                {monthHolidays.map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{h.icon}</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-amber-200 truncate">{h.title}</p>
                        <p className="text-[10px] text-amber-400/80">{MONTHS[h.month]} {h.day}, {viewYear}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-300 uppercase py-0">
                      {h.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Custom / Google Calendar Events */}
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <CalendarDays size={11} /> Your Calendar Events
            </p>

            {events.length === 0 && !loading && (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No personal events scheduled. Click "Add Event" to create one.
              </p>
            )}

            {events.map(evt => (
              <div key={evt.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getColorBg(evt.colorId) }} />
                    <p className="text-xs font-bold text-white truncate">{evt.title}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEdit(evt)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="Edit Event"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      disabled={deletingId === evt.id}
                      className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                      title="Delete Event"
                    >
                      {deletingId === evt.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pl-4.5">
                  <span>{formatEventDate(evt.start)}</span>
                  {evt.type && (
                    <Badge variant="secondary" className="text-[9px] py-0 capitalize">
                      {evt.type}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Create / Edit Modal (Auto-closes on submit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editing ? 'Edit Event' : 'Create Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Event Title *</label>
                <Input
                  required
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Distributed Systems Final Exam"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Description / Location</label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional notes or Zoom link"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Date *</label>
                  <Input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Time</label>
                  <Input
                    type="time"
                    value={form.time}
                    disabled={form.allDay}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDayCheck"
                  checked={form.allDay}
                  onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))}
                  className="rounded accent-blue-500"
                />
                <label htmlFor="allDayCheck" className="text-xs text-zinc-300 cursor-pointer">
                  All Day Event
                </label>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-2">Category Color</label>
                <div className="flex items-center gap-3">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      className={`w-7 h-7 rounded-full transition-all ${
                        form.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="apple" disabled={saving} className="gap-1.5">
                  {saving ? 'Saving...' : (
                    <>
                      <Check size={14} /> {editing ? 'Update Event' : 'Create Event'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}