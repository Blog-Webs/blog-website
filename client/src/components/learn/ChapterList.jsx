import { Check, Lock, Clock } from 'lucide-react';

const ChapterList = ({ chapters, activeChapterId, onSelect, onToggleStudied, isLoggedIn }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-mono-display uppercase mb-1 px-2" style={{ color: 'var(--text-muted)' }}>
        Chapters
      </p>
      {chapters.map((chapter) => {
        const isActive = chapter._id === activeChapterId;
        const isLocked = !chapter.isFreePreview && !isLoggedIn;

        return (
          <div
            key={chapter._id}
            onClick={() => onSelect(chapter)}
            className="flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--accent-soft)]"
            style={{ backgroundColor: isActive ? 'var(--surface-raised)' : 'transparent' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked) onToggleStudied(chapter);
              }}
              disabled={isLocked}
              aria-label={chapter.studied ? 'Mark as not studied' : 'Mark as studied'}
              className="mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 btn-press"
              style={{
                borderColor: chapter.studied ? 'var(--accent)' : 'var(--border)',
                backgroundColor: chapter.studied ? 'var(--accent)' : 'transparent',
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              {chapter.studied && <Check size={13} color="var(--bg)" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Ch. {chapter.chapterNumber}</span>
                {chapter.title}
                {isLocked && <Lock size={12} style={{ color: 'var(--text-muted)' }} />}
              </p>
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                <Clock size={11} /> {chapter.estimatedMinutes} min
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChapterList;
