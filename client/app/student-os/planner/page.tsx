'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Sparkles, Clock, CheckCircle2, Circle, RefreshCw,
  Zap, Calendar, RotateCcw, Check, Flame
} from 'lucide-react';
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
  low: 'text-gray-400',
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
      const fallback: Slot[] = [
        { time: '08:00 AM - 09:30 AM', title: 'Problem Set (Interval DP & Graphs)', description: 'Solve 3 medium-to-hard algorithmic problems', tag: 'Coding', priority: 'high', estimatedMinutes: 90, completed: false },
        { time: '10:00 AM - 11:30 AM', title: `${activePhase?.title || 'Core Systems'} — Architecture Review`, description: 'Review state replication and distributed consensus patterns', tag: 'Academic', priority: 'high', estimatedMinutes: 90, completed: false },
        { time: '12:00 PM - 12:45 PM', title: 'Nutritional Break & Re-energize', description: 'Rest, hydrate, and disconnect', tag: 'Break', priority: 'low', estimatedMinutes: 45, completed: false },
        { time: '01:15 PM - 02:45 PM', title: 'Hands-on Project Implementation', description: 'Build and test production APIs & caching layers', tag: 'Project', priority: 'medium', estimatedMinutes: 90, completed: false },
        { time: '03:15 PM - 04:30 PM', title: 'System Design & Metric Diagrams', description: 'Draw end-to-end component diagrams and API specs', tag: 'Career', priority: 'medium', estimatedMinutes: 75, completed: false },
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
    <div className="max-w-4xl mx-auto space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ClipboardList size={18} className="text-gray-700" /> Daily Time-Block Planner
            </h1>
            <span className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono">
              {todayStr}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            24-hour persistent schedule derived from your active roadmap phase.
          </p>
        </div>

        {generated && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 self-start"
          >
            <RotateCcw size={12} /> Reset Schedule
          </button>
        )}
      </div>

      {/* Generation Controls */}
      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-2xs">
        <div className="flex items-center gap-2.5 flex-1">
          <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Available Hours Today:</label>
          <div className="flex items-center gap-1.5">
            {[4, 6, 8, 10, 12].map(h => (
              <button
                key={h}
                onClick={() => setHoursInput(h)}
                className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                  hoursInput === h
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >{h}h</button>
            ))}
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={generating}
          className="gap-1.5 self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs flex items-center transition-colors"
        >
          {generating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {generating ? 'Generating...' : generated ? 'Regenerate' : 'Generate Daily Plan'}
        </button>
      </div>

      {/* Progress Bar */}
      {generated && slots.length > 0 && (
        <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Daily Target Completion</span>
            <span className="text-blue-600 font-bold">{completedCount} of {slots.length} Done ({progress}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Slots List */}
      {!generated ? (
        <div className="p-10 text-center space-y-3 bg-white border border-gray-200 rounded-lg shadow-2xs">
          <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto">
            <ClipboardList size={20} />
          </div>
          <h2 className="text-sm font-bold text-gray-900">No Schedule Active for Today</h2>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">Click "Generate Daily Plan" to create your smart time-blocked schedule.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-center gap-3 transition-all cursor-pointer select-none ${
                slot.completed
                  ? 'bg-gray-50/70 border-gray-200 opacity-60'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
              }`}
              onClick={() => toggleComplete(idx)}
            >
              <div className="shrink-0">
                {slot.completed ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                    <Check size={12} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-300 bg-white" />
                )}
              </div>

              <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                <Clock size={13} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900">{slot.time} — {slot.title}</p>
                {slot.description && (
                  <p className="text-[11px] text-gray-500 truncate">{slot.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {slot.priority && (
                  <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[slot.priority] || 'text-gray-500'}`}>
                    {slot.priority}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${TAG_COLORS[slot.tag] || 'text-gray-600 bg-gray-100 border-gray-200'}`}>
                  {slot.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}