import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Share2, Expand, Shrink, Heart, StickyNote, X } from 'lucide-react';
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
  isLiked,
  likeCount,
  onToggleLike,
  noteContent,
  onNoteChange,
}) => {
  const { theme } = useTheme();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [localNote, setLocalNote] = useState(noteContent || '');

  // Sync local note with prop when opened/changed externally
  useEffect(() => {
    setLocalNote(noteContent || '');
  }, [noteContent]);

  // Handle autosave debouncing
  useEffect(() => {
    if (!isNoteOpen) return;
    const timeout = setTimeout(() => {
      if (onNoteChange && localNote !== noteContent) {
        onNoteChange(localNote);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [localNote, isNoteOpen, onNoteChange, noteContent]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 transition-transform duration-300">
      {/* Note Panel (Slide-in / Pop-up above the bar) */}
      {isNoteOpen && (
        <div className="w-80 rounded-2xl border p-4 shadow-2xl glass-panel animate-in slide-in-from-bottom-4 relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>My Notes</span>
            <button onClick={() => setIsNoteOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Type your notes here... Autosaves automatically."
            className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 resize-none"
            rows={5}
          />
          <div className="text-[10px] text-right mt-2 text-gray-400">
            {localNote !== noteContent ? 'Saving...' : 'Saved'}
          </div>
        </div>
      )}

      {/* The Bar */}
      <div className="flex items-center gap-1.5 p-2 rounded-full border shadow-2xl glass-panel">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed glass-btn hover:bg-black/10 dark:hover:bg-white/10"
          title="Previous Document"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

        {/* Like Button */}
        {onToggleLike && (
          <button
            onClick={onToggleLike}
            className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-full transition-all btn-press glass-btn"
            style={{ color: isLiked ? '#F87171' : 'var(--text-muted)' }}
            title="Like"
          >
            <Heart size={16} fill={isLiked ? '#F87171' : 'none'} />
            {likeCount > 0 && <span className="text-xs font-medium">{likeCount}</span>}
          </button>
        )}

        {/* Note Button */}
        {onNoteChange && (
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press glass-btn"
            style={{ color: isNoteOpen ? 'var(--accent)' : 'var(--text-muted)' }}
            title="Notes"
          >
            <StickyNote size={16} />
          </button>
        )}

        {/* Bookmark */}
        <button
          onClick={onToggleBookmark}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press glass-btn"
          style={{
            color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)'
          }}
          title="Bookmark"
        >
          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

        {/* Share (Mock function) */}
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press glass-btn hover:bg-black/10 dark:hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title="Copy Link"
        >
          <Share2 size={16} />
        </button>

        {/* Reading Mode Toggle */}
        <button
          onClick={onToggleReadingMode}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all btn-press glass-btn hover:bg-black/10 dark:hover:bg-white/10"
          style={{ color: isReadingMode ? 'var(--accent)' : 'var(--text-muted)' }}
          title={isReadingMode ? "Exit Reading Mode" : "Focus / Reading Mode"}
        >
          {isReadingMode ? <Shrink size={16} /> : <Expand size={16} />}
        </button>

        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

        {/* Next Button - Emphasized with scale animation */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed glass-btn group"
          title="Next Document"
        >
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionBar;
