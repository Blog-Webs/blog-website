import React from 'react';
import { History, TrendingUp, X, Sparkles } from 'lucide-react';

const popularSearches = [
  'Java Ecosystem',
  'System Design',
  'Microservices',
  'Spring Security',
  'Binary Search',
  'CAP Theorem'
];

const trendingTopics = [
  { name: 'AI Engineering', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { name: 'Next.js 15', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { name: 'OAuth2 / JWT', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { name: 'Kubernetes', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
];

export const SearchSuggestions = ({ history, onSelect, onRemove, onClearAll }) => {
  return (
    <div className="p-4 space-y-6 text-sm">
      {/* Search History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            <span className="flex items-center gap-1.5">
              <History size={12} />
              Recent Searches
            </span>
            <button
              onClick={onClearAll}
              className="text-[10px] lowercase text-gray-500 hover:text-red-400 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-1">
            {history.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="flex items-center justify-between group px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => onSelect(item)}
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">{item}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-all duration-150"
                  aria-label={`Remove ${item} from history`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          <TrendingUp size={12} />
          Popular Searches
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          {popularSearches.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className="px-3.5 py-2 bg-[#161b22] border border-white/5 hover:border-[#7C5CFF]/30 hover:bg-[#7C5CFF]/5 text-gray-300 hover:text-white rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          <Sparkles size={12} className="text-purple-400" />
          Trending Topics
        </div>
        <div className="flex flex-wrap gap-2.5 px-1">
          {trendingTopics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => onSelect(topic.name)}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer ${topic.color}`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;
