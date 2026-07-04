import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, ChevronRight } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import Pagination from '../../core/components/ui/Pagination';
import { blogApi } from '../api/blog';
import { seriesApi } from '../api/series';
import { CardGridSkeleton } from '../../core/components/ui/Skeleton';

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

  // Reset to page 1 whenever the filters change, so a stale page number
  // from a previous search doesn't land the reader on an empty page.
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 glow-title">Blog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Engineering articles, interview strategy, and platform updates.</p>
      </div>

      {series.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-mono-display uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
            Series
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {series.map((s) => (
              <Link
                key={s._id}
                to={`/series/${s.slug}`}
                className="group flex items-center gap-3 shrink-0 px-4 py-3 rounded-xl border card-hover"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  <Layers size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.postCount} posts</p>
                </div>
                <ChevronRight size={15} className="ml-1 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none input-focus"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-sm outline-none input-focus"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : blogs.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No posts found.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div>
          <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default BlogList;
