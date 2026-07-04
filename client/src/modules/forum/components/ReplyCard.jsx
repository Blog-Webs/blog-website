import { useState } from 'react';
import { Heart, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { forumApi } from '../api/forum';

const ReplyCard = ({ reply, isOp }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(reply.likes || []);
  const [isLiking, setIsLiking] = useState(false);

  const hasLiked = user ? likes.includes(user._id) : false;

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      const res = await forumApi.toggleLikeReply(reply._id);
      setLikes(res.data.likes);
    } catch (err) {
      console.error('Error liking reply', err);
    } finally {
      setIsLiking(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  };

  return (
    <div className="py-6 border-b last:border-b-0 group" style={{ borderColor: 'var(--border)' }}>
      {/* Header Inline */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={reply.author?.avatar || `https://ui-avatars.com/api/?name=${reply.author?.name || 'User'}`}
            alt={reply.author?.name}
            className="w-10 h-10 rounded-xl object-cover shadow-sm"
          />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              {reply.author?.name}
            </span>
            {isOp && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                Author
              </span>
            )}
            {reply.isAcceptedAnswer && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Accepted
              </span>
            )}
          </div>
        </div>
        <div className="text-sm opacity-50" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(reply.createdAt)}
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="prose prose-sm md:prose-base max-w-none dark:prose-invert mb-4 pl-13"
        dangerouslySetInnerHTML={{ __html: reply.content }}
      />

      {/* Action Bar */}
      <div className="flex items-center gap-6 pl-13 text-sm" style={{ color: 'var(--text-muted)' }}>
        <button 
          onClick={handleLike}
          disabled={!user || isLiking}
          className={`flex items-center gap-1.5 font-medium transition-colors hover:text-red-500 ${hasLiked ? 'text-red-500' : ''}`}
        >
          <Heart size={16} className={hasLiked ? 'fill-current' : ''} />
          <span>{likes.length}</span>
        </button>
        <button className="flex items-center gap-1.5 font-medium transition-colors hover:text-foreground opacity-50 hover:opacity-100">
          <LinkIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReplyCard;
