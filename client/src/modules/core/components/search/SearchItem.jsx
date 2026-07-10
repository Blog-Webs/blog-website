import React from 'react';
import { Layout, FileText, BookOpen } from 'lucide-react';
import { optimizeImage } from '../../../../utils/image';

const highlightText = (text, highlight) => {
  if (!text) return '';
  if (!highlight || !highlight.trim()) return text;
  
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-[#7C5CFF]/30 text-white font-semibold rounded-[2px] px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const SearchItem = ({ item, type, highlight, isActive, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'topic':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#7C5CFF]/10 text-[#7C5CFF]">
            <Layout size={15} />
          </div>
        );
      case 'chapter':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#4F9DFF]/10 text-[#4F9DFF]">
            <FileText size={15} />
          </div>
        );
      case 'blog':
        if (item.coverImage) {
          return (
            <img 
              src={optimizeImage(item.coverImage)} 
              className="w-8 h-8 rounded-lg object-cover shrink-0" 
              alt="" 
            />
          );
        }
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/5 text-[#A1A1AA]">
            <BookOpen size={15} />
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'topic':
        return item.name;
      case 'chapter':
        return `Chapter ${item.chapterNumber}: ${item.title}`;
      case 'blog':
        return item.title;
      default:
        return '';
    }
  };

  const getSubtext = () => {
    switch (type) {
      case 'topic':
        return item.subject ? `in ${item.subject.name}` : '';
      case 'chapter':
        return item.track ? `in ${item.track.name}` : '';
      case 'blog':
        return item.category ? `Category: ${item.category}` : '';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3.5 transition-all duration-200 border border-transparent outline-none ${
        isActive 
          ? 'bg-white/5 border-white/10 shadow-[0_0_12px_rgba(124,92,255,0.1)] translate-x-1' 
          : 'hover:bg-white/5'
      }`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {highlightText(getTitle(), highlight)}
        </p>
        <p className="text-xs text-[#A1A1AA] truncate mt-0.5">
          {getSubtext()}
        </p>
      </div>
      {isActive && (
        <span className="text-[10px] bg-white/10 text-white font-mono px-1.5 py-0.5 rounded border border-white/10">
          Enter
        </span>
      )}
    </button>
  );
};

export default SearchItem;
