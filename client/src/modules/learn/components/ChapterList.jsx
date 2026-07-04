import { Check, Lock, Clock } from 'lucide-react';

/**
 * ChapterList — right-rail chapter navigator.
 * Shows a compact overall progress bar at top, then each chapter
 * with a checkbox, title, read-time, and locked indicator.
 */
const ChapterList = ({ chapters, activeChapterId, onSelect, onToggleStudied, isLoggedIn, studiedCount = 0, totalCount = 0 }) => {
  const pct = totalCount > 0 ? Math.round((studiedCount / totalCount) * 100) : 0;

  return (
    <div
      className="rounded-xl border p-3"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Header + progress */}
      <div className="px-1 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono-display uppercase" style={{ color: 'var(--text-muted)' }}>
            Chapters
          </p>
          <span className="text-xs font-mono-display" style={{ color: pct === 100 ? 'var(--accent)' : 'var(--text-muted)' }}>
            {studiedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Chapter list — scrollable internally if many chapters */}
      <div
        className="flex flex-col gap-0.5"
        style={{ maxHeight: '52vh', overflowY: 'auto', scrollbarWidth: 'thin' }}
      >
        {chapters.map((chapter) => {
          const isActive = chapter._id === activeChapterId;
          const isLocked = !chapter.isFreePreview && !isLoggedIn;

          return (
            <div
              key={chapter._id}
              onClick={() => onSelect(chapter)}
              className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Studied checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLocked) onToggleStudied(chapter);
                }}
                disabled={isLocked}
                aria-label={chapter.studied ? 'Mark as not studied' : 'Mark as studied'}
                className="mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 btn-press transition-all duration-200"
                style={{
                  borderColor: chapter.studied ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: chapter.studied ? 'var(--accent)' : 'transparent',
                  opacity: isLocked ? 0.4 : 1,
                  boxShadow: chapter.studied ? '0 0 8px var(--accent-soft)' : 'none',
                }}
              >
                {chapter.studied && <Check size={12} color="var(--bg)" strokeWidth={3} />}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className="text-sm leading-tight"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="text-[11px] font-mono-display mr-1" style={{ color: 'var(--text-muted)' }}>
                    {chapter.chapterNumber}.
                  </span>
                  {chapter.title}
                  {isLocked && <Lock size={11} className="inline ml-1" style={{ color: 'var(--text-muted)' }} />}
                </p>
                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={10} /> {chapter.estimatedMinutes} min
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterList;
