import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lock, ExternalLink, Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { useState } from 'react';
import GoogleSignInButton from '../ui/GoogleSignInButton';
import BlockNoteRenderer from '../ui/BlockNoteRenderer';

const SOURCE_LABEL = {
  geeksforgeeks: 'GeeksforGeeks',
  medium: 'Medium',
  other: 'External resource',
};

const ChapterReader = ({ chapterData, locked, onToggleStudied, onToggleBookmark, isBookmarked, onLoginSuccess }) => {
  const [busy, setBusy] = useState(false);

  if (locked) {
    return (
      <div className="rounded-2xl border p-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--amber)' }}>
          <Lock size={18} />
          <p className="font-semibold">Sign in to keep reading</p>
        </div>
        <p className="prose-content opacity-70 mb-6">{chapterData.preview}</p>
        <div className="p-5 rounded-xl border text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            This chapter and everything beyond the free preview requires a Google account.
            It only takes a few seconds — no separate password to remember.
          </p>
          <div className="flex justify-center">
            <GoogleSignInButton onSuccess={onLoginSuccess} />
          </div>
        </div>
      </div>
    );
  }

  const { chapter, studied } = chapterData;

  const handleToggleStudied = async () => {
    setBusy(true);
    await onToggleStudied(chapter._id);
    setBusy(false);
  };

  return (
    <article className="rounded-2xl border p-6 sm:p-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono-display mb-1" style={{ color: 'var(--accent)' }}>
            Chapter {chapter.chapterNumber}
          </p>
          <h1 className="text-2xl font-bold glow-title">{chapter.title}</h1>
        </div>
        <button
          onClick={() => onToggleBookmark(chapter._id)}
          aria-label="Bookmark this chapter"
          className="p-2 rounded-lg border shrink-0 btn-press"
          style={{ borderColor: 'var(--border)' }}
        >
          {isBookmarked ? <BookmarkCheck size={17} style={{ color: 'var(--accent)' }} /> : <Bookmark size={17} />}
        </button>
      </div>

      {chapter.contentBlocks?.length > 0 ? (
        <BlockNoteRenderer blocks={chapter.contentBlocks} />
      ) : (
        <div className="prose-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
        </div>
      )}

      {chapter.codeSnippets?.map((snippet, i) => (
        <div key={i} className="mb-4">
          {snippet.caption && <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{snippet.caption}</p>}
          <pre><code>{snippet.code}</code></pre>
        </div>
      ))}

      {chapter.externalLinks?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          {chapter.externalLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border btn-press"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {SOURCE_LABEL[link.source]} <ExternalLink size={11} />
            </a>
          ))}
        </div>
      )}

      <button
        onClick={handleToggleStudied}
        disabled={busy}
        className="mt-8 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-press"
        style={{
          backgroundColor: studied ? 'var(--accent-soft)' : 'var(--accent)',
          color: studied ? 'var(--accent)' : 'var(--bg)',
        }}
      >
        <Check size={15} />
        {studied ? 'Marked as studied' : 'Mark as studied'}
      </button>
    </article>
  );
};

export default ChapterReader;
