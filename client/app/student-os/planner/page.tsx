'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Sparkles, Clock, CheckCircle2, Circle, RefreshCw,
  Zap, Calendar, RotateCcw, Check, Flame
} from 'lucide-react';
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

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export default function DailyPlannerPage() {
  const { milestones, targetRole } = useRoadmap();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [generating, setGenerating] = useState(false);
  const [hoursInput, setHoursInput] = useState(6);
  const [generated, setGenerated] = useState(false);

  const activePhase = milestones.find(m => m.status === 'in_progress');
  const todayStr = getTodayKey();

  // Load existing persistent plan
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studentos_daily_plan_current') || localStorage.getItem(`studentos_daily_plan_${todayStr}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlots(parsed);
          setGenerated(true);
        }
      }
    } catch {}
  }, [todayStr]);

  const savePlanState = (newSlots: Slot[]) => {
    setSlots(newSlots);
    try {
      localStorage.setItem('studentos_daily_plan_current', JSON.stringify(newSlots));
      localStorage.setItem(`studentos_daily_plan_${todayStr}`, JSON.stringify(newSlots));
    } catch {}
  };

  const generatePlan = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await api.post('/student-os/ai/daily-plan', {
        roadmapPhase: activePhase?.title || 'Foundations',
        targetRole,
        availableHours: hoursInput,
      });

      const raw = res.data?.slots || [];
      const formatted: Slot[] = raw.map((s: any) => ({ ...s, completed: false }));
      savePlanState(formatted);
      setGenerated(true);
    } catch {
      // High-quality fallback slots
      const fallback: Slot[] = [
        { time: '08:00 AM - 09:30 AM', title: 'LeetCode Problem Set (Interval DP & Graphs)', description: 'Solve 3 medium-to-hard algorithmic problems', tag: 'Coding', priority: 'high', estimatedMinutes: 90, completed: false },
        { time: '10:00 AM - 11:30 AM', title: `${activePhase?.title || 'Core Systems'} — Architecture Review`, description: 'Review state replication and distributed consensus patterns', tag: 'Academic', priority: 'high', estimatedMinutes: 90, completed: false },
        { time: '12:00 PM - 12:45 PM', title: 'Nutritional Break & Re-energize', description: 'Rest, hydrate, and disconnect', tag: 'Break', priority: 'low', estimatedMinutes: 45, completed: false },
        { time: '01:15 PM - 02:45 PM', title: 'Hands-on Project Implementation', description: 'Build and test production APIs & caching layers', tag: 'Project', priority: 'medium', estimatedMinutes: 90, completed: false },
        { time: '03:15 PM - 04:30 PM', title: 'System Design & Real-Time Metrics Diagramming', description: 'Draw end-to-end component diagrams and API specs', tag: 'Career', priority: 'medium', estimatedMinutes: 75, completed: false },
      ];
      savePlanState(fallback);
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  }, [activePhase, targetRole, hoursInput, todayStr]);

  const toggleComplete = (idx: number) => {
    const updated = slots.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s);
    savePlanState(updated);
  };

  const handleReset = () => {
    if (!confirm('Clear current schedule and recreate?')) return;
    try {
      localStorage.removeItem('studentos_daily_plan_current');
      localStorage.removeItem(`studentos_daily_plan_${todayStr}`);
    } catch {}
    setSlots([]);
    setGenerated(false);
  };

  const completedCount = slots.filter(s => s.completed).length;
  const progress = slots.length > 0 ? Math.round((completedCount / slots.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="text-emerald-400" /> Daily Time-Block Planner
            </h1>
            <Badge variant="secondary" className="text-[10px] text-zinc-400 gap-1 font-mono">
              <Calendar size={11} /> {todayStr}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            24-hour persistent AI schedule derived from your active roadmap phase. Retained across browser reloads.
          </p>
        </div>

        {generated && (
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-400 hover:text-red-400 gap-1.5 self-start"
          >
            <RotateCcw size={13} /> Reset Schedule
          </Button>
        )}
      </div>

      {/* Active Phase Banner */}
      {activePhase && (
        <Card className="p-4 bg-blue-950/20 border-blue-500/30 flex items-center gap-4 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Zap size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">Active Target Phase</p>
            <p className="text-sm font-bold text-white truncate">{activePhase.title}</p>
          </div>
          <Badge variant="apple" className="text-[10px] shrink-0">In Progress</Badge>
        </Card>
      )}

      {/* Generation Controls */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-950 border-zinc-800">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs text-zinc-400 font-medium whitespace-nowrap">Available Hours Today:</label>
          <div className="flex items-center gap-2">
            {[4, 6, 8, 10, 12].map(h => (
              <button
                key={h}
                onClick={() => setHoursInput(h)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  hoursInput === h
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
          {generating ? 'Generating Schedule...' : generated ? 'Regenerate Plan' : 'Generate Daily Plan'}
        </Button>
      </Card>

      {/* Daily Progress Bar */}
      {generated && slots.length > 0 && (
        <Card className="p-4 flex items-center gap-4 bg-zinc-950 border-zinc-800">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                <Flame size={14} className="text-emerald-400" /> Daily Target Completion
              </span>
              <span className="text-emerald-400 font-bold">{completedCount} of {slots.length} Tasks Done ({progress}%)</span>
            </div>
            <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Time Slots */}
      {!generated ? (
        <Card className="p-12 text-center space-y-4 bg-zinc-950 border-zinc-800">
          <ClipboardList size={40} className="text-zinc-600 mx-auto" />
          <h2 className="text-base font-bold text-white">No Schedule Active for Today</h2>
          <p className="text-zinc-400 text-xs max-w-md mx-auto leading-relaxed">
            Click "Generate Daily Plan" above to create your smart time-blocked schedule tailored to your available study hours. Your plan will persist for 24 hours.
          </p>
        </Card>
      ) : (
        <Card className="p-6 space-y-3 bg-zinc-950 border-zinc-800 shadow-xl">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer select-none ${
                slot.completed
                  ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-900'
              }`}
              onClick={() => toggleComplete(idx)}
            >
              {/* Checkbox */}
              <div className="shrink-0">
                {slot.completed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <Check size={14} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors" />
                )}
              </div>

              {/* Time Icon */}
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
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
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${TAG_COLORS[slot.tag] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
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