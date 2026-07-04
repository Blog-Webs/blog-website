import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, Users, MessageSquare, Wrench, ArrowLeft } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:translate-x-0.5'
  }`;

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>
      <aside className="w-60 shrink-0 border-r p-5 hidden sm:flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono-display font-bold text-sm mb-6 px-1">admin-portal/</p>
        <NavLink to="/admin-portal" end className={linkClass}><LayoutDashboard size={16} /> Dashboard</NavLink>
        <NavLink to="/admin-portal/blogs" className={linkClass}><FileText size={16} /> Blog Posts</NavLink>
        <NavLink to="/admin-portal/content" className={linkClass}><BookOpen size={16} /> Content Tree</NavLink>
        <NavLink to="/admin-portal/subscribers" className={linkClass}><Users size={16} /> Subscribers</NavLink>
        <NavLink to="/admin-portal/contact" className={linkClass}><MessageSquare size={16} /> Contact Inbox</NavLink>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <NavLink
            to="/admin-portal/migration"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs transition-all duration-200 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] opacity-70 hover:opacity-100'
              }`
            }
          >
            <Wrench size={13} /> Migration tool
          </NavLink>
        </div>

        <Link to="/" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm mt-auto transition-all duration-200 hover:translate-x-0.5" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to site
        </Link>
      </aside>
      <main className="flex-1 p-6 sm:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
