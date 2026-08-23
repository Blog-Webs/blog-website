import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, Command, Code2, MapPin, ClipboardList,
  TrendingUp, Brain, AlertTriangle, Search, Bell, Globe, CheckCircle2, ShieldAlert
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
];

function StudentOSShell({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isGoogleConnected, googleEmail, connectGoogleWorkspace } = useStudentOS();

  const isActiveRoute = (href) => {
    if (href === '/student-os') {
      return location.pathname === '/student-os' || location.pathname === '/student-os/';
    }
    return location.pathname.startsWith(href);
  };

  let displayName = 'StudentOS User';
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
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 font-sans">
      {/* Google Workspace Integration Banner */}
      {!isGoogleConnected && (
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-zinc-950 border-b border-blue-500/20 px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-2 text-zinc-200 font-medium">
            <Globe size={14} className="text-blue-400 shrink-0" />
            <span>Connect your <strong>Google Workspace</strong> (Classroom, Drive, Gmail, Calendar) to sync real live data.</span>
          </div>
          <Button
            onClick={connectGoogleWorkspace}
            variant="apple"
            size="sm"
            className="h-7 text-[11px] px-3 gap-1 shrink-0"
          >
            <Sparkles size={12} /> Connect Google Account
          </Button>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Menu size={18} />
          </button>

          <Link to="/student-os" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Command size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-sans">StudentOS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700/50">
              v2.0 API Connected
            </span>
          </Link>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 w-80 cursor-pointer hover:border-zinc-700 transition-colors">
          <Search size={14} className="text-zinc-500" />
          <span className="flex-1">Search tasks, courses, code files...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-3">
          {isGoogleConnected ? (
            <Badge variant="success" className="hidden sm:flex items-center gap-1 text-[10px] py-1">
              <CheckCircle2 size={11} /> {googleEmail || 'Google Connected'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1 text-[10px] py-1 text-zinc-400">
              <ShieldAlert size={11} className="text-amber-400" /> Standalone Mode
            </Badge>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 text-zinc-950 font-bold text-xs flex items-center justify-center shadow-sm">
              {avatarInitials}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-zinc-200">{displayName}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside className={`fixed lg:static top-14 bottom-0 left-0 z-40 w-60 bg-zinc-950/90 border-r border-zinc-800/80 backdrop-blur-xl flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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
                      ? 'bg-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <item.icon size={15} className={active ? 'text-blue-400' : 'text-zinc-500'} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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
                      ? 'bg-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <item.icon size={15} className={active ? 'text-blue-400' : 'text-zinc-500'} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Intelligence
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
                      ? 'bg-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <item.icon size={15} className={active ? 'text-blue-400' : 'text-zinc-500'} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && <Badge variant="apple" className="py-0 text-[9px]">{item.badge}</Badge>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#09090b]">
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
          </Routes>
        </StudentOSShell>
      </RoadmapProvider>
    </StudentOSProvider>
  );
}
