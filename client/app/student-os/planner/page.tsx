'use client';

import React from 'react';
import { ClipboardList, Sparkles, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SLOTS = [
  { time: '08:00 AM - 09:30 AM', title: 'Morning Code Warmup (LeetCode Interval DP Set)', tag: 'Coding', completed: true },
  { time: '10:00 AM - 11:30 AM', title: 'Distributed Systems Lecture & Paxos Notes Sync', tag: 'Academic', completed: true },
  { time: '01:00 PM - 02:30 PM', title: 'Deep Work: Refactor StudentOS with Apple Clean UI', tag: 'Project', completed: false },
  { time: '03:00 PM - 04:30 PM', title: 'System Design Mock Practice & Diagramming', tag: 'Career', completed: false },
];

export default function DailyPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="text-emerald-400" /> Daily Time-Block Planner
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Smart schedule generator based on energy levels and task priorities.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-emerald-500/30 text-emerald-400" onClick={() => alert('AI auto-optimizing schedule...')}>
          <Sparkles size={14} /> AI Auto-Schedule
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        {SLOTS.map((slot, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
              slot.completed
                ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                : 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-xs shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-semibold">{slot.time}</p>
                <p className={`text-sm font-semibold mt-0.5 ${slot.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {slot.title}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {slot.tag}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
