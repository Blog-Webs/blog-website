import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Clock, Heart, Send } from 'lucide-react';
import { blogApi } from '../api/blog';
import { bookmarkApi } from '../api/userFeatures';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import BlockNoteRenderer from '../components/ui/BlockNoteRenderer';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useReadingProgress } from '../hooks/useReadingProgress';
import StickyTableOfContents from '../components/learn/StickyTableOfContents';
import FloatingActionBar from '../components/learn/FloatingActionBar';
import AuthorMetaCard from '../components/learn/AuthorMetaCard';
import { optimizeImage } from '../utils/image';
import CodeBlock from '../components/ui/CodeBlock';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [upNext, setUpNext] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    blogApi.getBlogBySlug(slug).then(({ data }) => {
      setBlog(data.blog);
      setComments(data.comments);
      setUpNext(data.upNext || []);
      setLikeCount(data.likeCount);
      setLiked(user ? data.blog.likes.includes(user.id) : false);
      setLoading(false);
      scrollRef.current?.scrollTo({ top: 0 });
    });
  }, [slug, user]);

  useEffect(() => {
    if (!user || !blog) return;
    bookmarkApi.getAll().then(({ data }) => {
      setBookmarked(data.bookmarks.some((b) => b.itemType === 'blog' && b.blog?._id === blog._id));
    });
  }, [user, blog]);

  const headings = blog?.headings || [];
  const activeHeadingId = useScrollSpy(headings, scrollRef);
  const progress = useReadingProgress(scrollRef);

  const handleLike = async () => {
    const { data } = await blogApi.toggleLike(slug);
    setLiked(data.liked);
    setLikeCount(data.likeCount);
  };

  const handleBookmark = async () => {
    const { data } = await bookmarkApi.toggle('blog', blog._id);
    setBookmarked(data.bookmarked);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { data } = await blogApi.addComment(slug, commentText);
    setComments((prev) => [data.comment, ...prev]);
    setCommentText('');
  };

  const scrollToHeading = (id) => {
    scrollRef.current?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Compute Prev / Next based on "upNext"
  const hasNext = upNext.length > 0;
  const handleNext = () => {
    if (hasNext) navigate(`/blog/${upNext[0].slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-muted)' }}>
        Post not found.
      </div>
    );
  }

  return (
    <div className="lg:h-screen flex flex-col lg:overflow-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* Progress bar top strip */}
      <div className="h-0.5 shrink-0 z-50 relative" style={{ backgroundColor: 'var(--border)' }}>
        <div className="h-full transition-[width] duration-150 ease-out" style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }} />
      </div>

      {/* Header Strip with Breadcrumbs */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 max-w-[1400px] mx-auto w-full flex items-center justify-between gap-4 z-40 relative"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border btn-press shrink-0 glass-btn"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Blogs</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--accent)' }}>
            {blog.category}
          </span>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-sm truncate hidden md:inline" style={{ color: 'var(--text-muted)' }}>
            {blog.title}
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div 
        className={`flex-1 lg:min-h-0 max-w-[1400px] mx-auto w-full flex flex-col lg:grid gap-0 transition-all duration-300 ease-in-out ${
          isReadingMode ? 'lg:grid-cols-[0px_1fr_0px]' : 'lg:grid-cols-[280px_1fr_260px]'
        }`}
      >
        {/* LEFT sidebar — Up Next */}
        <aside className={`order-3 lg:order-1 overflow-hidden transition-all duration-300 ease-in-out ${isReadingMode ? 'opacity-0 w-0' : 'opacity-100'}`}>
          <div className="h-full lg:overflow-y-auto py-6 px-4 border-r border-black/5 dark:border-white/5">
            {upNext.length > 0 && (
              <div>
                <p className="text-xs font-mono-display uppercase mb-4 tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Up next
                </p>
                <div className="flex flex-col gap-4">
                  {upNext.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="block rounded-xl border overflow-hidden card-hover"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    >
                      {post.coverImage && (
                        <img src={optimizeImage(post.coverImage)} alt="" className="w-full h-24 object-cover" />
                      )}
                      <div className="p-3.5">
                        <p className="text-sm font-semibold leading-snug line-clamp-2">{post.title}</p>
                        <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={11} /> {post.readTimeMinutes} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER — Article */}
        <div ref={scrollRef} className="order-1 lg:order-2 lg:overflow-y-auto py-8 lg:min-h-0 relative pb-32 px-4 sm:px-8">
          <article className="max-w-[850px] mx-auto w-full mac-window">
            <div className="mac-window-header">
              <div className="mac-window-controls">
                <div className="mac-dot-close"></div>
                <div className="mac-dot-min"></div>
                <div className="mac-dot-max"></div>
              </div>
              <div className="mac-window-title">{blog.title}</div>
            </div>
            
            <div className="p-6 sm:p-10 md:p-12">
              {/* Header */}
            <div className="mb-6">
              <span className="text-xs font-mono-display px-2 py-1 rounded-full border mb-4 inline-block" style={{ color: 'var(--accent)', borderColor: 'var(--accent-soft)' }}>
                {blog.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold mt-2 mb-4 glow-title leading-tight">{blog.title}</h1>
              {blog.subtitle && (
                <p className="text-lg sm:text-xl mb-6" style={{ color: 'var(--text-muted)' }}>{blog.subtitle}</p>
              )}

              <AuthorMetaCard 
                authorName={blog.author?.name}
                authorAvatar={blog.author?.avatar}
                lastUpdated={blog.updatedAt || blog.createdAt}
                readTimeMinutes={blog.readTimeMinutes}
              />

              {blog.coverImage && (
                <div className="image-glow rounded-2xl overflow-hidden mb-10 border border-black/5 dark:border-white/5">
                  <img src={optimizeImage(blog.coverImage)} alt={blog.title} className="w-full object-cover max-h-[500px]" />
                </div>
              )}
            </div>

            {/* Body */}
            {blog.contentBlocks?.length > 0 ? (
              <BlockNoteRenderer blocks={blog.contentBlocks} />
            ) : (
              <div className="prose-content mb-8">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{ code: CodeBlock }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-10 mt-10">
              {blog.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--surface)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Like */}
            <div className="flex items-center gap-4 mb-10 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={user ? handleLike : undefined}
                disabled={!user}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm btn-press transition-all"
                style={{ 
                  borderColor: liked ? 'var(--danger)' : 'var(--border)', 
                  color: liked ? 'var(--danger)' : 'var(--text)',
                  backgroundColor: liked ? 'rgba(239,68,68,0.1)' : 'transparent'
                }}
              >
                <Heart size={16} fill={liked ? 'var(--danger)' : 'none'} /> {likeCount} Likes
              </button>
              {!user && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sign in to like and comment</span>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>

              {user ? (
                <form onSubmit={handleComment} className="flex gap-3 mb-8">
                  <img src={user.picture} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="flex-1 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment…"
                      className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none input-focus transition-all shadow-sm"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-5 py-2.5 rounded-xl btn-press font-medium disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8"><GoogleSignInButton /></div>
              )}

              <div className="flex flex-col gap-6">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-4 group">
                    <img
                      src={c.user?.avatar}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex-1">
                      <p className="text-sm font-semibold mb-1">{c.user?.name}</p>
                      <p className="text-sm leading-relaxed opacity-90">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Floating Action Bar */}
          <FloatingActionBar 
            onPrev={() => navigate(-1)} 
            onNext={handleNext} 
            hasPrev={true} 
            hasNext={hasNext}
            isBookmarked={bookmarked}
            onToggleBookmark={user ? handleBookmark : () => {}}
            isReadingMode={isReadingMode}
            onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
          />
        </div>

        {/* RIGHT sidebar — Sticky TOC */}
        <aside className={`order-2 lg:order-3 overflow-hidden transition-all duration-300 ease-in-out hidden lg:block ${isReadingMode ? 'opacity-0 w-0' : 'opacity-100'}`}>
          <div className="h-full lg:overflow-y-auto">
            <StickyTableOfContents 
              headings={headings}
              activeHeadingId={activeHeadingId}
              onHeadingClick={scrollToHeading}
            />
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogDetail;
