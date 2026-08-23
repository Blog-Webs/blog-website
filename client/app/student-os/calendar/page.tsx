'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Trash2, Edit2, X, Check } from 'lucide-react';
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
};

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

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Form state
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '10:00', color: '1', allDay: false });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/student-os/calendar/events', { params: { days: 90 } });
      setEvents(res.data?.events || []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', date: today.toISOString().split('T')[0], time: '10:00', color: '1', allDay: false });
    setShowModal(true);
  };

  const openEdit = (evt: CalEvent) => {
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
    try {
      const start = form.allDay ? form.date : `${form.date}T${form.time}:00`;
      const payload = { title: form.title, description: form.description, start, allDay: form.allDay, color: form.color };

      if (editing) {
        await api.patch(`/student-os/calendar/events/${editing.id}`, payload);
      } else {
        await api.post('/student-os/calendar/events', payload);
      }
      setShowModal(false);
      await fetchEvents();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
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
  const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const eventsOnDay = (day: number) => events.filter(e => {
    const d = new Date(e.start);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
  });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-emerald-400" /> Calendar & Deadlines
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage lectures, project milestones, and exams synced with Google Calendar.</p>
        </div>
        <Button onClick={openCreate} variant="apple" className="gap-2 self-start">
          <Plus size={16} /> Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{MONTHS[viewMonth]} {viewYear}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft size={18} /></Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight size={18} /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 pb-2">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              const dayEvents = eventsOnDay(day);
              return (
                <div
                  key={day}
                  className={`min-h-[56px] p-1.5 rounded-lg border text-left transition-colors flex flex-col gap-1 cursor-pointer ${
                    isToday
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                  onClick={() => { openCreate(); setForm(f => ({ ...f, date: `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` })); }}
                >
                  <span className={`text-[11px] font-bold ${isToday ? 'text-blue-300' : 'text-zinc-400'}`}>{day}</span>
                  {dayEvents.slice(0, 2).map(e => (
                    <span key={e.id} className="text-[9px] px-1 py-0.5 rounded font-medium truncate text-white" style={{ backgroundColor: getColorBg(e.colorId) + '99' }}>
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && <span className="text-[9px] text-zinc-500">+{dayEvents.length - 2}</span>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6 space-y-3 overflow-y-auto max-h-[600px]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={14} className="text-emerald-400" /> Upcoming Events
            {loading && <span className="text-xs text-zinc-500 animate-pulse">Syncing...</span>}
          </h3>

          {events.length === 0 && !loading && (
            <p className="text-xs text-zinc-500 py-4 text-center">No upcoming events. Add one!</p>
          )}

          {events.map(evt => (
            <div key={evt.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getColorBg(evt.colorId) }} />
                  <p className="text-sm font-semibold text-white truncate">{evt.title}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(evt)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white">
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    disabled={deletingId === evt.id}
                    className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                  >
                    {deletingId === evt.id ? <span className="animate-spin text-[10px]">⟳</span> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 pl-4">{formatEventDate(evt.start)}</p>
              {evt.type && <Badge variant="secondary" className="text-[9px] py-0 ml-4">{evt.type}</Badge>}
            </div>
          ))}
        </Card>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{editing ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Event Title *</label>
                <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Distributed Systems Exam" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Description</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Date *</label>
                  <Input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Time</label>
                  <Input type="time" value={form.time} disabled={form.allDay} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allDay" checked={form.allDay} onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))} className="rounded" />
                <label htmlFor="allDay" className="text-xs text-zinc-300">All Day Event</label>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-2">Color</label>
                <div className="flex items-center gap-2">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      className={`w-6 h-6 rounded-full transition-all ${form.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : ''}`}
                      style={{ backgroundColor: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="apple" disabled={saving} className="gap-1.5">
                  {saving ? 'Saving...' : <><Check size={14} /> {editing ? 'Update Event' : 'Create Event'}</>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}