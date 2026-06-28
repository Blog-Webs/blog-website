import { Brain, Database, FlaskConical, BookMarked } from 'lucide-react';

const ICONS = {
  'deep-analysis': Brain,
  'data-research': Database,
  'practice-problems': FlaskConical,
};

const TrackSidebar = ({ tracks, activeTrackId, onSelect }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-mono-display uppercase mb-1 px-2" style={{ color: 'var(--text-muted)' }}>
        Explore further
      </p>
      {tracks.map((track) => {
        const Icon = ICONS[track.slug] || BookMarked;
        const isActive = track._id === activeTrackId;
        return (
          <button
            key={track._id}
            onClick={() => onSelect(track)}
            className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 btn-press hover:translate-x-0.5"
            style={{
              backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text)',
            }}
          >
            <span className="flex items-center gap-2.5">
              <Icon size={15} />
              {track.name}
            </span>
            <span
              className="text-[10px] font-mono-display px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}
            >
              {track.chapterCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TrackSidebar;
