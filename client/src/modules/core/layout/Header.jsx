import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLiveUserCount } from '../hooks/useLiveUserCount';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import BookmarksDropdown from './BookmarksDropdown';
import GlobalSearchModal from '../components/ui/GlobalSearchModal';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 ${
    isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]'
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
    <header className="fixed top-0 w-full z-50 bg-[var(--color-background)]/70 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/30">
      <div className="flex justify-between items-center h-16 px-[var(--spacing-gutter)] max-w-[var(--spacing-max-width)] mx-auto">
        <div className="flex items-center gap-4">
          <span 
            className="material-symbols-outlined text-[var(--color-primary)] cursor-pointer active:scale-95 transition-transform md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? 'close' : 'menu'}
          </span>
          <Link to="/" className="flex items-center">
            <h1 className="font-display text-[var(--text-headline-md)] font-bold tracking-tighter text-[var(--color-on-surface)]">HTTPTechNex</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/learn/dsa" className={navLinkClass}>Learn</NavLink>
          <NavLink to="/blog" className={navLinkClass}>Blogs</NavLink>
          <NavLink to="/forum" className={navLinkClass}>Forum</NavLink>
          <NavLink to="/student-os" className={navLinkClass}>Workspace</NavLink>
          {/* We keep To-Do under workspace usually, but let's add it for parity if needed, or hide */}
        </nav>

        <div className="flex items-center gap-4">
          {/* Live users count - styled minimal */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono-display px-2 py-1 rounded-full border border-[var(--color-outline-variant)]/30"
            title="Live users"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[var(--color-primary)]" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" />
            </span>
            <span className="text-[var(--color-on-surface-variant)]">{liveCount}</span>
          </div>

          <span 
            className="material-symbols-outlined text-[var(--color-primary)] cursor-pointer active:scale-95 transition-transform"
            onClick={() => setSearchOpen(true)}
          >
            search
          </span>

          <span 
            className="material-symbols-outlined text-[var(--color-on-surface-variant)] cursor-pointer active:scale-95 transition-transform"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>

          {user && (
            <div className="relative">
              <span 
                className="material-symbols-outlined text-[var(--color-on-surface-variant)] cursor-pointer active:scale-95 transition-transform"
                onClick={() => setBookmarksOpen(!bookmarksOpen)}
              >
                bookmark
              </span>
              {bookmarksOpen && <BookmarksDropdown onClose={() => setBookmarksOpen(false)} />}
            </div>
          )}

          {user ? (
            <div className="relative" ref={profileRef}>
              <div 
                className="hidden sm:flex h-8 w-8 rounded-full bg-[var(--color-secondary-container)] items-center justify-center cursor-pointer border border-[var(--color-outline-variant)]/30 overflow-hidden"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-outline-variant)]/30 shadow-lg overflow-hidden glass-panel"
                  style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 8px 24px var(--shadow)' }}
                >
                  <div className="px-4 py-3 border-b border-[var(--color-outline-variant)]/30">
                    <p className="text-sm font-semibold truncate text-[var(--color-on-surface)]">{user.name}</p>
                    <p className="text-xs truncate text-[var(--color-on-surface-variant)]">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-portal"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">dashboard</span> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-[var(--color-surface-container-high)] transition-colors text-[var(--color-error)]"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:block">
              <GoogleSignInButton />
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1 border-[var(--color-outline-variant)]/30 bg-[var(--color-background)]">
          <NavLink to="/learn/dsa" className={navLinkClass} onClick={() => setMobileOpen(false)}>Learn</NavLink>
          <NavLink to="/blog" className={navLinkClass} onClick={() => setMobileOpen(false)}>Blogs</NavLink>
          <NavLink to="/forum" className={navLinkClass} onClick={() => setMobileOpen(false)}>Forum</NavLink>
          <NavLink to="/student-os" className={navLinkClass} onClick={() => setMobileOpen(false)}>Workspace</NavLink>
          {!user && <div className="pt-2"><GoogleSignInButton /></div>}
        </div>
      )}
      
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
