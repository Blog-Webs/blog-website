import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, X, Plug, Unplug, ChevronLeft, GraduationCap,
  MessageSquare, Code
} from 'lucide-react';
import { useStudentOS } from '../context/StudentOSContext';
import { useAuth } from '../../core/context/AuthContext';

const MAIN_NAV = [
  { to: '/student-os', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student-os/classroom', label: 'Classroom', icon: BookOpen },
  { to: '/student-os/drive', label: 'Drive', icon: FolderOpen },
  { to: '/student-os/gmail', label: 'Gmail', icon: Mail },
  { to: '/student-os/calendar', label: 'Calendar', icon: Calendar },
  { to: '/student-os/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/student-os/coding', label: 'Coding Practice', icon: Code },
];

const INTELLIGENCE_NAV = [
  { to: '/student-os/ai', label: 'AI Assistant', icon: Sparkles, badge: 'Ai' },
  { to: '/student-os/focus', label: 'Focus Mode', icon: Focus },
];

const navCls = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
    isActive
      ? 'sos-nav-active'
      : 'sos-nav-item'
  }`;

const StudentOSLayout = () => {
  const { connected, googleEmail, connect, disconnect } = useStudentOS();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sos-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`sos-sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="sos-sidebar-logo">
          <div className="flex items-center gap-2.5">
            <div className="sos-logo-icon">
              <GraduationCap size={16} color="white" />
            </div>
            <div>
              <p className="sos-logo-name">StudentOS</p>
              <p className="sos-logo-sub">AI ACADEMIC HUB</p>
            </div>
          </div>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X size={16} style={{ color: 'var(--sos-text-muted)' }} />
          </button>
        </div>

        {/* User Profile Card */}
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
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navCls}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={16} className="sos-nav-icon shrink-0" />
              <span>{item.label}</span>
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
              <span className="flex-1">{item.label}</span>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="sos-mobile-bar lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg">
            <Menu size={18} style={{ color: 'var(--sos-text-muted)' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="sos-logo-icon" style={{ width: 24, height: 24 }}>
              <GraduationCap size={12} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--sos-text)' }}>StudentOS</span>
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
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentOSLayout;
