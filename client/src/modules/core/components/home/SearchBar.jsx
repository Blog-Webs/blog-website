import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, BookOpen, Layers, X } from 'lucide-react';
import { searchApi } from '../../api/search';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchApi.search(query.trim());
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const hasResults = results && (results.blogs.length || results.chapters.length || results.topics.length);

  const chapterHref = (chapter) => {
    const subjectSlug = chapter.track?.topic?.subject?.slug;
    const topicSlug = chapter.track?.topic?.slug;
    return `/learn/${subjectSlug ?? ''}/${topicSlug ?? ''}`;
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search blogs, DSA, Java, Aptitude…"
          className="w-full pl-10 pr-9 py-3 rounded-xl border text-sm outline-none input-focus"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl border max-h-[28rem] overflow-y-auto z-40"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 12px 32px var(--shadow)' }}
        >
          {loading && <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>Searching…</p>}

          {!loading && !hasResults && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>No results for "{query}".</p>
          )}

          {!loading && results?.topics?.length > 0 && (
            <div className="py-2">
              <p className="px-4 pb-1 text-[10px] font-mono-display uppercase" style={{ color: 'var(--text-muted)' }}>Topics</p>
              {results.topics.map((t) => (
                <Link
                  key={t._id}
                  to={`/learn/${t.subject?.slug ?? ''}/${t.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--accent-soft)] transition-all duration-200 hover:translate-x-0.5"
                >
                  <Layers size={14} style={{ color: t.subject?.color || 'var(--accent)' }} />
                  <span className="truncate">{t.name}</span>
                  <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--text-muted)' }}>{t.subject?.name}</span>
                </Link>
              ))}
            </div>
          )}

          {!loading && results?.chapters?.length > 0 && (
            <div className="py-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="px-4 pb-1 text-[10px] font-mono-display uppercase" style={{ color: 'var(--text-muted)' }}>Chapters</p>
              {results.chapters.map((c) => (
                <Link
                  key={c._id}
                  to={chapterHref(c)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--accent-soft)] transition-all duration-200 hover:translate-x-0.5"
                >
                  <BookOpen size={14} style={{ color: 'var(--accent)' }} />
                  <span className="truncate">Ch.{c.chapterNumber} — {c.title}</span>
                  <span className="text-xs ml-auto shrink-0 truncate max-w-[100px]" style={{ color: 'var(--text-muted)' }}>{c.track?.name}</span>
                </Link>
              ))}
            </div>
          )}

          {!loading && results?.blogs?.length > 0 && (
            <div className="py-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="px-4 pb-1 text-[10px] font-mono-display uppercase" style={{ color: 'var(--text-muted)' }}>Blog</p>
              {results.blogs.map((b) => (
                <Link
                  key={b._id}
                  to={`/blog/${b.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--accent-soft)] transition-all duration-200 hover:translate-x-0.5"
                >
                  <FileText size={14} style={{ color: 'var(--amber)' }} />
                  <span className="truncate">{b.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
