import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLiveUserCount } from '../hooks/useLiveUserCount';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import BookmarksDropdown from './BookmarksDropdown';
import GlobalSearchModal from '../components/ui/GlobalSearchModal';

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors duration-200 ${
    isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
  }`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
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

  // Extract initials for placeholder avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#0e0e10] border-b border-white/5">
      <div className="flex justify-between items-center h-14 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
          <Link to="/" className="flex items-center">
            <h1 className="font-display text-lg font-bold tracking-tight text-white">HTTPTechNex</h1>
          </Link>
        </div>
        
        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavLink to="/learn/dsa" className={navLinkClass}>Learn</NavLink>
          <NavLink to="/blog" className={navLinkClass}>Blogs</NavLink>
          <NavLink to="/forum" className={navLinkClass}>Forum</NavLink>
          <NavLink to="/student-os" className={navLinkClass}>Workspace</NavLink>
          <NavLink to="/ai" className={navLinkClass}>AI</NavLink>
        </nav>

        {/* Right: Search & Profile */}
        <div className="flex items-center gap-5">
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button 
                className="h-7 w-7 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[11px] font-semibold tracking-wider hover:opacity-90 transition-opacity"
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
            <div className="hidden sm:block">
              <GoogleSignInButton />
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-2 bg-[#0e0e10]">
          <NavLink to="/learn/dsa" className={navLinkClass} onClick={() => setMobileOpen(false)}>Learn</NavLink>
          <NavLink to="/blog" className={navLinkClass} onClick={() => setMobileOpen(false)}>Blogs</NavLink>
          <NavLink to="/forum" className={navLinkClass} onClick={() => setMobileOpen(false)}>Forum</NavLink>
          <NavLink to="/student-os" className={navLinkClass} onClick={() => setMobileOpen(false)}>Workspace</NavLink>
          <NavLink to="/ai" className={navLinkClass} onClick={() => setMobileOpen(false)}>AI</NavLink>
          {!user && <div className="pt-2"><GoogleSignInButton /></div>}
        </div>
      )}
      
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
