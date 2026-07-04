import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';

const TopicRow = ({ topic }) => {
  return (
    <div 
      className="p-4 border-b last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <Link to={`/forum/topic/${topic.slug}`} className="block">
          <h4 className="font-bold text-lg hover:text-primary transition-colors truncate flex items-center gap-2">
            {topic.isPinned && <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Pinned</span>}
            {topic.isLocked && <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full">Locked</span>}
            {topic.title}
          </h4>
        </Link>
        <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <img 
            src={topic.author?.avatar || `https://ui-avatars.com/api/?name=${topic.author?.name || 'User'}`}
            alt={topic.author?.name}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span>{topic.author?.name}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {new Date(topic.lastActivityAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
        <div className="flex flex-col items-center min-w-[3rem]">
          <span className="text-foreground">{topic.replyCount}</span>
          <span className="text-xs">Replies</span>
        </div>
        <div className="flex flex-col items-center min-w-[3rem]">
          <span className="text-foreground">{topic.views}</span>
          <span className="text-xs">Views</span>
        </div>
      </div>
    </div>
  );
};

export default TopicRow;
