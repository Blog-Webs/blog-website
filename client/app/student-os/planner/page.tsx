'use client';

import React, { useState, useCallback } from 'react';
import { ClipboardList, Sparkles, Clock, CheckCircle2, Circle, RefreshCw, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/context/RoadmapContext';
import api from '@/lib/api';

type Slot = {
  time: string;
  title: string;
  description?: string;
  tag: string;
  priority?: string;
  estimatedMinutes?: number;
  completed?: boolean;
};

const TAG_COLORS: Record<string, string> = {
  Coding: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Academic: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Project: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Career: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Break: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-zinc-400',
};

export default function DailyPlannerPage() {
  const { milestones, targetRole } = useRoadmap();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [generating, setGenerating] = useState(false);
  const [hoursInput, setHoursInput] = useState(6);
  const [generated, setGenerated] = useState(false);

  const activePhase = milestones.find(m => m.status === 'in_progress');

  const generatePlan = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await api.post('/student-os/ai/daily-plan', {
        roadmapPhase: activePhase?.title || 'Foundations',
        targetRole,
        availableHours: hoursInput,
      });

      const raw = res.data?.slots || [];
      setSlots(raw.map((s: any) => ({ ...s, completed: false })));
      setGenerated(true);
    } catch {
      // Fallback slots
      setSlots([
        { time: '08:00 AM - 09:30 AM', title: 'LeetCode Problem Set (Arrays & Hashing)', description: 'Solve 3 medium-level problems', tag: 'Coding', priority: 'high', estimatedMinutes: 90, completed: false },
        { time: '10:00 AM - 11:30 AM', title: `${activePhase?.title || 'Core Study'} — Theory Review`, description: 'Go through lecture notes and key concepts', tag: 'Academic', priority: 'high', estimatedMinutes: 90, completed: false },
        { time: '12:00 PM - 12:30 PM', title: 'Lunch Break', description: 'Rest and recharge', tag: 'Break', priority: 'low', estimatedMinutes: 30, completed: false },
        { time: '01:00 PM - 02:30 PM', title: 'Project Work — Feature Implementation', description: 'Work on portfolio project', tag: 'Project', priority: 'medium', estimatedMinutes: 90, completed: false },
        { time: '03:00 PM - 04:00 PM', title: 'System Design Concepts', description: 'Read and diagram system design patterns', tag: 'Career', priority: 'medium', estimatedMinutes: 60, completed: false },
      ]);
      setGenerated(true);
    }
    setGenerating(false);
  }, [activePhase, targetRole, hoursInput]);

  const toggleComplete = (idx: number) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s));
  };

  const completedCount = slots.filter(s => s.completed).length;
  const progress = slots.length > 0 ? Math.round((completedCount / slots.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="text-emerald-400" /> Daily Time-Block Planner
          </h1>
          <p className="text-xs text-zinc-400 mt-1">AI-generated schedule derived from your active roadmap phase.</p>
        </div>
      </div>

      {/* Active Phase Banner */}
      {activePhase && (
        <Card className="p-4 bg-blue-950/30 border-blue-500/30 flex items-center gap-4">
          <Zap size={20} className="text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-300 font-semibold">Active Roadmap Phase</p>
            <p className="text-sm font-bold text-white truncate">{activePhase.title}</p>
          </div>
          <Badge variant="apple" className="text-[10px] shrink-0">In Progress</Badge>
        </Card>
      )}

      {/* Generation Controls */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs text-zinc-400 font-medium whitespace-nowrap">Available Hours Today:</label>
          <div className="flex items-center gap-2">
            {[4, 6, 8, 10, 12].map(h => (
              <button
                key={h}
                onClick={() => setHoursInput(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  hoursInput === h
                    ? 'bg-blue-500/20 border-blue-400 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >{h}h</button>
            ))}
          </div>
        </div>
        <Button
          onClick={generatePlan}
          disabled={generating}
          variant="apple"
          className="gap-2 self-start sm:self-center"
        >
          {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generating ? 'Generating...' : generated ? 'Regenerate Plan' : 'AI Auto-Generate'}
        </Button>
      </Card>

      {/* Progress Bar */}
      {generated && slots.length > 0 && (
        <Card className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 font-medium">Daily Progress</span>
              <span className="text-emerald-400 font-bold">{completedCount}/{slots.length} tasks — {progress}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </Card>
      )}

      {/* Time Slots */}
      {!generated ? (
        <Card className="p-12 text-center space-y-4">
          <ClipboardList size={40} className="text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">Click "AI Auto-Generate" to create your personalized daily schedule based on your roadmap phase.</p>
        </Card>
      ) : (
        <Card className="p-6 space-y-3">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-center gap-4 transition-all cursor-pointer ${
                slot.completed
                  ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                  : 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/40'
              }`}
              onClick={() => toggleComplete(idx)}
            >
              {/* Checkbox */}
              <div className="shrink-0">
                {slot.completed
                  ? <CheckCircle2 size={22} className="text-emerald-400" />
                  : <Circle size={22} className="text-zinc-600" />
                }
              </div>

              {/* Time Icon */}
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock size={14} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-400 font-semibold">{slot.time}</p>
                <p className={`text-sm font-semibold mt-0.5 ${slot.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {slot.title}
                </p>
                {slot.description && (
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{slot.description}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 shrink-0">
                {slot.priority && (
                  <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[slot.priority] || 'text-zinc-500'}`}>
                    {slot.priority}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${TAG_COLORS[slot.tag] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                  {slot.tag}
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}