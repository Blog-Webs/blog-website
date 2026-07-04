import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';

const TopicRow = ({ topic }) => {
  return (
    <Link 
      to={`/forum/topic/${topic.slug}`}
      className="block p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-12">
          <h4 className="font-semibold text-[1.1rem] hover:text-primary transition-colors truncate mb-1">
            {topic.isPinned && <span className="inline-block align-text-bottom mr-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg></span>}
            {topic.isLocked && <span className="inline-block align-text-bottom mr-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>}
            {topic.title}
          </h4>
          
          <div className="flex items-center gap-2 mt-2 text-[0.8rem]" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium text-foreground opacity-80">{topic.author?.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(topic.lastActivityAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-end min-w-[3rem] text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <MessageSquare size={16} />
            <span>{topic.replyCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicRow;
