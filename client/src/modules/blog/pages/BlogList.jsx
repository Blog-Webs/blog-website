import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import Pagination from '../../core/components/ui/Pagination';
import { blogApi } from '../api/blog';
import { seriesApi } from '../api/series';
import { CardGridSkeleton } from '../../core/components/ui/Skeleton';
import { optimizeImage } from '../../../utils/image';

const PAGE_SIZE = 9;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getTagsAndCategories().then(({ data }) => setCategories(data.categories)).catch(() => {});
    seriesApi.getAll().then(({ data }) => setSeries(data.series)).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (category) params.category = category;
    blogApi
      .getBlogs(params)
      .then(({ data }) => {
        setBlogs(data.blogs);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const standardPosts = blogs.length > 0 ? (page === 1 ? blogs.slice(1) : blogs) : [];

  return (
    <main className="pt-24 pb-24 px-[var(--spacing-gutter)] max-w-[var(--spacing-max-width)] mx-auto">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-[var(--color-on-surface)]">Blogs</h1>
          <p className="text-[var(--color-on-surface-variant)] text-sm">Engineering articles, interview strategy, and platform updates.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-3 py-2 rounded-full border bg-[var(--color-surface)] border-[var(--color-outline-variant)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all text-[var(--color-on-surface)]"
          />
        </div>
      </div>

      {/* Category Filter */}
      <section className="mb-12">
        <div className="flex items-center gap-3 overflow-x-auto chip-scroll pb-2">
          <button 
            onClick={() => setCategory('')}
            className={`px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === '' 
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' 
                : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            All Posts
          </button>
          {categories.map((c) => (
            <button 
              key={c}
              onClick={() => setCategory(c)}
              className={`px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                category === c 
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' 
                  : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : blogs.length === 0 ? (
        <p className="text-center py-20 text-[var(--color-on-surface-variant)] text-lg">No posts found.</p>
      ) : (
        <>
          {/* Featured Blog Hero (only on page 1) */}
          {page === 1 && featuredPost && (
            <section className="mb-20">
              <Link to={`/blog/${featuredPost.slug}`} className="block">
                <div className="glass-card featured-card-border rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 group">
                  <div className="relative overflow-hidden h-64 lg:h-auto">
                    {featuredPost.coverImage ? (
                      <img 
                        src={optimizeImage(featuredPost.coverImage)} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-surface-container-high)]"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/80 to-transparent lg:hidden"></div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center bg-[var(--color-surface)]/40">
                    <div className="flex gap-2 mb-6">
                      <span className="bg-[var(--color-primary-container)]/20 text-[var(--color-primary-fixed)] px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-widest">
                        Featured
                      </span>
                      <span className="text-[var(--color-on-surface-variant)] text-[14px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span> {featuredPost.readTimeMinutes} min read
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-[var(--text-headline-lg)] font-bold mb-4 text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[var(--color-on-surface-variant)] text-[var(--text-body-lg)] mb-8 leading-relaxed line-clamp-3">
                      {featuredPost.excerpt || featuredPost.subtitle}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <img 
                          src={featuredPost.author?.avatar || '/default-avatar.png'} 
                          alt={featuredPost.author?.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)] object-cover" 
                        />
                        <div>
                          <p className="text-[var(--color-on-surface)] font-bold text-sm">{featuredPost.author?.name || 'Anonymous'}</p>
                          <p className="text-[var(--color-on-surface-variant)] text-[12px]">{featuredPost.author?.role || 'Author'}</p>
                        </div>
                      </div>
                      <button className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 group-hover:scale-105 transition-transform text-sm">
                        Read Article
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Blog Feed */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline-md text-[var(--text-headline-md)] font-bold text-[var(--color-on-surface)]">
                Latest Intelligence
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {standardPosts.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
            
            <div className="mt-20 flex justify-center">
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default BlogList;
