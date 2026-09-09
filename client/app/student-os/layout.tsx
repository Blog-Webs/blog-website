'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Clock, Globe, Search, ChevronRight, ChevronDown,
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, Command, Code2, MapPin, ClipboardList,
  TrendingUp, Brain, AlertTriangle, User as UserIcon, HelpCircle,
  Shield, Activity, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useStudentOS } from '@/context/StudentOSContext';

const SIDEBAR_GROUPS = [
  {
    title: '',
    items: [
      { href: '/student-os', label: 'Account home', icon: Home, exact: true },
      { href: '/student-os/tasks', label: 'Recents & Tasks', icon: Clock },
      { href: '/student-os/roadmap', label: 'Domains & Tracks', icon: Globe },
    ]
  },
  {
    title: 'Observe',
    items: [
      { href: '/student-os/assessment', label: 'Investigate & Tests', icon: Brain },
      { href: '/student-os/weak-areas', label: 'Analytics & Gaps', icon: Activity },
    ]
  },
  {
    title: 'Build',
    items: [
      { href: '/student-os/coding', label: 'Compute & IDE', icon: Code2 },
      { href: '/student-os/ai', label: 'AI Assistant', icon: Sparkles },
      { href: '/student-os/drive', label: 'Storage & Drive', icon: FolderOpen },
      { href: '/student-os/classroom', label: 'Classroom & Stream', icon: BookOpen },
      { href: '/student-os/gmail', label: 'Realtime Mail', icon: Mail },
    ]
  },
  {
    title: 'Protect & connect',
    items: [
      { href: '/student-os/focus', label: 'Focus Shield', icon: Shield },
      { href: '/student-os/career', label: 'Career Hub & Radar', icon: TrendingUp },
      { href: '/student-os/calendar', label: 'Calendar & Delivery', icon: Calendar },
      { href: '/student-os/profile', label: 'Account & Credentials', icon: UserIcon },
    ]
  }
];

export default function StudentOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const { isGoogleConnected, googleEmail, userName, userAvatar } = useStudentOS();

  const isActiveRoute = (item: any) => {
    if (item.exact || item.href === '/student-os') {
      return pathname === '/student-os';
    }
    return pathname.startsWith(item.href);
  };

  const userEmailDisplay = googleEmail || 'user@studentos.internal';

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased">
      {/* ── Precision Enterprise Header Bar ── */}
      <header className="sticky top-0 z-40 h-[52px] border-b border-gray-200 bg-white px-4 flex items-center justify-between">
        {/* Left: Brand Icon + Account Selector Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <Link href="/student-os" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Command size={14} />
              </div>
            </Link>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer text-xs font-medium text-gray-800 transition-colors">
              <span className="max-w-[180px] sm:max-w-[240px] truncate">{userEmailDisplay}</span>
              <ChevronDown size={13} className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 text-xs">
          <Link href="/student-os/ai">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <Sparkles size={14} className="text-blue-600" />
              <span>Ask AI</span>
            </button>
          </Link>

          <Link href="/docs">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <HelpCircle size={14} className="text-gray-500" />
              <span>Support</span>
            </button>
          </Link>

          <Link href="/student-os/profile" className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon size={14} />
            )}
          </Link>
        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Left Sidebar ── */}
        <aside className={`fixed lg:static top-[52px] bottom-0 left-0 z-40 ${sidebarCollapsed ? 'w-14' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Quick Search inside Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-xs text-gray-500 hover:border-gray-300 transition-colors shadow-2xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Search size={13} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={e => setQuickSearch(e.target.value)}
                    placeholder="Quick search..."
                    className="w-full bg-transparent border-none text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <kbd className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-200 shrink-0">
                  Ctrl K
                </kbd>
              </div>
            </div>
          )}

          {/* Navigation Groups */}
          <nav className="flex-1 p-2 overflow-y-auto space-y-4">
            {SIDEBAR_GROUPS.map((group, gIdx) => {
              const filteredItems = group.items.filter(i => 
                !quickSearch || i.label.toLowerCase().includes(quickSearch.toLowerCase())
              );
              if (filteredItems.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-0.5">
                  {group.title && !sidebarCollapsed && (
                    <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 tracking-normal">
                      {group.title}
                    </div>
                  )}
                  {filteredItems.map((item) => {
                    const active = isActiveRoute(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          active
                            ? 'bg-gray-100 text-gray-900 font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon size={15} className={active ? 'text-gray-900' : 'text-gray-400'} />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && !active && (
                          <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Bottom Sidebar Controls */}
          <div className="p-2 border-t border-gray-100 hidden lg:flex items-center justify-between text-xs text-gray-400">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
            </button>
            {!sidebarCollapsed && <span className="text-[10px] text-gray-400">StudentOS v3.0</span>}
          </div>
        </aside>

        {/* ── Main Viewport Canvas ── */}
        <main className="flex-1 overflow-y-auto bg-white p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
