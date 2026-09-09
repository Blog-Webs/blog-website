'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search, Folder, MousePointer, Lock, Plus, ArrowRight,
  Sparkles, CheckSquare, Calendar, Focus, Code2, Globe,
  Activity, Clock, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useStudentOS } from '@/context/StudentOSContext';
import { useRoadmap } from '@/context/RoadmapContext';

export default function StudentOSDashboard() {
  const { tasks, events, focusMinutesToday, streakDays } = useStudentOS();
  const { milestones, targetRole, setTargetRole } = useRoadmap();

  const [domainInput, setDomainInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainInput.trim()) {
      setTargetRole(domainInput.trim());
      setDomainInput('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-sans antialiased text-gray-900 pb-12">
      {/* ── Top Header Section (Announcement + Title + Search) ── */}
      <div className="flex flex-col items-center text-center space-y-5 pt-4">
        {/* Announcement Pill */}
        <Link
          href="/student-os/onboarding"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50/80 shadow-xs transition-all"
        >
          <span>Onboard your agent to StudentOS</span>
          <span className="flex items-center gap-1">💥 👥 🗄️</span>
        </Link>

        {/* Main Clean Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Time to build something great.
        </h1>

        {/* Big Central Search Input */}
        <div className="w-full max-w-2xl relative">
          <div className="flex items-center justify-between px-3.5 h-11 rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-xs transition-all">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent border-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <kbd className="text-[11px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── The 3 Precision Hero Cards (Exact Cloudflare / Enterprise Layout) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ship something new (Dashed Drop Zone) */}
        <div className="border border-gray-200 rounded-xl bg-white p-5 flex flex-col justify-between hover:border-gray-300 shadow-xs transition-all">
          <div>
            {/* Visual Area */}
            <Link href="/student-os/drive" className="block">
              <div className="border-2 border-dashed border-gray-200 rounded-xl h-44 bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center p-4 relative group cursor-pointer transition-colors">
                <div className="relative mb-2">
                  <div className="w-12 h-10 rounded-md border border-gray-200 bg-white shadow-xs flex items-center justify-center text-gray-400 group-hover:border-blue-300 transition-colors">
                    <Folder size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <MousePointer size={14} className="text-orange-500 fill-orange-500 absolute -bottom-1.5 -right-1.5 rotate-[-20deg]" />
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Drop a folder, or a zip</p>
              </div>
            </Link>

            {/* Content */}
            <h3 className="text-sm font-semibold text-gray-900 mt-4">Ship something new</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Deploy simple sites or full-stack apps with integrated compute, AI, storage, and media services.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-5 pt-2">
            <Link href="/student-os/coding">
              <button className="rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 px-3.5 py-1.5 shadow-xs transition-colors">
                Create app
              </button>
            </Link>
          </div>
        </div>

        {/* Card 2: Add a domain / Career Track */}
        <div className="border border-gray-200 rounded-xl bg-white p-5 flex flex-col justify-between hover:border-gray-300 shadow-xs transition-all">
          <div>
            {/* Visual Area: Mockup Domain / Track Rows */}
            <Link href="/student-os/roadmap" className="block">
              <div className="border border-gray-100 rounded-xl h-44 bg-gray-50/40 hover:bg-gray-50/80 flex flex-col items-center justify-center p-4 space-y-2.5 cursor-pointer transition-colors">
                <div className="w-full max-w-[210px] bg-white border border-gray-200 rounded-full px-3 py-1.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="w-16 h-2 rounded-full bg-orange-100" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-[10px] font-bold">
                    +
                  </div>
                </div>

                <div className="w-full max-w-[210px] bg-white border border-gray-200 rounded-full px-3 py-1.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="w-20 h-2 rounded-full bg-orange-100" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-[10px] font-bold">
                    +
                  </div>
                </div>

                <div className="w-24 h-2 rounded-full bg-gray-200/80 mt-1" />
              </div>
            </Link>

            {/* Content */}
            <h3 className="text-sm font-semibold text-gray-900 mt-4">Add a domain & career track</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Register a target engineering track ({targetRole}) or bring your own. Free roadmap synthesis, automatic diagnostic tests, and AI tutoring included.
            </p>
          </div>

          {/* Action Input / Submit */}
          <form onSubmit={handleDomainSubmit} className="mt-5 pt-2">
            <div className="relative">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Type in your domain..."
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </form>
        </div>

        {/* Card 3: Protect apps and users (Wireframe Lock) */}
        <div className="border border-gray-200 rounded-xl bg-white p-5 flex flex-col justify-between hover:border-gray-300 shadow-xs transition-all">
          <div>
            {/* Visual Area: Browser Window Wireframe */}
            <Link href="/student-os/coding" className="block">
              <div className="border border-gray-100 rounded-xl h-44 bg-gray-50/40 hover:bg-gray-50/80 flex flex-col justify-between p-3.5 cursor-pointer transition-colors">
                {/* Browser top dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                </div>

                {/* Center Lock */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center">
                    <Lock size={16} className="text-orange-500" />
                  </div>
                </div>

                <div className="w-12 h-1.5 rounded-full bg-gray-200 self-center" />
              </div>
            </Link>

            {/* Content */}
            <h3 className="text-sm font-semibold text-gray-900 mt-4">Protect apps and users</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Modern access control, private networking and security for your users, devices, code sandboxes, and cloud storage.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-5 pt-2">
            <Link href="/student-os/focus">
              <button className="rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 px-3.5 py-1.5 shadow-xs transition-colors">
                Protect your app
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Secondary Section: Quick Status & Workspace Recents ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
        {/* Recents / Priorities */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Recent Tasks & Sprints</h2>
            </div>
            <Link href="/student-os/tasks" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all tasks →
            </Link>
          </div>

          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    t.priority === 'high' ? 'bg-rose-500' : 'bg-blue-600'
                  }`} />
                  <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                </div>
                <span className="text-[11px] text-gray-500 shrink-0 font-medium">
                  {t.dueDate || 'Soon'}
                </span>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">No pending tasks. You are all caught up.</p>
            )}
          </div>
        </div>

        {/* System Overview / Stats */}
        <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Workspace Health</h2>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Active Track</span>
              <span className="font-semibold text-gray-800">{targetRole}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Roadmap Progress</span>
              <span className="font-semibold text-gray-800 font-mono">
                {milestones.filter(m => m.status === 'completed').length}/{milestones.length || 1} Phases
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Focus Duration</span>
              <span className="font-semibold text-gray-800">{focusMinutesToday} mins</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Active Streak</span>
              <span className="font-semibold text-gray-800">{streakDays || 1} Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
