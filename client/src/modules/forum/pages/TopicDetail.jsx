import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, Send, Loader2 } from 'lucide-react';
import { forumApi } from '../api/forum';
import { useAuth } from '../../core/context/AuthContext';
import ReplyCard from '../components/ReplyCard';
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

  if (isLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!topic) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={`/forum/${topic.category.slug}`} 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to {topic.category.name}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-black font-mono-display flex items-center gap-3">
            {topic.isLocked && <Lock className="text-red-500" size={24} />}
            {topic.title}
          </h1>
        </div>
      </div>

      {/* Main Topic & Replies Container */}
      <div className="rounded-2xl border mb-8 bg-surface overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        
        {/* Original Post */}
        <ReplyCard 
          reply={{ ...topic, createdAt: topic.createdAt }} 
          isOp={true} 
        />
        
        {/* Replies */}
        <div className="bg-black/5 dark:bg-white/5 border-t border-b" style={{ borderColor: 'var(--border)' }}>
          {replies.length > 0 ? (
            replies.map(reply => (
              <ReplyCard 
                key={reply._id} 
                reply={reply} 
                isOp={reply.author?._id === topic.author?._id}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No replies yet.
            </div>
          )}
        </div>
      </div>

      {/* Reply Box */}
      {!topic.isLocked && user ? (
        <div className="rounded-2xl border p-6 bg-surface shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4">Post a Reply</h3>
          <div className="border rounded-xl overflow-hidden mb-4" style={{ borderColor: 'var(--border)' }}>
            <MarkdownEditor value={replyContent} onChange={setReplyContent} />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handlePostReply}
              disabled={isReplying || !replyContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isReplying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Post Reply
            </button>
          </div>
        </div>
      ) : topic.isLocked ? (
        <div className="p-6 text-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-medium flex items-center justify-center gap-2">
          <Lock size={18} /> This topic is locked.
        </div>
      ) : (
        <div className="p-6 text-center rounded-2xl border bg-surface" style={{ borderColor: 'var(--border)' }}>
          <p className="text-muted-foreground mb-4">You must be logged in to reply to this topic.</p>
          <button className="px-6 py-2 rounded-xl bg-primary/10 text-primary font-bold">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicDetail;
