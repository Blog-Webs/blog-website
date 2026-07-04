import { List, ChevronRight } from 'lucide-react';

/**
 * StickyTableOfContents - Right sidebar component.
 * Displays the current headings (H1-H4) and highlights the active section based on scroll position.
 */
const StickyTableOfContents = ({ headings = [], activeHeadingId, onHeadingClick }) => {
  if (!headings || headings.length === 0) {
    return (
      <div className="w-full h-full py-6 flex flex-col items-center justify-center text-center opacity-50">
        <List size={24} className="mb-2" />
        <p className="text-xs">No headings found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full py-6 flex flex-col select-none border-l border-black/5 dark:border-white/5">
      {/* Header */}
      <div className="px-4 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <List size={14} />
          On this page
        </h3>
      </div>

      {/* Headings List */}
      <nav className="flex-1 overflow-y-auto px-4 relative">
        {/* Scroll spy active line indicator */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-black/5 dark:bg-white/5" />

        <ul className="relative space-y-2 text-sm">
          {headings.map((heading) => {
            const isActive = heading.id === activeHeadingId;
            return (
              <li key={heading.id} className="relative">
                {/* Active Dot */}
                {isActive && (
                  <div 
                    className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-[3px] h-[14px] rounded-r-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
                <button
                  onClick={() => onHeadingClick(heading.id)}
                  className="text-left w-full block transition-colors duration-200"
                  style={{
                    paddingLeft: `${(heading.level - 1) * 12}px`,
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {heading.text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default StickyTableOfContents;
