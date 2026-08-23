import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Cloud, 
  Bot, 
  Settings, 
  Search, 
  Bell, 
  Plus,
  TerminalSquare,
  Users,
  Check
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await adminApi.getNotifications();
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const getBreadcrumb = () => {
    if (location.pathname.includes('/blogs') || location.pathname.includes('/editor')) {
      return (
        <>
          <span className="text-on-surface-variant">Admin</span>
          <ChevronRightIcon />
          <span className="text-[#818CF8] font-medium">Blogs & Media</span>
        </>
      );
    }
    return (
      <>
        <span className="text-on-surface-variant">Workspace</span>
        <ChevronRightIcon />
        <span className="text-[#abc4ff] font-medium font-mono">Command Center</span>
      </>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-on-surface selection:bg-[#818CF8]/30">
      
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[260px] shrink-0 border-r border-[#1C202B] bg-[#0E1015] hidden md:flex flex-col relative z-20">
        
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#1C202B]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4375FF] flex items-center justify-center shadow-lg shadow-[#4375FF]/20">
              <TerminalSquare size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white flex flex-col">
              HTTPTechNex
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-mono font-normal">Admin Console</span>
            </span>
          </Link>
        </div>

        {/* Action Button */}
        <div className="px-5 mt-6 mb-4">
          <button
            onClick={() => navigate('/admin-portal/blogs')}
            className="w-full py-2.5 bg-[#4375FF] hover:bg-[#3460E0] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-[#4375FF]/20 cursor-pointer"
          >
            <Plus size={16} /> New Post / Deployment
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-0.5 px-3">
            <NavLink to="/admin-portal" end className={navLinkClass}>
              <TerminalSquare size={16} /> Dash Board
            </NavLink>
            <NavLink to="/admin-portal/studentos-users" className={navLinkClass}>
              <Users size={16} /> StudentOS Students
            </NavLink>
            <NavLink to="/admin-portal/content" className={navLinkClass}>
              <BookOpen size={16} /> Curriculum
            </NavLink>
            <NavLink to="/admin-portal/blogs" className={navLinkClass}>
              <FileText size={16} /> Blogs & Media
            </NavLink>
            <NavLink to="/admin-portal/contact" className={navLinkClass}>
              <Cloud size={16} /> Contact Inbox
            </NavLink>
            <NavLink to="/admin-portal/subscribers" className={navLinkClass}>
              <Users size={16} /> Subscribers
            </NavLink>
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-[#1C202B]">
          <nav className="space-y-0.5">
            <Link to="/admin-portal" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-white transition-colors">
              <Settings size={16} /> Systems Status
            </Link>
            <Link to="/admin-portal/contact" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-white transition-colors">
              <HelpIcon /> Support Inbox
            </Link>
          </nav>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D3342 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.3 }} />
        
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-[#1C202B] bg-[#0E1015]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 relative z-50">
          
          <div className="flex items-center gap-2 text-xs font-mono tracking-wide hidden sm:flex">
            {getBreadcrumb()}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative hidden md:flex items-center">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10" />
              <input 
                type="text" 
                placeholder="Search blogs, subjects, or users..." 
                className="w-64 lg:w-80 bg-[#111113] border border-[#2D3342] text-xs text-white rounded-full py-2 pl-9 pr-14 focus:outline-none focus:border-[#4375FF] transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="bg-[#1C202B] border border-[#2D3342] text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-mono leading-none">⌘K</kbd>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-l border-[#2D3342] pl-5 relative">
              <button onClick={() => navigate('/admin-portal')} className="text-on-surface-variant hover:text-white transition-colors" title="Dashboard">
                <LayoutDashboard size={16} />
              </button>

              {/* Notification Icon */}
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="text-on-surface-variant hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0E1015] animate-pulse"></span>
                )}
              </button>

              {/* Inline Notification Popup */}
              {showNotifications && (
                <div className="absolute top-10 right-0 w-80 bg-[#111113] border border-[#1C202B] rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#1C202B] flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">System Events</h4>
                    <span className="text-[10px] text-on-surface-variant font-mono">{notifications.length} logs</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#1C202B]">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-on-surface-variant text-center font-mono">No recent system notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`px-4 py-3 hover:bg-[#161B22] transition-colors cursor-pointer ${!n.read ? 'bg-[#4375FF]/5' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-white">{n.type || 'Event'}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Extracted NavLink style function matching the screenshots
const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 relative overflow-hidden group ${
    isActive 
      ? 'bg-[#1C202B]/80 text-[#4375FF] font-bold border-l-2 border-[#4375FF] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
      : 'text-on-surface-variant hover:text-white hover:bg-white/5 border-l-2 border-transparent'
  }`;

// Helper SVG icons
const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default AdminLayout;
