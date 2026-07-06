import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';

export const GlobalSearch = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!placeholderRef.current) return;
      const rect = placeholderRef.current.getBoundingClientRect();
      // If the top of the placeholder scrolls past the top of the viewport (including header offset)
      // Since header is 64px (h-16), we can check rect.top <= 64
      setIsSticky(rect.top <= 68);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case page is already scrolled
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const SearchBarUI = ({ floating = false }) => (
    <button
      onClick={() => setIsModalOpen(true)}
      className={`flex items-center px-4 h-[56px] rounded-2xl border text-left cursor-pointer transition-all duration-300 relative group select-none outline-none ${
        floating
          ? 'bg-[#111217]/90 backdrop-blur-xl border-white/10 shadow-[0_0_30px_rgba(124,92,255,0.15)] hover:border-[#7C5CFF]/40'
          : 'bg-[#111217]/50 backdrop-blur-md border-white/5 shadow-inner hover:border-[#7C5CFF]/30'
      }`}
      style={{ width: '100%', maxWidth: '576px' }}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7C5CFF]/5 to-[#4F9DFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <Search size={18} className="text-gray-400 mr-3.5 group-hover:text-[#7C5CFF] transition-colors shrink-0" />
      <span className="text-sm text-gray-500 flex-1 truncate">
        Search topics, blogs, docs, tutorials...
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all shrink-0">
        {isMac ? '⌘' : 'Ctrl'} K
      </kbd>
    </button>
  );

  return (
    <>
      {/* Search Bar Container Placeholder */}
      <div 
        ref={placeholderRef} 
        className="w-full py-6 px-4 relative z-20 min-h-[104px]"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        {/* Inline Search Bar - visible when not sticky, transitions opacity */}
        <div 
          className={`transition-all duration-300 ${
            isSticky 
              ? 'opacity-0 scale-95 pointer-events-none' 
              : 'opacity-100 scale-100'
          }`}
          style={{ width: '100%', maxWidth: '576px' }}
        >
          <SearchBarUI floating={false} />
        </div>
      </div>

      {/* Floating Sticky Search Bar - centered, slides down from top */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 z-50 px-4 transition-all duration-300 ease-out transform ${
          isSticky 
            ? 'top-4 opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : '-top-20 opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{ width: '100%', maxWidth: '576px' }}
      >
        <SearchBarUI floating={true} />
      </div>

      {/* Search Modal overlay */}
      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default GlobalSearch;
