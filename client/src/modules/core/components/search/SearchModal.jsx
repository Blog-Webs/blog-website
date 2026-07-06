import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X, CornerDownLeft } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import SearchSuggestions from './SearchSuggestions';
import SearchResults, { SearchSkeleton, SearchEmptyState } from './SearchResults';

export const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const {
    query,
    setQuery,
    results,
    loading,
    history,
    addToHistory,
    removeFromHistory,
    clearAllHistory
  } = useSearch();

  const [activeIndex, setActiveIndex] = useState(-1);

  // Flatten results for keyboard navigation indices
  const flatResults = React.useMemo(() => {
    const { topics = [], chapters = [], blogs = [] } = results;
    return [
      ...topics.map((item) => ({ ...item, type: 'topic' })),
      ...chapters.map((item) => ({ ...item, type: 'chapter' })),
      ...blogs.map((item) => ({ ...item, type: 'blog' }))
    ];
  }, [results]);

  // Reset active index when query/results change
  useEffect(() => {
    setActiveIndex(flatResults.length > 0 ? 0 : -1);
  }, [flatResults]);

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelect = useCallback((item, type) => {
    addToHistory(item.name || item.title || query);
    
    let path = '';
    if (type === 'topic') {
      path = `/learn/${item.subject?.slug ?? ''}/${item.slug}`;
    } else if (type === 'chapter') {
      const subjectSlug = item.track?.topic?.subject?.slug;
      const topicSlug = item.track?.topic?.slug;
      path = `/learn/${subjectSlug ?? ''}/${topicSlug ?? ''}`;
    } else if (type === 'blog') {
      path = `/blog/${item.slug}`;
    }

    if (path) {
      navigate(path);
      onClose();
      setQuery('');
    }
  }, [navigate, onClose, addToHistory, query, setQuery]);

  // Key handlers (Arrow keys, Escape, Enter)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatResults.length) {
        const selected = flatResults[activeIndex];
        handleSelect(selected, selected.type);
      }
    }
  }, [flatResults, activeIndex, handleSelect, onClose]);

  // Focus trap inside modal
  const handleTabKey = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Lock focus to the input box in this command palette style modal
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen, handleTabKey]);

  if (!isOpen) return null;

  const showSuggestions = query.trim().length < 2;
  const hasResults = flatResults.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 font-sans">
      {/* Backdrop with strong blur and dimming */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Search Palette Card (macOS inspired design) */}
      <div 
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#111217]/95 backdrop-blur-xl flex flex-col scale-in animate-scale-up"
        style={{ 
          maxHeight: '75vh',
          boxShadow: '0 0 40px rgba(124, 92, 255, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4.5 py-4 border-b border-white/5 bg-white/[0.02]">
          <Search size={18} className="text-gray-400 mr-3.5 shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, blogs, docs, tutorials..."
            className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-gray-500 focus:ring-0"
          />
          {loading ? (
            <Loader2 size={16} className="animate-spin text-[#7C5CFF] ml-3 shrink-0" />
          ) : (
            query && (
              <button 
                onClick={() => setQuery('')} 
                className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            )
          )}
        </div>
        
        {/* Scrollable Results Area */}
        <div className="overflow-y-auto flex-1 bg-black/[0.05]">
          {showSuggestions ? (
            <SearchSuggestions 
              history={history}
              onSelect={(val) => setQuery(val)}
              onRemove={removeFromHistory}
              onClearAll={clearAllHistory}
            />
          ) : loading && !hasResults ? (
            <SearchSkeleton />
          ) : hasResults ? (
            <SearchResults 
              results={results}
              query={query}
              activeIndex={activeIndex}
              onSelect={handleSelect}
            />
          ) : (
            <SearchEmptyState query={query} />
          )}
        </div>
        
        {/* Footer shortcuts helper */}
        <div className="px-4.5 py-3 text-[11px] font-mono text-gray-500 border-t border-white/5 flex justify-between items-center bg-[#0d0e12] select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">Esc</kbd> to close
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">↑↓</kbd> to navigate
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] flex items-center gap-0.5">
              <CornerDownLeft size={8} /> Enter
            </kbd> to select
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
