import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLiveUserCount } from '../hooks/useLiveUserCount';
import SearchModal from '../components/search/SearchModal';
import { Bell, FileText, BookOpen, Megaphone } from 'lucide-react';
import { notificationApi } from '../../workspace/api/userFeatures';

const navLinkClass = ({ isActive }) =>
  `text-[11px] uppercase tracking-widest transition-colors duration-200 ${
    isActive ? 'text-white font-bold' : 'text-gray-400 font-semibold hover:text-white'
  }`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const liveUsers = useLiveUserCount();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = () => {
    notificationApi.getAll()
      .then(({ data }) => setNotifications(data || []))
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const formatTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'BLOG_PUBLISHED':
        return <FileText size={16} className="text-[#818CF8]" />;
      case 'CONTENT_PUBLISHED':
        return <BookOpen size={16} className="text-[#A78BFA]" />;
      default:
        return <Megaphone size={16} className="text-[#5EEAD4]" />;
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  // Extract initials for placeholder avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="flex justify-between items-center h-16 px-6 max-w-[1400px] mx-auto">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="text-gray-400 hover:text-white transition-colors md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
          <Link to="/" className="flex items-center">
            <h1 className="font-display text-xl font-bold tracking-tight text-white">HTTPTechNex</h1>
          </Link>
        </div>
        
        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <NavLink to="/learn" className={navLinkClass}>Learn</NavLink>
          <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
          <NavLink to="/todos" className={navLinkClass}>Todo</NavLink>
          <NavLink to="/student-os" className={navLinkClass}>Workspace</NavLink>
          <NavLink to="/forum" className={navLinkClass}>Forum</NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-green-400">{liveUsers} Online</span>
          </div>
          {/* Notification Button & Inline Dropdown */}
          <div className="relative flex items-center" ref={notifRef}>
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-gray-400 hover:text-white transition-colors relative flex items-center justify-center p-1 rounded-full hover:bg-white/5"
            >
              <Bell size={18} />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#abc4ff] rounded-full"></span>
              )}
            </button>

            {notifOpen && (
              <div 
                className="absolute right-0 top-full mt-3 w-80 bg-[#15171D] border border-[#2D3342] rounded-2xl shadow-2xl py-4 z-50 animate-mac-slide-down text-left"
              >
                <div className="px-4 pb-3 border-b border-[#2D3342]/60 flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Updates</h4>
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[#abc4ff] hover:text-[#b9cdff] uppercase tracking-wider transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-[#2D3342]/40 scrollbar-none">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => {
                        if (notif.link) navigate(notif.link);
                        setNotifOpen(false);
                      }}
                      className={`flex gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer items-start ${!notif.isRead ? 'bg-[#abc4ff]/5' : ''}`}
                    >
                      <div className="p-2 bg-[#1C202B] rounded-lg border border-[#2D3342]/50 shrink-0 font-normal">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/95 leading-relaxed font-normal">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>

                <div className="px-4 pt-3 border-t border-[#2D3342]/60 text-center">
                  <Link 
                    to="/student-os" 
                    onClick={() => setNotifOpen(false)}
                    className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button 
                className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[12px] font-bold tracking-wider hover:opacity-90 transition-opacity"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {getInitials(user.name)}
              </button>
              
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 shadow-lg overflow-hidden"
                  style={{ backgroundColor: '#131315' }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                    <p className="text-xs truncate text-gray-400">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-portal"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">dashboard</span> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors text-red-400"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="bg-[#abc4ff] text-[#0a0a0a] px-5 py-1.5 rounded-full font-bold text-[12px] uppercase tracking-wider hover:bg-[#b9cdff] transition-colors">
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-2 bg-[#0e0e10]">
          <NavLink to="/learn" className={navLinkClass} onClick={() => setMobileOpen(false)}>Learn</NavLink>
          <NavLink to="/blog" className={navLinkClass} onClick={() => setMobileOpen(false)}>Blog</NavLink>
          <NavLink to="/todos" className={navLinkClass} onClick={() => setMobileOpen(false)}>Todo</NavLink>
          <NavLink to="/student-os" className={navLinkClass} onClick={() => setMobileOpen(false)}>Workspace</NavLink>
          <NavLink to="/forum" className={navLinkClass} onClick={() => setMobileOpen(false)}>Forum</NavLink>
          {!user && (
            <div className="pt-2">
              <button className="w-full bg-[#abc4ff] text-[#0a0a0a] px-5 py-2.5 rounded-lg font-bold text-[12px] uppercase tracking-wider">
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
      
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
