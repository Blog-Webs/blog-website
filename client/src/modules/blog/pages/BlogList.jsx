import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi, newsletterApi } from '../api/blog';
import { ArticleSkeleton } from '../../core/components/ui/Skeleton';

const BlogList = () => {
  const [activeFilter, setActiveFilter] = useState('All Posts');
  const [blogs, setBlogs] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [categories, setCategories] = useState([]);

  const filters = ['All Posts', ...categories];

  useEffect(() => {
    blogApi.getTagsAndCategories()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      page,
      limit: 7, // 1 featured + 6 latest
    };
    if (activeFilter !== 'All Posts') {
      params.category = activeFilter;
    }
    blogApi.getBlogs(params)
      .then(({ data }) => {
        const allBlogs = data.blogs || [];
        if (allBlogs.length > 0) {
          setFeaturedBlog(allBlogs[0]);
          setBlogs(allBlogs.slice(1));
        } else {
          setFeaturedBlog(null);
          setBlogs([]);
        }
        setTotalPages(data.pages || 1);
      })
      .catch((err) => {
        console.error('Failed to fetch blogs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeFilter, page]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      await newsletterApi.subscribe(newsletterEmail);
      setSubscribed(true);
      setSubError('');
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      setSubError(err.response?.data?.message || 'Subscription failed.');
      setTimeout(() => setSubError(''), 5000);
    }
  };

  const fallbackPosts = [
    {
      _id: '1',
      title: 'Beyond Transformers: The Rise of State Space Models',
      subtitle: 'Exploring the next generation of LLM architecture that promises infinite context windows and efficient training.',
      category: 'AI/ML',
      author: { name: 'Sarah Jenkins' },
      createdAt: '2024-03-12T00:00:00.000Z',
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
      slug: 'beyond-transformers'
    },
    {
      _id: '2',
      title: 'Ephemeral Infrastructure with NixOS and Flakes',
      subtitle: 'How we moved our entire local development to reproducible, declarative systems that never break.',
      category: 'INFRASTRUCTURE',
      author: { name: 'Marcus Chen' },
      createdAt: '2024-03-10T00:00:00.000Z',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
      slug: 'ephemeral-infrastructure'
    },
    {
      _id: '3',
      title: 'The Zero Trust Fallacy: Rethinking Cloud Security',
      subtitle: 'Zero trust is a marketing buzzword. Real infrastructure security demands a more nuanced, defense-in-depth approach.',
      category: 'SECURITY',
      author: { name: 'Elena Thorne' },
      createdAt: '2024-03-08T00:00:00.000Z',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
      slug: 'zero-trust-fallacy'
    },
    {
      _id: '4',
      title: 'WebGPU in the Browser: Mastering the Rendering Pipeline',
      subtitle: 'A bottoms-up deep dive into compute shaders, multithreading, and insane browser performance leaps.',
      category: 'FRONTEND',
      author: { name: 'David Vo' },
      createdAt: '2024-03-05T00:00:00.000Z',
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
      slug: 'webgpu-in-browser'
    },
    {
      _id: '5',
      title: 'Smart Contracts Beyond the Hype: Pragmatic Uses',
      subtitle: 'Looking past the noise to find real enterprise value in decentralized ledgers and automated agreements.',
      category: 'WEB3',
      author: { name: 'Alex Rivera' },
      createdAt: '2024-03-02T00:00:00.000Z',
      coverImage: 'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&q=80&w=800',
      slug: 'smart-contracts-beyond-hype'
    },
    {
      _id: '6',
      title: 'The Return of the Monolith? A Contrarian View',
      subtitle: 'Why modern hardware and mature frameworks might make the distributed systems architecture obsolete for 99% of apps.',
      category: 'ARCHITECTURE',
      author: { name: 'Sarah Jenkins' },
      createdAt: '2024-02-28T00:00:00.000Z',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      slug: 'return-of-monolith'
    }
  ];

  return (
    <div className="pt-24 pb-16 px-gutter max-w-max-width mx-auto">
      
      {/* Filters (Scrollable on mobile) */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-8 border-b border-outline-variant/10">
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter 
                ? 'bg-primary/20 text-primary border border-primary/20' 
                : 'border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        {/* Main Content Area (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-12">
          
          {loading ? (
            <div className="space-y-12">
              <ArticleSkeleton />
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {(featuredBlog || fallbackPosts[0]) && (() => {
                const post = featuredBlog || fallbackPosts[0];
                return (
                  <article className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden card-hover transition-all duration-300 text-left">
                    <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                      <img className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" src={post.coverImage || "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200"} alt={post.title} />
                    </div>
                    <div className="p-6 md:p-8 flex-1 flex flex-col text-left">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border border-primary/20">{post.category || 'ENGINEERING'}</span>
                        <span className="text-on-surface-variant text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {post.readTimeMinutes || 10} MIN READ</span>
                      </div>
                      
                      <Link to={`/blog/${post.slug}`}>
                        <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4 hover:text-primary transition-colors leading-tight font-bold">
                          {post.title}
                        </h2>
                      </Link>
                      
                      <p className="text-on-surface-variant font-body-md mb-8 font-normal">
                        {post.excerpt || post.subtitle || 'Deep dive into the landscape.'}
                      </p>
                      
                      <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-outline-variant/10 pt-6">
                        <div className="flex items-center gap-3">
                          {post.author?.avatar ? (
                            <img className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" src={post.author.avatar} alt={post.author?.name} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase text-white">
                              {(post.author?.name || 'SW')[0]}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-on-surface">{post.author?.name || 'Staff Writer'}</div>
                            <div className="text-xs text-on-surface-variant">{post.author?.role || 'Lead Contributor'}</div>
                          </div>
                        </div>
                        
                        <Link to={`/blog/${post.slug}`} className="bg-[#abc4ff] text-[#0a0a0a] px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#b9cdff] transition-colors">
                          Read Article <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })()}

              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <h3 className="font-display text-headline-md text-on-surface">Latest Intelligence</h3>
              </div>

              {/* List of Posts */}
              <div className="space-y-6">
                {(blogs.length > 0 ? blogs : fallbackPosts.slice(1)).map(post => (
                  <article key={post._id} className="flex flex-col sm:flex-row bg-[#111113] border border-outline-variant/20 rounded-xl overflow-hidden hover:border-outline-variant/50 transition-colors group text-left">
                    <div className="w-full sm:w-1/3 md:w-2/5 h-48 sm:h-auto overflow-hidden relative shrink-0">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={post.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'} alt={post.title} />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/5 backdrop-blur-md text-primary bg-primary/10">
                        {post.category || 'Engineering'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col text-left">
                      <Link to={`/blog/${post.slug}`}>
                        <h4 className="font-display text-lg text-on-surface mb-2 group-hover:text-primary transition-colors leading-tight font-bold">
                          {post.title}
                        </h4>
                      </Link>
                      <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 flex-grow font-normal">
                        {post.excerpt || post.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-auto text-xs">
                        <div className="w-6 h-6 rounded-full bg-surface-container-highest overflow-hidden">
                           {post.author?.avatar ? (
                             <img src={post.author.avatar} alt={post.author?.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gray-700 text-[10px] text-white font-bold uppercase">
                               {(post.author?.name || 'SW')[0]}
                             </div>
                           )}
                        </div>
                        <div>
                          <span className="font-medium text-on-surface">{post.author?.name || 'Staff Writer'}</span>
                          <span className="text-on-surface-variant/50 mx-1">•</span>
                          <span className="text-on-surface-variant">{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-sm transition-colors ${
                        page === idx + 1 
                          ? 'bg-[#abc4ff] text-black' 
                          : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar (4 cols on desktop) */}
        <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <div className="sticky top-24">
            <div className="bg-[#111113] border border-outline-variant/20 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#abc4ff]/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#abc4ff] text-[24px]">forward_to_inbox</span>
              </div>
              <h4 className="font-display text-2xl text-on-surface mb-4 leading-tight font-bold">
                Join 50,000+ developers receiving our weekly intel.
              </h4>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed font-normal">
                Get the latest engineering insights, AI research, and architecture patterns delivered straight to your inbox. No spam, ever.
              </p>
              
              <form className="w-full space-y-4" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="dev@work.com" 
                  className="w-full bg-[#0a0a0a] border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-[#abc4ff] focus:ring-1 focus:ring-[#abc4ff] outline-none transition-all text-on-surface placeholder:text-on-surface-variant/50 text-center"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button type="submit" className="w-full bg-[#abc4ff] text-[#0a0a0a] font-bold py-3 rounded-lg hover:bg-[#b9cdff] transition-colors text-sm">
                  Subscribe
                </button>
              </form>
              {subscribed && <p className="text-emerald-400 mt-2 text-xs font-semibold">Subscribed successfully!</p>}
              {subError && <p className="text-red-400 mt-2 text-xs font-semibold">{subError}</p>}
              <p className="text-[10px] text-on-surface-variant/50 mt-4 font-normal">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogList;
