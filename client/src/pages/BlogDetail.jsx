import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Heart, Bookmark, BookmarkCheck, Clock, Eye, Send, List, ChevronDown, ChevronUp } from 'lucide-react';
import { blogApi } from '../api/blog';
import { bookmarkApi } from '../api/userFeatures';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import Header from '../components/layout/Header';
import BlockNoteRenderer from '../components/ui/BlockNoteRenderer';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useReadingProgress } from '../hooks/useReadingProgress';

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
  const [tocCollapsed, setTocCollapsed] = useState(false);

  useEffect(() => {
    setLoading(true);
    blogApi.getBlogBySlug(slug).then(({ data }) => {
      setBlog(data.blog);
      setComments(data.comments);
      setUpNext(data.upNext || []);
      setLikeCount(data.likeCount);
      setLiked(user ? data.blog.likes.includes(user.id) : false);
      setLoading(false);
      // Jump back to the top of the reading pane on every new post,
      // otherwise scroll position carries over from the previous article.
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

  if (loading) {
    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Post not found.</div>
      </div>
    );
  }

  return (
    // Fixed-height shell on desktop so only the center article column
    // scrolls. On mobile this collapses to normal page scroll with the
    // rail stacked below the article, since a fixed split-pane doesn't
    // fit a small screen.
    <div className="lg:h-screen flex flex-col lg:overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />

      {/* Reading progress bar, pinned just under the header */}
      <div className="h-0.5 shrink-0" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* Fixed back button — pinned to top-left, OUTSIDE the scroll container */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border btn-press"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Main reading shell */}
      <div className="flex-1 lg:min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Center: scrolls on its own on desktop; normal flow on mobile */}
        <div ref={scrollRef} className="order-1 lg:overflow-y-auto py-8 lg:min-h-0">
          <article className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-10">
              <span className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>{blog.category}</span>
              <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-2 glow-title">{blog.title}</h1>
              {blog.subtitle && <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>{blog.subtitle}</p>}

              <div className="flex items-center justify-center gap-2.5 mb-6">
                <img src={blog.author?.avatar} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
                <div className="text-left">
                  <p className="text-sm font-medium">{blog.author?.name}</p>
                  <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {blog.readTimeMinutes} min read</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {blog.views} views</span>
                  </p>
                </div>
              </div>

              {blog.coverImage && (
                <img src={blog.coverImage} alt={blog.title} className="w-full rounded-2xl object-cover max-h-96" />
              )}
            </div>

            {blog.contentBlocks?.length > 0 ? (
              <BlockNoteRenderer blocks={blog.contentBlocks} />
            ) : (
              <div className="prose-content mb-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-8 mt-8">
              {blog.tags?.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-10 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={user ? handleLike : undefined}
                disabled={!user}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm btn-press"
                style={{ borderColor: 'var(--border)', color: liked ? 'var(--danger)' : 'var(--text)' }}
              >
                <Heart size={15} fill={liked ? 'var(--danger)' : 'none'} /> {likeCount}
              </button>
              {user && (
                <button onClick={handleBookmark} className="p-2 rounded-lg border btn-press" style={{ borderColor: 'var(--border)' }}>
                  {bookmarked ? <BookmarkCheck size={17} style={{ color: 'var(--accent)' }} /> : <Bookmark size={17} />}
                </button>
              )}
              {!user && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sign in to like and comment</span>}
            </div>

            <div>
              <h3 className="font-semibold mb-4">{comments.length} Comments</h3>

              {user ? (
                <form onSubmit={handleComment} className="flex gap-2 mb-6">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none input-focus"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <button type="submit" className="px-4 py-2.5 rounded-xl btn-press" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
                    <Send size={15} />
                  </button>
                </form>
              ) : (
                <div className="mb-6"><GoogleSignInButton /></div>
              )}

              <div className="flex flex-col gap-4">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <img src={c.user?.avatar} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{c.user?.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* Right rail — sticky, TOC with internal scroll so "Up Next" is always visible */}
        <aside className="order-2 py-8 lg:overflow-hidden">
          <div className="toc-panel">
            {headings.length > 0 && (
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                {/* TOC header — click to collapse/expand */}
                <button
                  onClick={() => setTocCollapsed((v) => !v)}
                  className="flex items-center justify-between w-full text-left mb-3 group"
                >
                  <p className="flex items-center gap-1.5 text-xs font-mono-display uppercase" style={{ color: 'var(--text-muted)' }}>
                    <List size={13} /> On this page
                  </p>
                  {tocCollapsed
                    ? <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} />
                  }
                </button>

                {/* Reading progress mini-bar */}
                <div className="progress-bar-track mb-3">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>

                {!tocCollapsed && (
                  <div className="toc-list flex flex-col gap-0.5">
                    {headings.map((h) => {
                      const isActive = h.id === activeHeadingId;
                      return (
                        <button
                          key={h.id}
                          onClick={() => scrollToHeading(h.id)}
                          className="text-left text-sm py-1.5 pl-3 border-l-2 transition-all duration-200 rounded-r"
                          style={{
                            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                            borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                            fontWeight: isActive ? 600 : 400,
                            backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                          }}
                        >
                          {h.text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Up Next — always visible below TOC, not inside the scrollable list */}
            {upNext.length > 0 && (
              <div>
                <p className="text-xs font-mono-display uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Up next</p>
                <div className="flex flex-col gap-3">
                  {upNext.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="block rounded-xl border overflow-hidden card-hover"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    >
                      {post.coverImage && (
                        <img src={post.coverImage} alt="" className="w-full h-20 object-cover" />
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium leading-snug">{post.title}</p>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={10} /> {post.readTimeMinutes} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogDetail;
