import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NestedSidebar = ({
  topicName = 'Documentation',
  tracks = [],
  activeTrackId,
  chapters = [], 
  activeChapterId,
  onSelectTrack,
  onSelectChapter,
  studiedCount = 0,
  totalCount = 0,
}) => {
  // Keep track of which tracks are expanded. Default to the active track being open.
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

  const pct = totalCount > 0 ? Math.round((studiedCount / totalCount) * 100) : 0;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col py-8 select-none bg-[#14161A] border-r border-[#1C202B]">
      {/* Progress Header */}
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="relative flex items-center justify-center w-[50px] h-[50px] shrink-0">
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r={radius} fill="none" stroke="#2D3342" strokeWidth="2.5" />
            <circle 
              cx="25" cy="25" r={radius} 
              fill="none" stroke="#abc4ff" strokeWidth="2.5" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <span className="text-[10px] font-bold font-mono text-white">{pct}%</span>
        </div>
        <div>
          <h2 className="text-[11px] font-bold tracking-[0.15em] text-white uppercase mb-1">
            {topicName} PATH
          </h2>
          <div className="text-xs font-mono text-on-surface-variant">
            {studiedCount}/{totalCount} Chapters Done
          </div>
        </div>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1" aria-label="Course Navigation">
        {tracks.map(track => {
          const isExpanded = expandedTracks.has(track._id);
          const isActiveTrack = track._id === activeTrackId;
          const trackChapters = isActiveTrack ? chapters : [];

          return (
            <div key={track._id} className="flex flex-col mb-1">
              {/* Track / Folder Level */}
              <button
                onClick={() => {
                  onSelectTrack(track);
                  if (!isExpanded) toggleTrack(track._id);
                }}
                aria-expanded={isExpanded}
                aria-controls={`track-content-${track._id}`}
                className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors group ${isActiveTrack ? 'text-[#abc4ff]' : 'text-on-surface-variant hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${isActiveTrack ? 'text-[#abc4ff]' : 'text-on-surface-variant'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <span className={`text-[14px] font-medium ${isActiveTrack ? 'text-[#abc4ff]' : 'text-on-surface-variant'}`}>
                    {track.name}
                  </span>
                </div>
                <div 
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-white/5 transition-colors"
                  aria-label={isExpanded ? "Collapse track" : "Expand track"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrack(track._id);
                  }}
                >
                  {isExpanded ? <ChevronDown size={14} className="opacity-70" /> : <ChevronRight size={14} className="opacity-70" />}
                </div>
              </button>

              {/* Chapters / Document Level (Accordion) */}
              <div 
                id={`track-content-${track._id}`}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isExpanded ? `${trackChapters.length * 50 + 20}px` : '0px',
                  opacity: isExpanded ? 1 : 0
                }}
              >
                <div className="pl-4 pr-1 py-2 space-y-0.5 border-l border-[#2D3342] ml-[21px] mt-1 relative">
                  {trackChapters.map(chapter => {
                    const isActive = chapter._id === activeChapterId;
                    return (
                      <div key={chapter._id} className="relative">
                        {isActive && (
                          <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#abc4ff] rounded-r-full"></div>
                        )}
                        <button
                          onClick={() => onSelectChapter(chapter)}
                          className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-all ${
                            isActive 
                              ? 'bg-[#1C1628] text-white font-medium border border-[#3A225E]' 
                              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <span className="truncate text-left">{chapter.title}</span>
                        </button>
                      </div>
                    );
                  })}
                  {isExpanded && trackChapters.length === 0 && isActiveTrack && (
                     <div className="px-4 py-2 text-xs italic text-on-surface-variant">
                       No documents
                     </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Need Help Card */}
      <div className="px-6 mt-8">
        <div className="bg-[#1C202B] border border-[#2D3342] rounded-xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white mb-2">Need Help?</h4>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
            Join our community forum for {topicName} developers.
          </p>
          <Link to="/forum" className="block w-full py-2 bg-[#abc4ff] hover:bg-[#b9cdff] text-[#0E1015] font-bold text-xs text-center rounded-lg transition-colors">
            Visit Forum
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NestedSidebar;
