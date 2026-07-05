import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-16 px-[var(--spacing-gutter)] bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-outline-variant)]/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-[var(--spacing-max-width)] mx-auto">
        <div className="md:col-span-1">
          <h2 className="font-display text-[var(--text-headline-md)] font-bold text-[var(--color-on-surface)] mb-6">HTTPTechNex</h2>
          <p className="text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
            The premier destination for modern developers architecting the future of the web.
          </p>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)]/30 flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </button>
            <button className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)]/30 flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </button>
            <button className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)]/30 flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
              <span className="material-symbols-outlined text-[20px]">code</span>
            </button>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-on-surface)] mb-6">Ecosystem</h4>
          <ul className="space-y-4">
            <li><Link to="/learn/dsa" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Learn</Link></li>
            <li><Link to="/blog" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Blogs</Link></li>
            <li><Link to="/forum" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Forum</Link></li>
            <li><Link to="/student-os" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Workspace</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-on-surface)] mb-6">Company</h4>
          <ul className="space-y-4">
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">About Us</Link></li>
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Careers</Link></li>
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Partners</Link></li>
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-on-surface)] mb-6">Legal</h4>
          <ul className="space-y-4">
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Privacy</Link></li>
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Terms</Link></li>
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Cookie Policy</Link></li>
            <li><Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">DPA</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[var(--spacing-max-width)] mx-auto mt-16 pt-8 border-t border-[var(--color-outline-variant)]/10 text-center text-[var(--color-on-surface-variant)]">
        <p>© 2026 HTTPTechNex. Built for the modern developer.</p>
      </div>
    </footer>
  );
};

export default Footer;
