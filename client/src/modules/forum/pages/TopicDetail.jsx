import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, Send, Loader2, Sparkles } from 'lucide-react';
import { forumApi } from '../api/forum';
import { useAuth } from '../../core/context/AuthContext';
import ReplyCard from '../components/ReplyCard';
import ReplySkeleton from '../components/ReplySkeleton';
import MarkdownEditor from '../../core/components/ui/MarkdownEditor';

const TopicDetail = () => {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await forumApi.getTopicBySlug(topicSlug);
        setTopic(res.data.topic);
        setReplies(res.data.replies);
      } catch (err) {
        console.error('Failed to fetch topic:', err);
        navigate('/forum');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopic();
  }, [topicSlug, navigate]);

  const handlePostReply = async () => {
    if (!replyContent.trim()) return;
    setIsReplying(true);
    try {
      const res = await forumApi.createReply(topic._id, replyContent);
      setReplies([...replies, res.data]);
      setReplyContent('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={topic ? `/forum/${topic.category.slug}` : '/forum'}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft size={16} /> Back to {topic ? topic.category.name : 'Category'}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            {topic?.isLocked && <Lock className="text-red-500" size={24} />}
            {isLoading ? <div className="h-8 w-64 bg-black/10 dark:bg-white/10 rounded animate-pulse" /> : topic?.title}
          </h1>
        </div>
      </div>

      {/* Main Topic & Replies Container */}
      <div className="mb-12">
        {isLoading ? (
          <>
            <ReplySkeleton />
            <ReplySkeleton />
            <ReplySkeleton />
          </>
        ) : (
          <>
            {/* Original Post */}
            <ReplyCard 
              reply={{ ...topic, createdAt: topic.createdAt }} 
              isOp={true} 
            />
            
            {/* Replies */}
            {replies.length > 0 ? (
              replies.map(reply => (
                <ReplyCard 
                  key={reply._id} 
                  reply={reply} 
                  isOp={reply.author?._id === topic.author?._id}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm border-t" style={{ borderColor: 'var(--border)' }}>
                No replies yet.
              </div>
            )}
          </>
        )}
      </div>

      {/* Reply Box (Glassmorphism) */}
      {!isLoading && !topic.isLocked && user && (
        <div 
          className="rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl border shadow-2xl transition-all duration-300 hover:shadow-primary/20" 
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)', 
            borderColor: 'color-mix(in srgb, var(--primary) 20%, var(--border))' 
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-green-500 opacity-50" />
          
          <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
            <Sparkles size={18} className="text-primary" /> Post a Reply
          </h3>
          
          <div className="rounded-xl overflow-hidden mb-4 shadow-inner" style={{ backgroundColor: 'var(--bg)' }}>
            <MarkdownEditor value={replyContent} onChange={setReplyContent} />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handlePostReply}
              disabled={isReplying || !replyContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:transform-none shadow-lg shadow-primary/30"
            >
              {isReplying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Post Reply
            </button>
          </div>
        </div>
      )}

      {!isLoading && topic?.isLocked && (
        <div className="p-6 text-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-medium flex items-center justify-center gap-2">
          <Lock size={18} /> This topic is locked.
        </div>
      )}

      {!isLoading && !topic?.isLocked && !user && (
        <div className="p-8 text-center rounded-2xl border backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 50%, transparent)', borderColor: 'var(--border)' }}>
          <p className="text-muted-foreground mb-4">You must be logged in to reply to this topic.</p>
          <button className="px-6 py-2 rounded-xl bg-primary/10 text-primary font-bold transition-colors hover:bg-primary/20">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicDetail;
