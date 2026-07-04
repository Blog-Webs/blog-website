import { useState } from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="flex gap-4 p-6 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      {/* Author Sidebar */}
      <div className="flex flex-col items-center w-20 shrink-0">
        <img 
          src={reply.author?.avatar || `https://ui-avatars.com/api/?name=${reply.author?.name || 'User'}`}
          alt={reply.author?.name}
          className="w-12 h-12 rounded-full object-cover border-2"
          style={{ borderColor: isOp ? 'var(--primary)' : 'var(--border)' }}
        />
        <span className="text-xs font-bold mt-2 text-center break-words w-full">
          {reply.author?.name}
        </span>
        {isOp && <span className="text-[10px] uppercase text-primary font-bold mt-1 tracking-wider">Author</span>}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{new Date(reply.createdAt).toLocaleString()}</span>
          {reply.isAcceptedAnswer && (
            <span className="flex items-center gap-1 text-green-500 font-medium">
              <CheckCircle2 size={14} /> Accepted Answer
            </span>
          )}
        </div>
        
        <div 
          className="prose prose-sm max-w-none dark:prose-invert mb-6"
          dangerouslySetInnerHTML={{ __html: reply.content }}
        />

        {/* Action Bar */}
        <div className="mt-auto flex items-center gap-4">
          <button 
            onClick={handleLike}
            disabled={!user || isLiking}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-red-500 ${hasLiked ? 'text-red-500' : ''}`}
            style={{ color: hasLiked ? undefined : 'var(--text-muted)' }}
          >
            <Heart size={16} className={hasLiked ? 'fill-current' : ''} />
            {likes.length} Likes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyCard;
