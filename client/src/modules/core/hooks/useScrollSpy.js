import { useEffect, useState } from 'react';

/**
 * Watches a list of heading ids (rendered as `data-id="<id>"` elements,
 * which is how BlockNote marks its blocks) inside a scrollable container,
 * and reports which one is currently most visible — used to highlight the
 * active entry in an "On This Page" rail as the reader scrolls.
 *
 * `containerRef` should point at the actual scrolling element (not the
 * window), since both the blog reader and chapter reader scroll an inner
 * pane rather than the whole page.
 */
export const useScrollSpy = (headings, containerRef) => {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!headings || headings.length === 0) return;
    const container = containerRef?.current;
    if (!container) return;

    const elements = headings
      .map((h) => container.querySelector(`[data-id="${h.id}"]`))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among headings currently intersecting the "active band" near the
        // top of the viewport, pick the one closest to that band — this
        // reads more naturally than "first one that appears at all", since
        // a heading scrolled mostly past still counts as active until the
        // next one reaches the same band.
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActiveId(topMost.target.getAttribute('data-id'));
        }
      },
      {
        root: container,
        // Treats the top ~20% of the scroll container as the "active band":
        // a heading counts as current once it crosses into that band.
        rootMargin: '0px 0px -75% 0px',
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings, containerRef]);

  return activeId;
};
