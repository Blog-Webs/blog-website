import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Layers } from 'lucide-react';
import { blogApi } from '../../api/blog';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 15;

const AdminBlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p = page) => {
    setLoading(true);
    blogApi
      .getAllAdmin({ page: p, limit: PAGE_SIZE })
      .then(({ data }) => {
        setBlogs(data.blogs);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(page), [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    await blogApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Blog Posts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Write and manage articles.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin-portal/series"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border btn-press"
            style={{ borderColor: 'var(--border)' }}
          >
            <Layers size={16} /> Manage series
          </Link>
          <Link
            to="/admin-portal/blogs/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            <Plus size={16} /> New post
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : blogs.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border card-hover"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{blog.title}</p>
                    <span
                      className="text-[10px] uppercase font-mono-display px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: blog.status === 'published' ? 'var(--accent-soft)' : 'var(--amber-soft)',
                        color: blog.status === 'published' ? 'var(--accent)' : 'var(--amber)',
                      }}
                    >
                      {blog.status}
                    </span>
                    {blog.series && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-mono-display px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}
                      >
                        <Layers size={10} /> {blog.series.title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{blog.category} · {blog.views} views</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {blog.status === 'published' && (
                    <Link to={`/blog/${blog.slug}`} className="p-2 rounded-lg border btn-press" style={{ borderColor: 'var(--border)' }}>
                      <Eye size={15} />
                    </Link>
                  )}
                  <Link to={`/admin-portal/blogs/${blog._id}`} className="p-2 rounded-lg border btn-press" style={{ borderColor: 'var(--border)' }}>
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => handleDelete(blog._id)} className="p-2 rounded-lg border btn-press" style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminBlogList;
