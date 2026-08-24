'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock,
  Trash2, Edit2, X, Check, Sparkles, Flag, RefreshCw, CalendarDays,
  Search, Filter, Layers, List
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

// Comprehensive list of national holidays and cultural observances
const PUBLIC_HOLIDAYS: { month: number; day: number; title: string; type: string; icon: string }[] = [
  { month: 0, day: 1, title: "New Year's Day", type: 'holiday', icon: '🎆' },
  { month: 0, day: 14, title: 'Makar Sankranti / Pongal', type: 'festival', icon: '🪁' },
  { month: 0, day: 26, title: 'Republic Day', type: 'national_holiday', icon: '🇮🇳' },
  { month: 1, day: 14, title: "Valentine's Day", type: 'observance', icon: '💝' },
  { month: 1, day: 26, title: 'Maha Shivratri', type: 'festival', icon: '🔱' },
  { month: 2, day: 14, title: 'Holi (Festival of Colors)', type: 'festival', icon: '🎨' },
  { month: 2, day: 31, title: 'Eid-ul-Fitr', type: 'festival', icon: '🌙' },
  { month: 3, day: 14, title: 'Dr. Ambedkar Jayanti', type: 'national_holiday', icon: '⚖️' },
  { month: 3, day: 18, title: 'Good Friday', type: 'holiday', icon: '✝️' },
  { month: 4, day: 1, title: 'International Workers’ Day', type: 'holiday', icon: '🛠️' },
  { month: 4, day: 12, title: 'Buddha Purnima', type: 'festival', icon: '🪷' },
  { month: 5, day: 21, title: 'International Yoga Day', type: 'observance', icon: '🧘' },
  { month: 7, day: 15, title: 'Independence Day', type: 'national_holiday', icon: '🇮🇳' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'month' | 'agenda'>('month');

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Form state
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '10:00', color: '1', allDay: false });

  // Persistent events save helper
  const saveEventsState = (newEvents: CalEvent[]) => {
    setEvents(newEvents);
    try {
      localStorage.setItem('studentos_calendar_events', JSON.stringify(newEvents));
    } catch {}
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);

    // First load from localStorage
    try {
      const saved = localStorage.getItem('studentos_calendar_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        }
      }
    } catch {}

    try {
      const res = await api.get('/student-os/calendar/events', { params: { days: 90 } });
      const apiEvents = res.data?.events || [];
      if (Array.isArray(apiEvents) && apiEvents.length > 0) {
        saveEventsState(apiEvents);
      }
    } catch {
      // Retain localStorage events on API fallback
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
    const newEvt: CalEvent = {
      id: editing ? editing.id : `evt-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      start,
      allDay: form.allDay,
      colorId: form.color,
      type: 'academic',
    };

    let updated: CalEvent[];
    if (editing) {
      updated = events.map(e => e.id === editing.id ? newEvt : e);
    } else {
      updated = [newEvt, ...events];
    }

    saveEventsState(updated);
    setShowModal(false);

    try {
      if (editing) {
        await api.patch(`/student-os/calendar/events/${editing.id}`, newEvt);
      } else {
        await api.post('/student-os/calendar/events', newEvt);
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    setDeletingId(id);
    const updated = events.filter(e => e.id !== id);
    saveEventsState(updated);

    try {
      await api.delete(`/student-os/calendar/events/${id}`);
    } catch {} finally {
      setDeletingId(null);
    }
  };

  // Calendar Grid Calculations
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

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

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="text-emerald-400" /> Academic & Personal Calendar
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Interactive schedule manager integrated with national public holidays, exams, and personal milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          {/* View switch buttons */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveView('month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeView === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarDays size={13} /> Month
            </button>
            <button
              onClick={() => setActiveView('agenda')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeView === 'agenda' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List size={13} /> Schedule List
            </button>
          </div>

          <Button
            variant={showHolidays ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowHolidays(!showHolidays)}
            className="text-xs gap-1.5 h-9"
          >
            <Flag size={13} className="text-amber-400" />
            {showHolidays ? 'Holidays: ON' : 'Holidays: OFF'}
          </Button>

          <Button onClick={() => openCreate()} variant="apple" size="sm" className="gap-2 h-9 shadow-md shadow-blue-500/20">
            <Plus size={16} /> Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Grid View */}
        {activeView === 'month' ? (
          <Card className="lg:col-span-2 p-6 space-y-4 bg-zinc-950 border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-sans">{MONTHS[viewMonth]} {viewYear}</h2>
                <Badge variant="secondary" className="text-[10px] py-0 font-mono">
                  {events.length} Saved Events
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
                if (!day) return <div key={`empty-${idx}`} className="min-h-[75px]" />;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const dayEvents = getEventsOnDay(day);
                const dayHolidays = getHolidaysOnDay(day);
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return (
                  <div
                    key={day}
                    className={`min-h-[75px] p-1.5 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer overflow-hidden ${
                      isToday
                        ? 'bg-blue-600/15 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
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
        ) : (
          /* Full Schedule Agenda View */
          <Card className="lg:col-span-2 p-6 space-y-4 bg-zinc-950 border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <List size={18} className="text-blue-400" /> Complete Schedule Overview
              </h2>
              <div className="relative w-64">
                <Search size={13} className="absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter events..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-12">No matching events found.</p>
              )}

              {filteredEvents.map(evt => (
                <div key={evt.id} className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-4 hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getColorBg(evt.colorId) }} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{formatEventDate(evt.start)} {evt.description ? `· ${evt.description}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(evt)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(evt.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upcoming Events & Holidays Feed */}
        <Card className="p-6 space-y-4 bg-zinc-950 border-zinc-800 flex flex-col max-h-[640px] shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={15} className="text-emerald-400" /> Upcoming Feed
            </h3>
            {loading && <RefreshCw size={13} className="animate-spin text-zinc-500" />}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Month holidays list */}
            {showHolidays && monthHolidays.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1">
                  <Flag size={11} /> {MONTHS[viewMonth]} Holidays & Observances
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

            {/* Custom Events */}
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <CalendarDays size={11} /> Personal Events ({events.length})
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

      {/* Create / Edit Event Modal */}
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
                <Button type="submit" variant="apple" disabled={saving}>
                  {saving ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <Check size={14} className="mr-1.5" />}
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}