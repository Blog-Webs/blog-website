'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStudentOS } from '@/context/StudentOSContext';
import api from '@/lib/api';

export default function CalendarPage() {
  const { events, addEvent } = useStudentOS();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('11:00 AM');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    api.get('/student-os/calendar/events')
      .then(() => {})
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addEvent({ title, start: time, color, type: 'general' });
    setTitle('');
    setShowModal(false);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-emerald-400" /> Calendar & Deadlines
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Schedule lectures, project milestones, and exams.</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="apple" className="gap-2 self-start">
          <Plus size={16} /> Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">August 2026</h2>
            <div className="flex items-center gap-2 text-zinc-400">
              <Button variant="ghost" size="icon"><ChevronLeft size={18} /></Button>
              <Button variant="ghost" size="icon"><ChevronRight size={18} /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
              <div
                key={d}
                className={`min-h-[64px] p-2 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  d === 23
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span className="text-xs font-semibold">{d}</span>
                {d === 23 && <Badge variant="apple" className="text-[9px] py-0">Today</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" /> Upcoming Events
          </CardTitle>
          <CardContent className="space-y-3 p-0">
            {events.map((evt) => (
              <div key={evt.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: evt.color || '#3b82f6' }} />
                  <p className="text-sm font-semibold text-white">{evt.title}</p>
                </div>
                <p className="text-xs text-zinc-400 pl-4">{evt.start}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <CardTitle>Schedule Event</CardTitle>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Event Title</label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Time</label>
                <Input value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Color Tag</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full rounded-xl bg-zinc-950 cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="apple">Save Event</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
