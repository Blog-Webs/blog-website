'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, CheckSquare, Calendar, Focus, Code2, ArrowUpRight, FolderOpen,
  Flame, Clock, Target, ChevronRight, Activity, ArrowRight, ShieldCheck,
  BookOpen, Brain, Terminal, Zap, Play, CheckCircle2, Layers, Cpu, Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStudentOS } from '@/context/StudentOSContext';
import { useRoadmap } from '@/context/RoadmapContext';
import { useAuth } from '@/modules/core/context/AuthContext';

export default function StudentOSDashboard() {
  const { tasks, events, focusMinutesToday, googleEmail, userName, streakDays } = useStudentOS();
  const { milestones, targetRole } = useRoadmap();
  const [activeDemoTab, setActiveDemoTab] = useState<'roadmap' | 'runtime' | 'ai'>('roadmap');

  let displayName = userName || 'Student';
  try {
    const auth = useAuth();
    if (auth?.user?.displayName) {
      displayName = auth.user.displayName;
    } else if (auth?.user?.name) {
      displayName = auth.user.name;
    } else if (auth?.user?.email) {
      displayName = auth.user.email.split('@')[0];
    }
  } catch (err) {
    // optional fallback
  }
  if ((!displayName || displayName === 'Student') && googleEmail) {
    displayName = googleEmail.split('@')[0];
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      {/* ── Multi-Layer Hero Section ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 md:p-10 text-white shadow-xl shadow-blue-500/15 border border-blue-500/20">
        {/* Layer 1: Ambient Background & Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Layer 2: Content & Action Group */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-center gap-8 w-full">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xs">
                <Sparkles size={13} className="text-yellow-300" /> Academic Intelligence Platform
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-100 text-[11px] font-semibold border border-blue-400/30">
                <Flame size={12} className="text-yellow-400" /> {streakDays || 1} Day Streak
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-sky-200">
                {displayName}
              </span>
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm md:text-base max-w-[65ch] leading-relaxed font-normal">
              Target Track: <strong className="text-white font-semibold">{targetRole}</strong>. 
              Accelerate your engineering execution with interactive IDE workspaces, AI career pathways, and cloud sync.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/student-os/ai">
                <Button size="lg" className="gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-md font-bold text-sm rounded-xl">
                  <Sparkles size={16} className="text-blue-600" /> Launch AI Assistant
                </Button>
              </Link>
              <Link href="/student-os/focus">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/15 bg-white/10 text-sm font-semibold rounded-xl">
                  <Focus size={16} /> Start Focus Session
                </Button>
              </Link>
            </div>
          </div>

          {/* Layer 3: Interactive Visual Preview Window */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/20 bg-slate-950/60 backdrop-blur-xl p-4 shadow-2xl text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-slate-300 ml-2 font-semibold">studentos.engine</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px] font-mono">
                  ACTIVE
                </Badge>
              </div>

              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                {(['roadmap', 'runtime', 'ai'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDemoTab(tab)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${
                      activeDemoTab === tab ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 font-mono text-xs text-slate-300 min-h-[105px] flex flex-col justify-center">
                {activeDemoTab === 'roadmap' && (
                  <div className="space-y-1">
                    <p className="text-emerald-400">✓ Target Track: {targetRole}</p>
                    <p className="text-slate-400">→ Active Phase: {milestones.find(m => m.status === 'in_progress')?.title || 'Foundations'}</p>
                    <p className="text-blue-400 text-[11px]">→ Completed Phases: {milestones.filter(m => m.status === 'completed').length}/{milestones.length || 1}</p>
                  </div>
                )}
                {activeDemoTab === 'runtime' && (
                  <div className="space-y-1">
                    <p className="text-blue-400">$ node compiler.js --watch</p>
                    <p className="text-slate-300">Compiled successfully in 42ms</p>
                    <p className="text-emerald-400">● 100% Tests Passed (8/8)</p>
                  </div>
                )}
                {activeDemoTab === 'ai' && (
                  <div className="space-y-1">
                    <p className="text-purple-400">⚡ Gemini 2.5 Pro Context Active</p>
                    <p className="text-slate-300">Ready to explain algorithms, review code & debug errors.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metric Cards Grid (Design Tokens: bg-white, border-slate-200, shadow-xs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action Items</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingTasks.length}</div>
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-semibold">
            <Activity size={12} /> {completedTasks.length} completed
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Duration</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Focus size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {focusMinutesToday} <span className="text-sm font-normal text-slate-500">mins</span>
          </div>
          <p className="text-xs text-indigo-600 mt-1 font-semibold">Sessions logged today</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule Events</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{events.length}</div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Synced in calendar</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Streak</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Flame size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {streakDays || 1} {streakDays === 1 ? 'Day' : 'Days'}
          </div>
          <p className="text-xs text-blue-600 mt-1 font-semibold">Active momentum</p>
        </div>
      </div>

      {/* ── Main Layout Grid Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare size={18} className="text-blue-600" /> Priorities & Sprints
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Tasks synchronized with your workspace</p>
              </div>
              <Link href="/student-os/tasks">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 rounded-xl">
                  View Board <ChevronRight size={14} />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 pt-4">
              {pendingTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-white flex items-center justify-between gap-4 transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      t.priority === 'high' ? 'bg-rose-500' : 'bg-blue-600'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 truncate">{t.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">
                    {t.dueDate || 'Soon'}
                  </span>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No pending tasks. Great job staying on track!
                </div>
              )}
            </div>
          </div>

          {/* Quick Tools Grid (Composable Component Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/student-os/coding">
              <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md group flex flex-col justify-between transition-all duration-200 shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Code2 size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Coding Workbench</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Multi-language compiler & algorithm sandbox.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                  Launch IDE <ChevronRight size={14} />
                </div>
              </div>
            </Link>

            <Link href="/student-os/roadmap">
              <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md group flex flex-col justify-between transition-all duration-200 shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Target size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Career Pathway</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Milestones towards {targetRole}.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  View Roadmap <ChevronRight size={14} />
                </div>
              </div>
            </Link>

            <Link href="/student-os/drive">
              <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md group flex flex-col justify-between transition-all duration-200 shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FolderOpen size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Cloud Drive</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Google Drive & document storage.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-sky-600 font-bold group-hover:translate-x-1 transition-transform">
                  Open Drive <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          {/* Active Roadmap Target */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target size={16} className="text-blue-600" /> Target Career Track
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{targetRole}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Roadmap Progress</span>
                  <span className="text-blue-600 font-mono">
                    {milestones.filter(m => m.status === 'completed').length} / {milestones.length || 1} Phases
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${milestones.length > 0 ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 : 25}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Link href="/student-os/roadmap">
                  <Button variant="outline" size="sm" className="w-full justify-center text-xs gap-1.5 font-bold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl">
                    View Full Roadmap <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" /> Upcoming Schedule
              </h3>
              <Link href="/student-os/calendar">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-blue-600 font-bold hover:bg-blue-50 rounded-lg">
                  Calendar
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((e) => (
                <div key={e.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{e.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {e.start ? new Date(e.start).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled Event'}
                  </p>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming events scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
