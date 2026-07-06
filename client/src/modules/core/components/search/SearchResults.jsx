import React from 'react';
import SearchItem from './SearchItem';
import { Search } from 'lucide-react';

export const SearchSkeleton = () => {
  return (
    <div className="p-3 space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="space-y-2">
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 border border-transparent animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/3 bg-white/10 rounded" />
                  <div className="h-3 w-1/4 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SearchEmptyState = ({ query }) => {
  return (
    <div className="py-16 text-center space-y-3">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#A1A1AA] border border-white/5">
        <Search size={28} className="opacity-50" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">No results found</p>
        <p className="text-xs text-[#A1A1AA] mt-1 max-w-[280px] mx-auto leading-relaxed">
          We couldn't find anything matching "{query}". Please check spelling or try a different term.
        </p>
      </div>
    </div>
  );
};

export const SearchResults = ({ results, query, activeIndex, onSelect }) => {
  const { topics = [], chapters = [], blogs = [] } = results;

  // Flatten results for flat index comparison in keyboard navigation
  const flatResults = [
    ...topics.map((item) => ({ ...item, type: 'topic' })),
    ...chapters.map((item) => ({ ...item, type: 'chapter' })),
    ...blogs.map((item) => ({ ...item, type: 'blog' }))
  ];

  return (
    <div className="p-2 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
      {/* Topics Group */}
      {topics.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="px-3.5 pt-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase font-mono">
            Topics
          </h3>
          <div className="space-y-0.5">
            {topics.map((topic, i) => {
              const flatIndex = i;
              return (
                <SearchItem
                  key={topic._id}
                  item={topic}
                  type="topic"
                  highlight={query}
                  isActive={flatIndex === activeIndex}
                  onClick={() => onSelect(topic, 'topic')}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Chapters Group */}
      {chapters.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="px-3.5 pt-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase font-mono">
            Chapters
          </h3>
          <div className="space-y-0.5">
            {chapters.map((chapter, i) => {
              const flatIndex = topics.length + i;
              return (
                <SearchItem
                  key={chapter._id}
                  item={chapter}
                  type="chapter"
                  highlight={query}
                  isActive={flatIndex === activeIndex}
                  onClick={() => onSelect(chapter, 'chapter')}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Blogs Group */}
      {blogs.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="px-3.5 pt-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase font-mono">
            Blogs
          </h3>
          <div className="space-y-0.5">
            {blogs.map((blog, i) => {
              const flatIndex = topics.length + chapters.length + i;
              return (
                <SearchItem
                  key={blog._id}
                  item={blog}
                  type="blog"
                  highlight={query}
                  isActive={flatIndex === activeIndex}
                  onClick={() => onSelect(blog, 'blog')}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
