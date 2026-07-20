import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, X, ChevronLeft, GraduationCap,
  MessageSquare, Code, Map, ClipboardList, TrendingUp, Brain, AlertTriangle
} from 'lucide-react';
import { useStudentOS } from '../context/StudentOSContext';
import { useAuth } from '../../core/context/AuthContext';
import { RoadmapProvider } from '../context/RoadmapContext';

const MAIN_NAV = [
  { to: '/student-os', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student-os/classroom', label: 'Google Classroom', icon: BookOpen },
  { to: '/student-os/drive', label: 'Google Drive', icon: FolderOpen },
  { to: '/student-os/gmail', label: 'Gmail Hub', icon: Mail },
  { to: '/student-os/calendar', label: 'Calendar', icon: Calendar },
  { to: '/student-os/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/student-os/coding', label: 'Coding Practice', icon: Code },
];

const CAREER_NAV = [
  { to: '/student-os/roadmap', label: 'My Roadmap', icon: Map },
  { to: '/student-os/planner', label: 'Daily Planner', icon: ClipboardList },
  { to: '/student-os/career', label: 'Career Hub', icon: TrendingUp },
  { to: '/student-os/assessment', label: 'Skill Assessment', icon: Brain },
  { to: '/student-os/weak-areas', label: 'Weak Areas', icon: AlertTriangle },
];

const INTELLIGENCE_NAV = [
  { to: '/student-os/ai', label: 'AI Assistant', icon: Sparkles, badge: 'Ai' },
  { to: '/student-os/focus', label: 'Focus Mode', icon: Focus },
];

const StudentOSLayoutContent = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navCls = ({ isActive }) =>
    `sos-nav-item ${isActive ? 'sos-nav-active' : ''}`;

  return (
    <div className="sos-shell">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sos-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sos-sidebar-logo">
          <div className="flex items-center gap-2.5">
            <div className="sos-logo-icon">
              <GraduationCap size={16} color="white" />
            </div>
            <div>
              <div className="sos-logo-name">StudentOS</div>
              <div className="sos-logo-sub">Academic Operating System</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/5 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="sos-user-card">
            <div className="sos-user-avatar">
              {user.avatar
                ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded" />
                : <span className="text-xs font-bold text-white">{user.name?.[0]}</span>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="sos-user-name truncate">{user.name}</p>
              <p className="sos-user-email truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navCls}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={16} className="sos-nav-icon shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </NavLink>
          ))}

          {/* AI Career & Roadmap Navigation */}
          <div className="sos-section-label">CAREER & ROADMAP AI</div>
          {CAREER_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navCls}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={16} className="sos-nav-icon shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </NavLink>
          ))}

          {/* Intelligence section */}
          <div className="sos-section-label">INTELLIGENCE</div>
          {INTELLIGENCE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navCls}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={16} className="sos-nav-icon shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="sos-ai-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div className="sos-sidebar-footer">
          <NavLink
            to="/"
            className="sos-back-link"
          >
            <ChevronLeft size={14} />
            Back to httpTechNex
          </NavLink>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile topbar */}
        <div className="sos-mobile-bar lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-400 hover:text-white">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="sos-logo-icon" style={{ width: 24, height: 24 }}>
              <GraduationCap size={12} color="white" />
            </div>
            <span className="font-bold text-sm text-white">StudentOS</span>
          </div>
        </div>

        {/* Floating chat button */}
        <NavLink
          to="/student-os/ai"
          className="sos-chat-fab"
          title="AI Assistant"
        >
          <MessageSquare size={20} color="white" />
        </NavLink>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0d1117]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function StudentOSLayout() {
  return (
    <RoadmapProvider>
      <StudentOSLayoutContent />
    </RoadmapProvider>
  );
}
