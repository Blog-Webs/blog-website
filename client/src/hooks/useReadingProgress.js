import { useEffect, useState } from 'react';

/**
 * Tracks scroll progress (0-100) within a given scrollable container,
 * for a "Reading Progress" indicator. Re-measures on resize too, since
 * the scrollable height can change after images/fonts load in.
 */
export const useReadingProgress = (containerRef) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollable = scrollHeight - clientHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)) : 0;
      setProgress(pct);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return progress;
};
