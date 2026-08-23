'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, CheckSquare, Calendar, Focus, Code2, ArrowUpRight, FolderOpen,
  Flame, Trophy, Clock, Target, ChevronRight, Activity, Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStudentOS } from '@/context/StudentOSContext';
import { useRoadmap } from '@/context/RoadmapContext';
import { useAuth } from '@/modules/core/context/AuthContext';

export default function StudentOSDashboard() {
  const { tasks, events, focusMinutesToday, googleEmail } = useStudentOS();
  const { milestones, targetRole } = useRoadmap();

  let displayName = 'Student';
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
  if (displayName === 'Student' && googleEmail) {
    displayName = googleEmail.split('@')[0];
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Apple-style Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 md:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-start md:items-center gap-6 w-full">
          <div className="w-full space-y-3">
            <div className="inline-flex items-center gap-2">
              <Badge variant="apple" className="gap-1 px-3 py-1 text-xs">
                <Sparkles size={13} /> Academic Operating System
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-white via-zinc-200 to-blue-400 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-[650px] w-full leading-relaxed">
              Target Track: <strong className="text-zinc-200 font-semibold">{targetRole}</strong>. All system diagnostics, focus records, and tasks are synced.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/student-os/ai">
              <Button variant="apple" size="lg" className="gap-2">
                <Sparkles size={16} /> Launch AI Tutor
              </Button>
            </Link>
            <Link href="/student-os/focus">
              <Button variant="secondary" size="lg" className="gap-2">
                <Focus size={16} className="text-blue-400" /> Start Focus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (shadcn Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Action Items</CardTitle>
            <CheckSquare size={18} className="text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingTasks.length}</div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <Activity size={12} /> {completedTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Focus Duration</CardTitle>
            <Focus size={18} className="text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{focusMinutesToday} <span className="text-sm font-normal text-zinc-500">mins</span></div>
            <p className="text-xs text-purple-400 mt-1 font-medium">3 sessions logged today</p>
          </CardContent>
        </Card>

        <Card className="hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Schedule Events</CardTitle>
            <Calendar size={18} className="text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{events.length}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Next lecture in 2 hours</p>
          </CardContent>
        </Card>

        <Card className="hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Study Streak</CardTitle>
            <Flame size={18} className="text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">7 Days</div>
            <p className="text-xs text-amber-400 mt-1 font-medium">Consistency badge active</p>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare size={18} className="text-blue-400" /> Priorities & Sprints
                </CardTitle>
                <CardDescription>Tasks synchronized with Express backend API</CardDescription>
              </div>
              <Link href="/student-os/tasks">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-400">
                  View Board <ChevronRight size={14} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === 'high' ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-blue-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{t.title}</p>
                      <p className="text-xs text-zinc-400 truncate">{t.description}</p>
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
              <Card className="h-full hover:border-blue-500/50 group flex flex-col justify-between p-5">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Code2 size={20} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Coding Workbench</h3>
                  <p className="text-xs text-zinc-400 mt-1">Multi-language compiler & LeetCode sandbox.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Launch IDE <ChevronRight size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/student-os/roadmap">
              <Card className="h-full hover:border-emerald-500/50 group flex flex-col justify-between p-5">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Target size={20} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">AI Career Pathway</h3>
                  <p className="text-xs text-zinc-400 mt-1">Milestones towards {targetRole}.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  View Roadmap <ChevronRight size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/student-os/drive">
              <Card className="h-full hover:border-purple-500/50 group flex flex-col justify-between p-5">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FolderOpen size={20} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Cloud Drive</h3>
                  <p className="text-xs text-zinc-400 mt-1">Document preview & cloud storage.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Open Files <ChevronRight size={14} />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Schedule & Roadmap Progress Widget */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={16} className="text-emerald-400" /> Today's Schedule
              </CardTitle>
              <Link href="/student-os/calendar" className="text-xs text-emerald-400 hover:underline">Full Calendar</Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-3">
                  <div className="w-1.5 h-9 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#3b82f6' }} />
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">{evt.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{evt.start}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-zinc-950 to-indigo-950/20 border-indigo-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy size={16} className="text-indigo-400" /> Active Milestone
              </CardTitle>
              <Badge variant="apple" className="text-[10px]">50% Completed</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {milestones[1] && (
                <>
                  <p className="text-xs font-semibold text-zinc-200">{milestones[1].title}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{milestones[1].description}</p>
                  <Progress value={50} className="mt-2" />
                </>
              )}
              <Link href="/student-os/roadmap" className="block pt-2">
                <Button variant="secondary" className="w-full text-xs h-8">
                  Continue Phase
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
