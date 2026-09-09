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
  { label: 'Blue', value: '1', bg: '#2563eb' },
  { label: 'Green', value: '2', bg: '#16a34a' },
  { label: 'Purple', value: '3', bg: '#9333ea' },
  { label: 'Red', value: '11', bg: '#dc2626' },
  { label: 'Orange', value: '6', bg: '#ea580c' },
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
  return EVENT_COLORS.find(c => c.value === colorId)?.bg || '#2563eb';
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
    <div className="max-w-7xl mx-auto space-y-5 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={20} /> Academic & Personal Calendar
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Interactive schedule manager integrated with national public holidays, exams, and personal milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          {/* View switch buttons */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-md border border-gray-200">
            <button
              onClick={() => setActiveView('month')}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors flex items-center gap-1 ${
                activeView === 'month' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarDays size={13} /> Month
            </button>
            <button
              onClick={() => setActiveView('agenda')}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors flex items-center gap-1 ${
                activeView === 'agenda' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={13} /> Schedule
            </button>
          </div>

          <button
            onClick={() => setShowHolidays(!showHolidays)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
          >
            <Flag size={13} className="text-blue-600" />
            <span>{showHolidays ? 'Holidays: ON' : 'Holidays: OFF'}</span>
          </button>

          <button 
            onClick={() => openCreate()} 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
          >
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Grid View */}
        {activeView === 'month' ? (
          <div className="lg:col-span-2 p-5 space-y-4 bg-white border border-gray-200 rounded-lg shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{MONTHS[viewMonth]} {viewYear}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                  {events.length} Events
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-600">
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} 
                  className="px-2.5 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-xs"
                >
                  Today
                </button>
                <button onClick={nextMonth} className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-600">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider pb-1">
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[72px] bg-gray-50/50 rounded-md border border-dashed border-gray-200" />;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const dayEvents = getEventsOnDay(day);
                const dayHolidays = getHolidaysOnDay(day);
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return (
                  <div
                    key={day}
                    className={`min-h-[72px] p-1.5 rounded-md border text-left transition-all flex flex-col gap-1 cursor-pointer overflow-hidden ${
                      isToday
                        ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                        : dayHolidays.length > 0
                        ? 'bg-sky-50/40 border-sky-200 hover:border-blue-400'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                    onClick={() => openCreate(dateKey)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono ${isToday ? 'font-bold text-blue-700 bg-blue-100 px-1 rounded' : 'text-gray-700 font-medium'}`}>
                        {day}
                      </span>
                      {dayHolidays.length > 0 && (
                        <span className="text-[11px]" title={dayHolidays[0].title}>{dayHolidays[0].icon}</span>
                      )}
                    </div>

                    {/* Holiday chips */}
                    {dayHolidays.map((h, hi) => (
                      <span
                        key={`h-${hi}`}
                        className="text-[9px] px-1 py-0.2 rounded-sm bg-sky-100 text-sky-800 font-medium truncate border border-sky-200"
                        title={h.title}
                      >
                        {h.icon} {h.title}
                      </span>
                    ))}

                    {/* User Event chips */}
                    {dayEvents.slice(0, 2).map(e => (
                      <span
                        key={e.id}
                        className="text-[9px] px-1 py-0.2 rounded-sm font-medium truncate text-white"
                        style={{ backgroundColor: getColorBg(e.colorId) }}
                        title={e.title}
                      >
                        {e.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-gray-500 font-mono">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Full Schedule Agenda View */
          <div className="lg:col-span-2 p-5 space-y-4 bg-white border border-gray-200 rounded-lg shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <List size={16} className="text-blue-600" /> Complete Schedule
              </h2>
              <div className="relative w-56">
                <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter events..."
                  className="w-full pl-7 pr-3 py-1 rounded-md bg-white border border-gray-300 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-12">No matching events found.</p>
              )}

              {filteredEvents.map(evt => (
                <div key={evt.id} className="p-3 rounded-md bg-white border border-gray-200 flex items-center justify-between gap-3 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getColorBg(evt.colorId) }} />
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">{evt.title}</h4>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{formatEventDate(evt.start)} {evt.description ? `· ${evt.description}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEdit(evt)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(evt.id)} className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events & Holidays Feed */}
        <div className="p-5 space-y-4 bg-white border border-gray-200 rounded-lg flex flex-col max-h-[620px] shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-blue-600" /> Upcoming Feed
            </h3>
            {loading && <RefreshCw size={12} className="animate-spin text-blue-600" />}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {/* Month holidays list */}
            {showHolidays && monthHolidays.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                  <Flag size={11} className="text-blue-600" /> {MONTHS[viewMonth]} Holidays
                </p>
                {monthHolidays.map((h, idx) => (
                  <div key={idx} className="p-2 rounded-md bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{h.icon}</span>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-blue-900 truncate">{h.title}</p>
                        <p className="text-[10px] text-blue-700/80 font-mono">{MONTHS[h.month]} {h.day}, {viewYear}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono border border-blue-300 text-blue-800 uppercase px-1.5 py-0.2 rounded-sm bg-white">
                      {h.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Events */}
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays size={11} className="text-blue-600" /> Personal Events ({events.length})
            </p>

            {events.length === 0 && !loading && (
              <p className="text-xs text-gray-400 py-6 text-center">
                No personal events scheduled.
              </p>
            )}

            {events.map(evt => (
              <div key={evt.id} className="p-2.5 rounded-md bg-white border border-gray-200 space-y-1 group hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getColorBg(evt.colorId) }} />
                    <p className="text-xs font-semibold text-gray-900 truncate">{evt.title}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEdit(evt)}
                      className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                      title="Edit Event"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      disabled={deletingId === evt.id}
                      className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                      title="Delete Event"
                    >
                      {deletingId === evt.id ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pl-4 font-mono">
                  <span>{formatEventDate(evt.start)}</span>
                  {evt.type && (
                    <span className="px-1.5 py-0.2 rounded-sm capitalize bg-gray-100 text-gray-700">
                      {evt.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-gray-200 bg-white rounded-lg p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {editing ? 'Edit Event' : 'Create Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-700 font-medium block mb-1">Event Title *</label>
                <Input
                  required
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Distributed Systems Exam"
                  className="rounded-md border-gray-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium block mb-1">Description / Location</label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional notes or Zoom link"
                  className="rounded-md border-gray-300 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700 font-medium block mb-1">Date *</label>
                  <Input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="rounded-md border-gray-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 font-medium block mb-1">Time</label>
                  <Input
                    type="time"
                    value={form.time}
                    disabled={form.allDay}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="rounded-md border-gray-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDayCheck"
                  checked={form.allDay}
                  onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))}
                  className="rounded-xs accent-blue-600"
                />
                <label htmlFor="allDayCheck" className="text-xs text-gray-700 cursor-pointer">
                  All Day Event
                </label>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium block mb-1.5">Category Color</label>
                <div className="flex items-center gap-2.5">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      className={`w-6 h-6 rounded-full transition-all ${
                        form.color === c.value ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
                >
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}