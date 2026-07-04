import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    // Check both window and document body for scroll
    const scrolled = document.documentElement.scrollTop || document.body.scrollTop || window.scrollY;
    if (scrolled > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also scroll the main container if it is the one scrolling
    const scrollContainers = document.querySelectorAll('.lg\\:overflow-y-auto');
    scrollContainers.forEach(container => container.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    // Also attach to common scrollable containers if any
    const scrollContainers = document.querySelectorAll('.lg\\:overflow-y-auto');
    scrollContainers.forEach(container => container.addEventListener('scroll', toggleVisibility, { passive: true }));
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      scrollContainers.forEach(container => container.removeEventListener('scroll', toggleVisibility));
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`p-3 rounded-full shadow-lg transition-all duration-300 glass-btn hover:scale-110 active:scale-95 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        style={{ color: 'var(--accent)' }}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default BackToTop;
