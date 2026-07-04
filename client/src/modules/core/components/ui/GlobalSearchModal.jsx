import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Layout, BookOpen, X, Loader2 } from 'lucide-react';
import api from '../../api/client'; // our axios instance
import { optimizeImage } from '../../../../utils/image';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ blogs: [], chapters: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Debounce search API call
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ blogs: [], chapters: [], topics: [] });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const handler = setTimeout(() => {
      api.get(`/search?q=${encodeURIComponent(query)}`)
        .then(({ data }) => setResults(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    
    return () => clearTimeout(handler);
  }, [query]);
  
  if (!isOpen) return null;
  
  const hasResults = results.blogs.length > 0 || results.topics.length > 0 || results.chapters.length > 0;
  
  const navigateAndClose = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden glass-panel flex flex-col"
        style={{ 
          backgroundColor: 'var(--surface)', 
          borderColor: 'var(--border)',
          maxHeight: '80vh'
        }}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={20} className="mr-3" style={{ color: 'var(--text-muted)' }} />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs, topics, or chapters..."
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:opacity-50"
            style={{ color: 'var(--text)' }}
          />
          {loading ? (
            <Loader2 size={18} className="animate-spin ml-3" style={{ color: 'var(--accent)' }} />
          ) : (
            <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 ml-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors btn-press">
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Results Area */}
        <div className="overflow-y-auto flex-1 p-2">
          {query.length >= 2 ? (
            hasResults ? (
              <div className="space-y-4">
                
                {/* TOPICS */}
                {results.topics.length > 0 && (
                  <div>
                    <h3 className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                      Topics
                    </h3>
                    <div className="space-y-1">
                      {results.topics.map(topic => (
                        <button 
                          key={topic._id}
                          onClick={() => navigateAndClose(`/learn/${topic.subject.slug}/${topic.slug}`)}
                          className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 hover:bg-[var(--surface-raised)] transition-colors btn-press group"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <Layout size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{topic.name}</p>
                            <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                              in {topic.subject.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* CHAPTERS */}
                {results.chapters.length > 0 && (
                  <div>
                    <h3 className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                      Chapters
                    </h3>
                    <div className="space-y-1">
                      {results.chapters.map(chapter => (
                        <button 
                          key={chapter._id}
                          onClick={() => navigateAndClose(`/learn/${chapter.track.topic.subject.slug}/${chapter.track.topic.slug}`)}
                          className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 hover:bg-[var(--surface-raised)] transition-colors btn-press group"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5" style={{ color: 'var(--text)' }}>
                            <FileText size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Chapter {chapter.chapterNumber}: {chapter.title}</p>
                            <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                              in {chapter.track.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* BLOGS */}
                {results.blogs.length > 0 && (
                  <div>
                    <h3 className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                      Blogs
                    </h3>
                    <div className="space-y-1">
                      {results.blogs.map(blog => (
                        <button 
                          key={blog._id}
                          onClick={() => navigateAndClose(`/blog/${blog.slug}`)}
                          className="w-full text-left p-2 rounded-xl flex gap-3 hover:bg-[var(--surface-raised)] transition-colors btn-press group"
                        >
                          {blog.coverImage ? (
                            <img src={optimizeImage(blog.coverImage)} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5" style={{ color: 'var(--text-muted)' }}>
                              <BookOpen size={18} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{blog.title}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--accent)' }}>
                              {blog.category}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            ) : !loading && (
              <div className="py-16 text-center">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results found for "{query}"</p>
              </div>
            )
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Type at least 2 characters to search...</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 text-xs border-t flex justify-between items-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-current opacity-70 font-mono-display text-[10px]">ESC</kbd> to close
          </span>
          <span>Global Search</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
