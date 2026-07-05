import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
  TerminalSquare
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

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
        <span className="text-[#abc4ff] font-medium">Command Center</span>
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
          <button className="w-full py-2.5 bg-[#4375FF] hover:bg-[#3460E0] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-[#4375FF]/20">
            <Plus size={16} /> New Deployment
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-0.5 px-3">
            <NavLink to="/admin-portal" end className={navLinkClass}>
              <TerminalSquare size={16} /> Dash Board
            </NavLink>
            <NavLink to="/admin-portal/content" className={navLinkClass}>
              <BookOpen size={16} /> Curriculum
            </NavLink>
            <NavLink to="/admin-portal/blogs" className={navLinkClass}>
              <FileText size={16} /> Blogs & Media
            </NavLink>
            <NavLink to="/admin-portal/tree" className={navLinkClass}>
              <MessageSquare size={16} /> Content Tree
            </NavLink>
            <NavLink to="/admin-portal/contact" className={navLinkClass}>
              <Cloud size={16} /> Contact Inbox
            </NavLink>
            <NavLink to="/admin-portal/ai" className={navLinkClass}>
              <Bot size={16} /> AI Agent Ops
            </NavLink>
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-[#1C202B]">
          <nav className="space-y-0.5">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-white transition-colors">
              <Settings size={16} /> Settings
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-white transition-colors">
              <HelpIcon /> Support
            </a>
          </nav>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D3342 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.3 }} />
        
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-[#1C202B] bg-[#0E1015]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 relative z-50">
          
          {/* Breadcrumb (Optional, shown in Dashboard but Content Studio screenshot doesn't show it here. We can keep it or hide it based on route, but let's keep it to match earlier layout unless specified) */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wide hidden sm:flex">
            {getBreadcrumb()}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-5 ml-auto">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search commands, docs, or blogs..." 
                className="w-72 bg-[#111113] border border-[#2D3342] text-sm text-white rounded-full py-1.5 pl-9 pr-12 focus:outline-none focus:border-[#818CF8] transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="bg-[#2D3342] text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-mono">⌘</kbd>
                <kbd className="bg-[#2D3342] text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-mono">K</kbd>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-l border-[#2D3342] pl-5 relative">
              {/* Profile Avatar Swapped to the left */}
              <div className="w-7 h-7 rounded-full bg-[#1C202B] p-0.5 cursor-pointer flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" alt="Avatar" className="w-full h-full rounded-full object-cover border border-[#0E1015]" />
              </div>
              
              <button className="text-on-surface-variant hover:text-white transition-colors">
                <TerminalSquare size={16} />
              </button>
              <button className="text-on-surface-variant hover:text-white transition-colors">
                <LayoutDashboard size={16} />
              </button>

              {/* Notification Icon Swapped to the right */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-on-surface-variant hover:text-white transition-colors relative"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0E1015]"></span>
              </button>

              {/* Inline Notification Popup */}
              {showNotifications && (
                <div className="absolute top-10 right-0 w-80 bg-[#111113] border border-[#1C202B] rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#1C202B] flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    <span className="text-[10px] text-[#818CF8] cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-[#161B22] transition-colors cursor-pointer border-b border-[#1C202B]">
                      <p className="text-xs text-white mb-1"><strong>System Alert:</strong> Edge nodes scaled successfully.</p>
                      <p className="text-[10px] text-on-surface-variant">2 mins ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-[#161B22] transition-colors cursor-pointer">
                      <p className="text-xs text-white mb-1"><strong>New Publication:</strong> "System Arch Guide" draft saved.</p>
                      <p className="text-[10px] text-on-surface-variant">1 hour ago</p>
                    </div>
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
