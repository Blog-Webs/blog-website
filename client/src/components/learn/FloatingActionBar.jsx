import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Share2, Expand, Shrink, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * FloatingActionBar - A floating toolbar at the bottom of the reading pane.
 * Contains Previous/Next document buttons, Bookmark, Share, and Reading Mode.
 */
const FloatingActionBar = ({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isBookmarked,
  onToggleBookmark,
  isReadingMode,
  onToggleReadingMode,
}) => {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300">
      <div 
        className="flex items-center gap-1.5 p-1.5 rounded-full border shadow-xl backdrop-blur-md"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--surface)' }}
          title="Previous Document"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

        {/* Bookmark */}
        <button
          onClick={onToggleBookmark}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press"
          style={{
            backgroundColor: isBookmarked ? 'var(--accent-soft)' : 'transparent',
            color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)'
          }}
          title="Bookmark"
        >
          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

        {/* Share (Mock function) */}
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          title="Copy Link"
        >
          <Share2 size={16} />
        </button>

        {/* Reading Mode Toggle */}
        <button
          onClick={onToggleReadingMode}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: isReadingMode ? 'var(--accent)' : 'var(--text-muted)' }}
          title={isReadingMode ? "Exit Reading Mode" : "Focus / Reading Mode"}
        >
          {isReadingMode ? <Shrink size={16} /> : <Expand size={16} />}
        </button>

        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
          title="Next Document"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionBar;
