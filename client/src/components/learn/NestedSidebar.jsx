import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';

/**
 * NestedSidebar - Replaces TrackSidebar for a Notion/GitBook style left navigation.
 * Displays a list of Tracks (folders), which expand to show Chapters (documents).
 */
const NestedSidebar = ({
  topicName = 'Documentation',
  tracks = [],
  activeTrackId,
  chapters = [], 
  activeChapterId,
  onSelectTrack,
  onSelectChapter
}) => {
  // Keep track of which tracks are expanded.
  const [expandedTracks, setExpandedTracks] = useState(new Set([activeTrackId]));

  const toggleTrack = (trackId) => {
    setExpandedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col py-6 select-none border-r border-black/5 dark:border-white/5">
      {/* Category Header */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}>
          {topicName}
        </h2>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {tracks.map(track => {
          const isExpanded = expandedTracks.has(track._id);
          const isActiveTrack = track._id === activeTrackId;
          const trackChapters = isActiveTrack ? chapters : [];

          return (
            <div key={track._id} className="flex flex-col">
              {/* Track / Folder Level */}
              <button
                onClick={() => {
                  onSelectTrack(track);
                  if (!isExpanded) toggleTrack(track._id);
                }}
                className="flex items-center w-full px-2 py-1.5 rounded-lg transition-colors group"
                style={{
                  backgroundColor: isActiveTrack ? 'var(--surface-raised)' : 'transparent',
                  color: isActiveTrack ? 'var(--text)' : 'var(--text-muted)'
                }}
              >
                <div className="flex items-center justify-center w-5 h-5 mr-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrack(track._id);
                  }}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <Folder size={14} className="mr-2 opacity-70" />
                <span className="text-sm font-medium truncate">{track.name}</span>
              </button>

              {/* Chapters / Document Level (Accordion) */}
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isExpanded ? `${trackChapters.length * 40 + 20}px` : '0px',
                  opacity: isExpanded ? 1 : 0
                }}
              >
                <div className="pl-8 pr-2 py-1 space-y-0.5 border-l border-black/5 dark:border-white/5 ml-4 mt-1">
                  {trackChapters.map(chapter => {
                    const isActive = chapter._id === activeChapterId;
                    return (
                      <button
                        key={chapter._id}
                        onClick={() => onSelectChapter(chapter)}
                        className="flex items-center w-full px-2 py-1.5 text-sm rounded-lg transition-all"
                        style={{
                          backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                          fontWeight: isActive ? 500 : 400
                        }}
                      >
                        <FileText size={13} className="mr-2 shrink-0 opacity-70" />
                        <span className="truncate text-left">{chapter.title}</span>
                      </button>
                    );
                  })}
                  {isExpanded && trackChapters.length === 0 && isActiveTrack && (
                     <div className="px-2 py-1.5 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                       No documents
                     </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default NestedSidebar;
