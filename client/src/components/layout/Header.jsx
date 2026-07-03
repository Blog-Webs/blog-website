import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bookmark, Users, Menu, X, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLiveUserCount } from '../../hooks/useLiveUserCount';
import GoogleSignInButton from '../ui/GoogleSignInButton';
import BookmarksDropdown from './BookmarksDropdown';
import GlobalSearchModal from '../ui/GlobalSearchModal';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
    isActive ? 'text-[var(--accent)] bg-[var(--accent-soft)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
  }`;

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const liveCount = useLiveUserCount();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex flex-col shrink-0 leading-none">
          <span className="flex items-center gap-2">
            <span className="font-mono-display text-lg font-bold" style={{ color: 'var(--accent)' }}>{'<'}</span>
            <span className="font-mono-display text-lg font-bold">httpTechNex</span>
            <span className="font-mono-display text-lg font-bold" style={{ color: 'var(--accent)' }}>{'/>'}</span>
          </span>
          <span className="text-[10px] font-mono-display mt-0.5 pl-0.5" style={{ color: 'var(--text-muted)' }}>
            Built by Engineer, for Engineer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/learn/dsa" className={navLinkClass}>DSA</NavLink>
          <NavLink to="/learn/java-advanced-java" className={navLinkClass}>Java</NavLink>
          <NavLink to="/learn/aptitude" className={navLinkClass}>Aptitude</NavLink>
          <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
          <NavLink to="/todos" className={navLinkClass}>To-Do</NavLink>
          <NavLink
            to="/student-os"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`
            }
          >
            StudentOS
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--accent), #5EEAD4)', color: 'white' }}
            >
              AI
            </span>
          </NavLink>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live users */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono-display px-2.5 py-1.5 rounded-full border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            title="Live users on HttpTechNex right now"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--accent)' }} />
            </span>
            <Users size={13} />
            {liveCount}
          </div>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Cmd+K)"
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg border transition-colors hover:bg-[var(--surface)] btn-press"
            style={{ borderColor: 'var(--border)' }}
          >
            <Search size={16} />
            <span className="hidden sm:inline text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Search... <kbd className="ml-1 px-1.5 py-0.5 rounded border border-current opacity-70 font-mono-display text-[9px]">⌘K</kbd>
            </span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-lg border transition-colors hover:bg-[var(--surface)] btn-press"
            style={{ borderColor: 'var(--border)' }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setBookmarksOpen((o) => !o)}
                aria-label="Bookmarks"
                className="p-2 rounded-lg border transition-colors hover:bg-[var(--surface)] btn-press"
                style={{ borderColor: 'var(--border)' }}
              >
                <Bookmark size={17} />
              </button>
              {bookmarksOpen && <BookmarksDropdown onClose={() => setBookmarksOpen(false)} />}
            </div>
          )}

          {/* Auth */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center btn-press">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border-2 object-cover"
                  style={{ borderColor: 'var(--accent)' }}
                />
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg overflow-hidden"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 24px var(--shadow)' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-portal"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)] transition-colors btn-press"
                    >
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-[var(--accent-soft)] transition-colors btn-press"
                    style={{ color: 'var(--danger)' }}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:block">
              <GoogleSignInButton />
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg border btn-press"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
          <NavLink to="/learn/dsa" className={navLinkClass} onClick={() => setMobileOpen(false)}>DSA</NavLink>
          <NavLink to="/learn/java-advanced-java" className={navLinkClass} onClick={() => setMobileOpen(false)}>Java &amp; Advanced Java</NavLink>
          <NavLink to="/learn/aptitude" className={navLinkClass} onClick={() => setMobileOpen(false)}>Aptitude</NavLink>
          <NavLink to="/blog" className={navLinkClass} onClick={() => setMobileOpen(false)}>Blog</NavLink>
          <NavLink to="/todos" className={navLinkClass} onClick={() => setMobileOpen(false)}>To-Do</NavLink>
          <NavLink to="/student-os" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            StudentOS{' '}
            <span className="text-[9px] font-bold px-1 py-0.5 rounded-full ml-1"
              style={{ background: 'linear-gradient(90deg, var(--accent), #5EEAD4)', color: 'white' }}>AI</span>
          </NavLink>
          {!user && <div className="pt-2"><GoogleSignInButton /></div>}
        </div>
      )}
      
      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
