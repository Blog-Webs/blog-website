'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, X, Command, Code2, MapPin, ClipboardList,
  TrendingUp, Brain, AlertTriangle, Search, Bell, Globe, CheckCircle2, ShieldAlert,
  Flame, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudentOS } from '@/context/StudentOSContext';

const MAIN_NAV = [
  { href: '/student-os', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student-os/tasks', label: 'Kanban Tasks', icon: CheckSquare },
  { href: '/student-os/coding', label: 'Coding Workbench', icon: Code2 },
  { href: '/student-os/calendar', label: 'Calendar', icon: Calendar },
  { href: '/student-os/drive', label: 'Cloud Drive', icon: FolderOpen },
  { href: '/student-os/classroom', label: 'Google Classroom', icon: BookOpen },
  { href: '/student-os/gmail', label: 'Gmail Hub', icon: Mail },
];

const CAREER_NAV = [
  { href: '/student-os/roadmap', label: 'AI Roadmap', icon: MapPin },
  { href: '/student-os/planner', label: 'Daily Planner', icon: ClipboardList },
  { href: '/student-os/career', label: 'Career Hub', icon: TrendingUp },
  { href: '/student-os/assessment', label: 'Skill Diagnostic', icon: Brain },
  { href: '/student-os/weak-areas', label: 'Weak Areas', icon: AlertTriangle },
];

const INTELLIGENCE_NAV = [
  { href: '/student-os/ai', label: 'AI Assistant', icon: Sparkles, badge: 'Pro' },
  { href: '/student-os/focus', label: 'Focus Mode', icon: Focus },
  { href: '/student-os/profile', label: 'Academic Profile', icon: UserIcon },
];

export default function StudentOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isGoogleConnected, googleEmail, userName, userAvatar, streakDays, connectGoogleWorkspace } = useStudentOS();

  const isActiveRoute = (href: string) => {
    if (href === '/student-os') return pathname === '/student-os';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* ── Google Workspace Integration Banner (when disconnected) ── */}
      {!isGoogleConnected && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-b border-blue-200 px-4 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-2 text-blue-950 font-medium">
            <Globe size={14} className="text-blue-600 shrink-0" />
            <span>Connect your <strong>Google Workspace</strong> (Classroom, Drive, Gmail, Calendar) to sync real live data.</span>
          </div>
          <Button
            onClick={connectGoogleWorkspace}
            variant="default"
            size="sm"
            className="h-7 text-[11px] px-3 gap-1 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Sparkles size={12} /> Connect Google Account
          </Button>
        </div>
      )}

      {/* ── SaaS Header Bar ── */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-2xl px-4 lg:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu size={18} />
          </button>

          <Link href="/student-os" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Command size={16} />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">StudentOS</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              v3.0 Connected
            </span>
          </Link>
        </div>

        {/* Center Search Trigger */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs text-slate-500 w-80 cursor-pointer hover:border-blue-300 hover:bg-white transition-all shadow-xs">
          <Search size={14} className="text-slate-400" />
          <span className="flex-1">Search tasks, courses, code files...</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-white text-[10px] text-slate-500 border border-slate-200 font-mono shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Streak, Connection & User Profile Header */}
        <div className="flex items-center gap-3">
          {/* Daily Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
            <Flame size={14} className="text-blue-600 animate-pulse fill-blue-600" />
            <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Streak</span>
          </div>

          {isGoogleConnected ? (
            <Badge variant="success" className="hidden sm:flex items-center gap-1 text-[10px] py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 size={11} /> {googleEmail || 'Google Connected'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1 text-[10px] py-1 text-slate-600 bg-slate-100 border-slate-200">
              <ShieldAlert size={11} className="text-blue-600" /> Standalone Mode
            </Badge>
          )}

          <Link href="/student-os/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover border border-blue-400 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {userName ? userName.slice(0, 2).toUpperCase() : 'SO'}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[130px] truncate">
              {userName || 'StudentOS User'}
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Left Sidebar (Clean White & Blue SaaS Aesthetic) ── */}
        <aside className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Core Workspace
            </div>
            {MAIN_NAV.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <item.icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Career & Roadmap
            </div>
            {CAREER_NAV.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <item.icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Intelligence
            </div>
            {INTELLIGENCE_NAV.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <item.icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && <Badge variant="apple" className="py-0 text-[9px] bg-blue-600 text-white border-0">{item.badge}</Badge>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Viewport Panel ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
