import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Share2 } from 'lucide-react';
import { blogApi } from '../api/blog';
import { bookmarkApi } from '../../workspace/api/userFeatures';
import api from '../../core/api/client';
import { useAuth } from '../../core/context/AuthContext';
import BlockNoteRenderer from '../../core/components/ui/BlockNoteRenderer';
import AuthorMetaCard from '../../learn/components/AuthorMetaCard';
import { optimizeImage } from '../../../utils/image';
import CodeBlock from '../../core/components/ui/CodeBlock';
import { ArticleSkeleton } from '../../core/components/ui/Skeleton';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const [blog, setBlog] = useState(null);
  const [upNext, setUpNext] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogApi.getBlogBySlug(slug).then(({ data }) => {
      setBlog(data.blog);
      setUpNext(data.upNext || []);
      setLoading(false);
      window.scrollTo({ top: 0 });
    });
  }, [slug, user]);

  const hasNext = upNext.length > 0;
  const nextPost = hasNext ? upNext[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-[#0a0a0a]">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500">
        Post not found.
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-200 font-sans pb-24">
      <div className="max-w-[760px] mx-auto px-6 pt-12 md:pt-20">
        {/* Breadcrumbs */}
        <div className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-6 flex flex-wrap gap-2">
          <span>DOCUMENTATION</span>
          <span>&gt;</span>
          <span>{blog.category?.toUpperCase() || 'ARTICLE'}</span>
          <span>&gt;</span>
          <span className="text-[#6366F1]">{blog.title.toUpperCase()}</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-white leading-[1.2] tracking-tight mb-4">
          {blog.title}
        </h1>
        {blog.subtitle && (
          <p className="text-[17px] text-gray-300 leading-relaxed mb-6">
            {blog.subtitle}
          </p>
        )}

        <AuthorMetaCard 
          authorName={blog.author?.name}
          authorAvatar={blog.author?.avatar}
          lastUpdated={blog.updatedAt || blog.createdAt}
          readTimeMinutes={blog.readTimeMinutes}
        />

        {blog.coverImage && (
          <div className="rounded-xl overflow-hidden mb-12 border border-white/5">
            <img src={optimizeImage(blog.coverImage)} alt={blog.title} className="w-full object-cover" />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 mb-16" style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.75' }}>
          {blog.contentBlocks?.length > 0 ? (
            <BlockNoteRenderer blocks={blog.contentBlocks} />
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{ code: CodeBlock }}
            >
              {blog.content}
            </ReactMarkdown>
          )}
        </div>

        <hr className="border-white/10 mb-12" />

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-colors text-left min-w-[140px]">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Previous</span>
              <span className="block text-sm font-semibold text-white">Getting Started</span>
            </button>
            <button className="flex-1 sm:flex-none border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-colors text-left min-w-[140px]">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Next</span>
              <span className="block text-sm font-semibold text-white">{nextPost ? nextPost.title : 'Deploying to Cloud'}</span>
            </button>
          </div>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#abc4ff] text-[#0a0a0a] px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
            <Share2 size={16} /> Share Article
          </button>
        </div>

      </div>
    </div>
  );
};

export default BlogDetail;
