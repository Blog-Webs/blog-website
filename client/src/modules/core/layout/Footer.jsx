import { Link } from 'react-router-dom';
import { GitBranch, MessageSquare, BookOpen, Shield, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto relative overflow-hidden">
      {/* Top gradient border */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #3B82F6 30%, #6366F1 60%, transparent)' }} />

      <div className="bg-[#0a0a0f] px-6 pt-14 pb-8">
        <div className="max-w-[1200px] mx-auto">

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand column */}
            <div className="md:col-span-1">
              {/* Logo */}
              <Link to="/" className="inline-flex items-center gap-0.5 mb-4">
                <span className="font-display text-lg font-bold" style={{ color: '#3B82F6' }}>&lt;</span>
                <span className="font-display text-lg font-bold text-white">&nbsp;httpTechNex&nbsp;</span>
                <span className="font-display text-lg font-bold" style={{ color: '#3B82F6' }}>/&gt;</span>
              </Link>

              <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                Empowering developers with tools that feel like magic, built on solid engineering.
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                <a
                  href="https://github.com/Blog-Webs/blog-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  aria-label="GitHub"
                >
                  <GitBranch size={14} />
                </a>
                <Link
                  to="/forum"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  aria-label="Forum"
                >
                  <MessageSquare size={14} />
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <BookOpen size={12} className="text-[#3B82F6]" />
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/learn/dsa" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#3B82F6] transition-colors" />
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#3B82F6] transition-colors" />
                    API Keys
                  </Link>
                </li>
                <li>
                  <Link to="/forum" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#3B82F6] transition-colors" />
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Zap size={12} className="text-[#6366F1]" />
                Community
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#6366F1] transition-colors" />
                    Discord
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/Blog-Webs/blog-website" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#6366F1] transition-colors" />
                    GitHub
                  </a>
                </li>
                <li>
                  <Link to="/forum" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#6366F1] transition-colors" />
                    Forum
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Shield size={12} className="text-[#5EEAD4]" />
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#5EEAD4] transition-colors" />
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#5EEAD4] transition-colors" />
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#5EEAD4] transition-colors" />
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-gray-600">
              © {new Date().getFullYear()} httpTechNex. Built for the modern developer.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/5 border border-green-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] text-green-500/80 font-medium">All systems operational</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
