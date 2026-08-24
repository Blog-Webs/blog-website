'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, CheckSquare, Calendar, Focus, Code2, ArrowUpRight, FolderOpen,
  Flame, Trophy, Clock, Target, ChevronRight, Activity, Zap, TrendingUp
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
      {/* Brevo SaaS Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 p-6 md:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-start md:items-center gap-6 w-full">
          <div className="w-full space-y-3">
            <div className="inline-flex items-center gap-2">
              <Badge variant="apple" className="gap-1 px-3.5 py-1 text-xs font-bold shadow-xs">
                <Sparkles size={13} /> Academic Operating System
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-[650px] w-full leading-relaxed">
              Target Track: <strong className="text-slate-200 font-semibold">{targetRole}</strong>. All system diagnostics, focus records, and tasks are synced.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/student-os/ai">
              <Button variant="apple" size="lg" className="gap-2 shadow-md shadow-emerald-500/20">
                <Sparkles size={16} /> Launch AI Tutor
              </Button>
            </Link>
            <Link href="/student-os/focus">
              <Button variant="secondary" size="lg" className="gap-2">
                <Focus size={16} className="text-emerald-400" /> Start Focus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (SaaS Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Items</CardTitle>
            <CheckSquare size={18} className="text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{pendingTasks.length}</div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <Activity size={12} /> {completedTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus Duration</CardTitle>
            <Focus size={18} className="text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{focusMinutesToday} <span className="text-sm font-normal text-slate-500">mins</span></div>
            <p className="text-xs text-purple-400 mt-1 font-semibold">3 sessions logged today</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule Events</CardTitle>
            <Calendar size={18} className="text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{events.length}</div>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Next lecture in 2 hours</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Streak</CardTitle>
            <Flame size={18} className="text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</div>
            <p className="text-xs text-amber-400 mt-1 font-semibold">Daily visit streak active</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 font-bold">
                  <CheckSquare size={18} className="text-emerald-400" /> Priorities & Sprints
                </CardTitle>
                <CardDescription>Tasks synchronized with Express backend API</CardDescription>
              </div>
              <Link href="/student-os/tasks">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-emerald-400 font-bold hover:text-emerald-300">
                  View Board <ChevronRight size={14} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      t.priority === 'high' ? 'bg-rose-500 shadow-xs shadow-rose-500/50' : 'bg-emerald-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{t.title}</p>
                      <p className="text-xs text-slate-400 truncate">{t.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {t.dueDate}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/student-os/coding">
              <Card className="h-full hover:border-emerald-500/50 group flex flex-col justify-between p-5 transition-all duration-200">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Code2 size={20} />
                  </div>
                  <h3 className="font-bold text-white text-sm">Coding Workbench</h3>
                  <p className="text-xs text-slate-400 mt-1">Multi-language compiler & LeetCode sandbox.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                  Launch IDE <ChevronRight size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/student-os/roadmap">
              <Card className="h-full hover:border-teal-500/50 group flex flex-col justify-between p-5 transition-all duration-200">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Target size={20} />
                  </div>
                  <h3 className="font-bold text-white text-sm">AI Career Pathway</h3>
                  <p className="text-xs text-slate-400 mt-1">Milestones towards {targetRole}.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-teal-400 font-bold group-hover:translate-x-1 transition-transform">
                  View Roadmap <ChevronRight size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/student-os/drive">
              <Card className="h-full hover:border-purple-500/50 group flex flex-col justify-between p-5 transition-all duration-200">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FolderOpen size={20} />
                  </div>
                  <h3 className="font-bold text-white text-sm">Cloud Drive</h3>
                  <p className="text-xs text-slate-400 mt-1">Google Drive & document storage.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">
                  Open Drive <ChevronRight size={14} />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Sidebar Widget Column */}
        <div className="space-y-6">
          {/* Active Roadmap Target */}
          <Card className="bg-gradient-to-b from-slate-900/90 to-slate-950 border-emerald-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Target size={16} className="text-emerald-400" /> Target Career Track
                </CardTitle>
                <Badge variant="apple" className="text-[10px]">Active</Badge>
              </div>
              <CardDescription className="text-xs text-slate-400 font-semibold">{targetRole}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Roadmap Progress</span>
                  <span className="text-emerald-400 font-mono">
                    {milestones.filter(m => m.status === 'completed').length} / {milestones.length || 1} Phases
                  </span>
                </div>
                <Progress
                  value={milestones.length > 0 ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 : 25}
                  className="h-2 bg-slate-800"
                />
              </div>

              <div className="pt-2">
                <Link href="/student-os/roadmap">
                  <Button variant="outline" size="sm" className="w-full justify-center text-xs gap-1.5 font-bold">
                    View Full Roadmap <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-blue-400" /> Upcoming Schedule
              </CardTitle>
              <Link href="/student-os/calendar">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-blue-400 font-bold">
                  Calendar
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.slice(0, 3).map((e) => (
                <div key={e.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <p className="text-xs font-bold text-white truncate">{e.title}</p>
                  <p className="text-[10px] text-slate-400">{e.start ? new Date(e.start).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled Event'}</p>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">No upcoming events scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
