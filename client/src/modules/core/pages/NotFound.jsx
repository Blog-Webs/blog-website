import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <p className="font-mono-display text-6xl font-bold mb-3" style={{ color: 'var(--accent)' }}>404</p>
    <h1 className="text-xl font-semibold mb-2">Page not found</h1>
    <p className="mb-6" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p>
    <Link to="/" className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
      Back to home
    </Link>
  </div>
);

export default NotFound;
