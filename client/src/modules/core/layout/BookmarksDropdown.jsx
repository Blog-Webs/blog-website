import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Bookmark as BookmarkIcon } from 'lucide-react';
import { bookmarkApi } from '../../workspace/api/userFeatures';

const BookmarksDropdown = ({ onClose }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarkApi
      .getAll()
      .then(({ data }) => setBookmarks(data.bookmarks))
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-lg"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 24px var(--shadow)' }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <BookmarkIcon size={15} style={{ color: 'var(--accent)' }} />
        <p className="text-sm font-semibold">Saved for later</p>
      </div>

      {loading && <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>Loading…</p>}

      {!loading && bookmarks.length === 0 && (
        <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Nothing saved yet. Tap the bookmark icon on any chapter or blog post.
        </p>
      )}

      <div className="py-1">
        {bookmarks.map((b) => {
          const isChapter = b.itemType === 'chapter';
          const subjectSlug = b.chapter?.track?.topic?.subject?.slug;
          const topicSlug = b.chapter?.track?.topic?.slug;
          const to = isChapter
            ? `/learn/${subjectSlug ?? ''}/${topicSlug ?? ''}`
            : `/blog/${b.blog?.slug ?? ''}`;
          return (
            <Link
              key={b._id}
              to={to}
              onClick={onClose}
              className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-[var(--accent-soft)] transition-colors"
            >
              {isChapter ? (
                <BookOpen size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
              ) : (
                <FileText size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--amber)' }} />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {isChapter ? b.chapter?.title : b.blog?.title}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {isChapter ? `Chapter ${b.chapter?.chapterNumber} · ${b.chapter?.track?.name ?? ''}` : 'Blog post'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BookmarksDropdown;
