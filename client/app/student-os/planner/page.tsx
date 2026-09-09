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
  Coding: 'text-blue-700 bg-blue-50 border-blue-200',
  Academic: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  Project: 'text-sky-700 bg-sky-50 border-sky-200',
  Career: 'text-amber-700 bg-amber-50 border-amber-200',
  Break: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-slate-400',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardList className="text-blue-600" /> Daily Time-Block Planner
            </h1>
            <Badge variant="secondary" className="text-[10px] text-slate-600 bg-slate-100 border-slate-200 gap-1 font-mono">
              <Calendar size={11} /> {todayStr}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            24-hour persistent AI schedule derived from your active roadmap phase.
          </p>
        </div>

        {generated && (
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-red-600 gap-1.5 self-start rounded-xl"
          >
            <RotateCcw size={13} /> Reset Schedule
          </Button>
        )}
      </div>

      {/* Active Phase Banner */}
      {activePhase && (
        <Card className="p-4 bg-blue-50/60 border-blue-200 flex items-center gap-4 shadow-xs rounded-3xl">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <Zap size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-blue-700 font-bold uppercase tracking-wider">Active Target Phase</p>
            <p className="text-sm font-bold text-slate-900 truncate">{activePhase.title}</p>
          </div>
          <Badge className="text-[10px] shrink-0 bg-blue-600 text-white border-transparent font-semibold">
            In Progress
          </Badge>
        </Card>
      )}

      {/* Generation Controls */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white border-slate-200 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Available Hours Today:</label>
          <div className="flex items-center gap-2">
            {[4, 6, 8, 10, 12].map(h => (
              <button
                key={h}
                onClick={() => setHoursInput(h)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  hoursInput === h
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >{h}h</button>
            ))}
          </div>
        </div>

        <Button
          onClick={generatePlan}
          disabled={generating}
          className="gap-2 self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
        >
          {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generating ? 'Generating Schedule...' : generated ? 'Regenerate Plan' : 'Generate Daily Plan'}
        </Button>
      </Card>

      {/* Daily Progress Bar */}
      {generated && slots.length > 0 && (
        <Card className="p-5 flex items-center gap-4 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-bold flex items-center gap-1.5">
                <Flame size={14} className="text-blue-600" /> Daily Target Completion
              </span>
              <span className="text-blue-600 font-bold">{completedCount} of {slots.length} Tasks Done ({progress}%)</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Time Slots */}
      {!generated ? (
        <Card className="p-12 text-center space-y-4 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ClipboardList size={32} />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Schedule Active for Today</h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
            Click "Generate Daily Plan" above to create your smart time-blocked schedule tailored to your available study hours. Your plan will persist for 24 hours.
          </p>
        </Card>
      ) : (
        <Card className="p-5 space-y-3 bg-white border-slate-200 shadow-xs rounded-3xl">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer select-none ${
                slot.completed
                  ? 'bg-slate-50 border-slate-200/80 opacity-60'
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
              }`}
              onClick={() => toggleComplete(idx)}
            >
              {/* Checkbox */}
              <div className="shrink-0">
                {slot.completed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-300">
                    <Check size={14} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-300 bg-white hover:border-blue-500 transition-colors" />
                )}
              </div>

              {/* Time Icon */}
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Clock size={14} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-bold">{slot.time}</p>
                <p className={`text-sm font-bold mt-0.5 ${slot.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {slot.title}
                </p>
                {slot.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{slot.description}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 shrink-0">
                {slot.priority && (
                  <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[slot.priority] || 'text-slate-500'}`}>
                    {slot.priority}
                  </span>
                )}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${TAG_COLORS[slot.tag] || 'text-slate-600 bg-slate-100 border-slate-200'}`}>
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