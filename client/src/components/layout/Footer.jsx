import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, MessageCircle } from 'lucide-react';
import { newsletterApi } from '../../api/blog';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await newsletterApi.subscribe(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-mono-display font-bold text-lg mb-2">httpTechNex</p>
          <p className="font-mono-display font-bold text-lg mb-2">By Tanish Dewase</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            DSA, Java, and Aptitude  explained, visualized, and tracked.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Learn</p>
          <div className="flex flex-col gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Link to="/learn/dsa" className="hover:text-[var(--accent)] transition-colors">DSA</Link>
            <Link to="/learn/java-advanced-java" className="hover:text-[var(--accent)] transition-colors">Java & Advanced Java</Link>
            <Link to="/learn/aptitude" className="hover:text-[var(--accent)] transition-colors">Aptitude</Link>
            <Link to="/blog" className="hover:text-[var(--accent)] transition-colors">Blog</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Newsletter</p>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>One weekly email. No spam.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border outline-none input-focus"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-sm font-medium shrink-0 btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              <Mail size={15} />
            </button>
          </form>
          {status === 'success' && <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>Subscribed! Check your inbox.</p>}
          {status === 'error' && <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>Something went wrong. Try again.</p>}
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Connect</p>
          <div className="flex gap-3">
            <a href="#" aria-label="Website" style={{ color: 'var(--text-muted)' }} className="hover:text-[var(--accent)] transition-colors"><Globe size={18} /></a>
            <a href="#" aria-label="Contact" style={{ color: 'var(--text-muted)' }} className="hover:text-[var(--accent)] transition-colors"><MessageCircle size={18} /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs py-4 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} HttpTechNex. By Tanish Dewase.
      </div>
    </footer>
  );
};

export default Footer;
