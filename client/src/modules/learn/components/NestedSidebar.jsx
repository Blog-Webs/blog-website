import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const NestedSidebar = ({
  subjectName = 'Documentation',
  chapters = [], 
  activeChapterId,
  onSelectChapter,
  studiedCount = 0,
  totalCount = 0,
}) => {
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
            {subjectName} PATH
          </h2>
          <div className="text-xs font-mono text-on-surface-variant">
            {studiedCount}/{totalCount} Chapters Done
          </div>
        </div>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1" aria-label="Course Navigation">
        {chapters.length === 0 ? (
          <div className="px-4 py-4 text-xs italic text-[#8B949E]">
            No chapters available yet.
          </div>
        ) : (
          chapters.map(chapter => {
            const isActive = chapter._id === activeChapterId;
            return (
              <div key={chapter._id} className="relative group">
                {isActive && (
                  <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#abc4ff] rounded-r-full"></div>
                )}
                <button
                  onClick={() => onSelectChapter(chapter)}
                  className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all ${
                    isActive 
                      ? 'bg-[#1C1628] text-white font-medium border border-[#3A225E]' 
                      : 'text-on-surface-variant hover:text-white hover:bg-[#161B22] border border-transparent'
                  }`}
                >
                  <FileText size={14} className={`mr-3 shrink-0 ${isActive ? 'text-[#abc4ff]' : 'text-[#8B949E] group-hover:text-white'}`} />
                  <span className="truncate text-left">{chapter.title}</span>
                </button>
              </div>
            );
          })
        )}
      </nav>

      {/* Need Help Card */}
      <div className="px-6 mt-8">
        <div className="bg-[#1C202B] border border-[#2D3342] rounded-xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white mb-2">Need Help?</h4>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
            Join our community forum for {subjectName} developers.
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
