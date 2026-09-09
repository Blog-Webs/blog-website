import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, Command, Code2, MapPin, ClipboardList,
  TrendingUp, Brain, AlertTriangle, Search, Bell, Globe, CheckCircle2,
  ShieldAlert, User as UserIcon, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentOSProvider, useStudentOS } from '@/context/StudentOSContext';
import { RoadmapProvider } from '@/context/RoadmapContext';
import { useAuth } from '../../core/context/AuthContext';

// Import StudentOS App Pages
import StudentOSDashboard from '../../../../app/student-os/page';
import TasksPage from '../../../../app/student-os/tasks/page';
import CodingPage from '../../../../app/student-os/coding/page';
import CalendarPage from '../../../../app/student-os/calendar/page';
import DrivePage from '../../../../app/student-os/drive/page';
import ClassroomPage from '../../../../app/student-os/classroom/page';
import GmailPage from '../../../../app/student-os/gmail/page';
import AiAssistantPage from '../../../../app/student-os/ai/page';
import OnboardingPage from '../../../../app/student-os/onboarding/page';
import DailyPlannerPage from '../../../../app/student-os/planner/page';
import RoadmapPage from '../../../../app/student-os/roadmap/page';
import AssessmentPage from '../../../../app/student-os/assessment/page';
import WeakAreasPage from '../../../../app/student-os/weak-areas/page';
import CareerDashboard from '../../../../app/student-os/career/page';
import FocusModePage from '../../../../app/student-os/focus/page';
import StudentProfilePage from '../../../../app/student-os/profile/page';

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
  { href: '/student-os/profile', label: 'Academic Profile', icon: UserIcon, badge: 'New' },
];

function StudentOSShell({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isGoogleConnected, googleEmail, connectGoogleWorkspace, userName, userAvatar, streakDays } = useStudentOS();

  const isActiveRoute = (href) => {
    if (href === '/student-os') {
      return location.pathname === '/student-os' || location.pathname === '/student-os/';
    }
    return location.pathname.startsWith(href);
  };

  let displayName = userName || 'StudentOS User';
  let avatarInitials = 'SO';
  try {
    const auth = useAuth();
    if (auth?.user?.displayName) {
      displayName = auth.user.displayName;
      avatarInitials = auth.user.displayName[0].toUpperCase();
    } else if (auth?.user?.name) {
      displayName = auth.user.name;
      avatarInitials = auth.user.name[0].toUpperCase();
    } else if (auth?.user?.email) {
      displayName = auth.user.email.split('@')[0];
      avatarInitials = auth.user.email[0].toUpperCase();
    }
  } catch (err) {}

  if (displayName === 'StudentOS User' && googleEmail) {
    displayName = googleEmail.split('@')[0];
    avatarInitials = googleEmail[0].toUpperCase();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Google Workspace Integration Banner */}
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

      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Menu size={18} />
          </button>

          <Link to="/student-os" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Command size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 font-sans">StudentOS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              v2.0 Connected
            </span>
          </Link>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-500 w-80 cursor-pointer hover:border-blue-300 hover:bg-white transition-colors">
          <Search size={14} className="text-slate-400" />
          <span className="flex-1">Search tasks, courses, code files...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-500 border border-slate-200 font-mono shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-3">
          {/* Daily Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs">
            <Flame size={13} className="text-blue-600 fill-blue-600 animate-pulse" />
            <span>{streakDays || 1} Day Streak</span>
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

          {/* User Profile Pill -> Links directly to /student-os/profile */}
          <Link
            to="/student-os/profile"
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity"
            title="Open Academic Profile"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-blue-500 shadow-sm"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {avatarInitials}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">{displayName}</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside className={`fixed lg:static top-14 bottom-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Core Workspace
            </div>
            {MAIN_NAV.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <item.icon size={15} className={active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Career & Roadmap
            </div>
            {CAREER_NAV.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <item.icon size={15} className={active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Intelligence & Profile
            </div>
            {INTELLIGENCE_NAV.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <item.icon size={15} className={active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && <Badge variant="apple" className="py-0 text-[9px] bg-blue-600 text-white border-0">{item.badge}</Badge>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function StudentOSRoutes() {
  return (
    <StudentOSProvider>
      <RoadmapProvider>
        <StudentOSShell>
          <Routes>
            <Route index element={<StudentOSDashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="coding" element={<CodingPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="drive" element={<DrivePage />} />
            <Route path="classroom" element={<ClassroomPage />} />
            <Route path="gmail" element={<GmailPage />} />
            <Route path="ai" element={<AiAssistantPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="planner" element={<DailyPlannerPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="weak-areas" element={<WeakAreasPage />} />
            <Route path="career" element={<CareerDashboard />} />
            <Route path="focus" element={<FocusModePage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Routes>
        </StudentOSShell>
      </RoadmapProvider>
    </StudentOSProvider>
  );
}