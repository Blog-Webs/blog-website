import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, Mail, Calendar, CheckSquare,
  Sparkles, Focus, Menu, X, Plug, Unplug, ChevronRight, Zap
} from 'lucide-react';
import { useStudentOS } from '../context/StudentOSContext';
import { useAuth } from '../../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/student-os', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student-os/classroom', label: 'Classroom', icon: BookOpen },
  { to: '/student-os/drive', label: 'Drive', icon: FolderOpen },
  { to: '/student-os/gmail', label: 'Gmail', icon: Mail },
  { to: '/student-os/calendar', label: 'Calendar', icon: Calendar },
  { to: '/student-os/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/student-os/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/student-os/focus', label: 'Focus Mode', icon: Focus },
];

const navCls = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]'
  }`;

const StudentOSLayout = () => {
  const { connected, googleEmail, connect, disconnect } = useStudentOS();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}
                >
                  <Zap size={15} color="white" />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>StudentOS</p>
                  <p className="text-[10px] font-mono-display" style={{ color: 'var(--accent)' }}>AI Academic Hub</p>
                </div>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="mt-3 flex items-center gap-2">
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Connection status */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          {connected ? (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ backgroundColor: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.3)' }}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#5EEAD4' }}>Connected</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{googleEmail}</p>
                </div>
              </div>
              <button
                onClick={disconnect}
                title="Disconnect Google Workspace"
                className="p-1 rounded btn-press"
                style={{ color: 'var(--text-muted)' }}
              >
                <Unplug size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              <Plug size={13} /> Connect Google Workspace
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navCls}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={16} />
              {item.label}
              {item.label === 'AI Assistant' && (
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent), #5EEAD4)', color: 'white' }}
                >
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl btn-press"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronRight size={13} className="rotate-180" />
            Back to httpTechNex
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg btn-press">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={15} style={{ color: 'var(--accent)' }} />
            <span className="font-bold text-sm">StudentOS</span>
          </div>
        </div>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentOSLayout;
