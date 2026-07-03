import { useEffect, useState } from 'react';

/**
 * Tracks scroll progress (0-100) within a given scrollable container,
 * for a "Reading Progress" indicator. Re-measures on resize too, since
 * the scrollable height can change after images/fonts load in.
 */
export const useReadingProgress = (containerRef) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let target = containerRef?.current;
    
    const handleScroll = () => {
      // If we don't have a target, or the target isn't actually scrollable (e.g. window is scrolling instead)
      // then we fallback to document body scrolling.
      let scrollTop, scrollHeight, clientHeight;
      
      if (target && target.scrollHeight > target.clientHeight) {
        scrollTop = target.scrollTop;
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      } else {
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        clientHeight = document.documentElement.clientHeight || window.innerHeight;
      }

      const scrollable = scrollHeight - clientHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)) : 0;
      setProgress(pct);
    };

    handleScroll();
    
    // Listen to both the container (if it exists) and the window to be safe
    const scrollTarget = (target && target.scrollHeight > target.clientHeight) ? target : window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen to window resize
    window.addEventListener('resize', handleScroll);
    
    let resizeObserver = null;
    if (target) {
      resizeObserver = new ResizeObserver(handleScroll);
      resizeObserver.observe(target);
    }

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [containerRef]);

  return progress;
};
