import { Brain, Database, FlaskConical, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const ICONS = {
  'deep-analysis': Brain,
  'data-research': Database,
  'practice-problems': FlaskConical,
};

/**
 * TrackSidebar — "Explore Further" accordion dropdown.
 * Clicking the header reveals/hides the list of tracks.
 * The active track is highlighted; clicking a track calls onSelect.
 * When chapters are provided (from TopicPage state), the active track
 * shows its chapter list inline as a sub-list below the track button.
 */
const TrackSidebar = ({ tracks, activeTrackId, onSelect, chapters = [], onSelectChapter, activeChapterId }) => {
  const [open, setOpen] = useState(true); // open by default so it's immediately useful

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {/* Dropdown header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}
      >
        <span className="text-xs font-mono-display uppercase font-semibold tracking-widest" style={{ color: 'var(--accent)' }}>
          Explore Further
        </span>
        {open
          ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        }
      </button>

      {/* Track list */}
      {open && (
        <div className="flex flex-col">
          {tracks.map((track) => {
            const Icon = ICONS[track.slug] || BookMarked;
            const isActive = track._id === activeTrackId;
            const trackChapters = isActive ? chapters : [];

            return (
              <div key={track._id}>
                <button
                  onClick={() => onSelect(track)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} />
                    {track.name}
                  </span>
                  <span
                    className="text-[10px] font-mono-display px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}
                  >
                    {track.chapterCount}
                  </span>
                </button>

                {/* Inline chapter sub-list when this track is active */}
                {isActive && trackChapters.length > 0 && (
                  <div
                    className="flex flex-col border-t"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}
                  >
                    {trackChapters.map((ch) => {
                      const isChActive = ch._id === activeChapterId;
                      return (
                        <button
                          key={ch._id}
                          onClick={() => onSelectChapter?.(ch)}
                          className="text-left px-5 py-2 text-xs transition-colors"
                          style={{
                            color: isChActive ? 'var(--accent)' : 'var(--text-muted)',
                            backgroundColor: isChActive ? 'rgba(62,126,198,0.08)' : 'transparent',
                            fontWeight: isChActive ? 600 : 400,
                            borderLeft: isChActive ? '2px solid var(--accent)' : '2px solid transparent',
                          }}
                        >
                          <span className="font-mono-display mr-1.5" style={{ opacity: 0.5 }}>
                            {ch.chapterNumber}.
                          </span>
                          {ch.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackSidebar;
