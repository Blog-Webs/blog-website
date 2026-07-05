import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 bg-[#131315] border-t border-white/5 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-[1200px] mx-auto text-sm">
        <div className="md:col-span-1">
          <h2 className="font-display text-xl font-bold text-white mb-4">HTTPTechNex</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Empowering developers with tools that feel like magic, built on solid engineering.
          </p>
          <div className="flex gap-4">
            {/* Can add social icons here if needed */}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Resources</h4>
          <ul className="space-y-3">
            <li><Link to="/learn/dsa" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
            <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">API Keys</Link></li>
            <li><Link to="/forum" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Community</h4>
          <ul className="space-y-3">
            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Discord</Link></li>
            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">GitHub</Link></li>
            <li><Link to="/forum" className="text-gray-400 hover:text-white transition-colors">Forum</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-3">
            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-16 pt-8 text-center text-xs text-gray-500">
        <p>© 2024 HTTPTechNex. Built for the modern developer.</p>
      </div>
    </footer>
  );
};

export default Footer;
