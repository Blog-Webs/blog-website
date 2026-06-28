import { Link } from 'react-router-dom';
import { Clock, Eye, Heart } from 'lucide-react';

const BlogCard = ({ blog }) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group flex flex-col rounded-2xl border overflow-hidden card-hover"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {blog.coverImage && (
        <div className="h-44 overflow-hidden">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-xs font-mono-display mb-2" style={{ color: 'var(--accent)' }}>{blog.category}</span>
        <h3 className="font-semibold text-lg mb-1.5 leading-snug">{blog.title}</h3>
        {blog.subtitle && <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{blog.subtitle}</p>}
        <p className="text-sm mb-4 flex-1" style={{ color: 'var(--text-muted)' }}>{blog.excerpt}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <img src={blog.author?.avatar} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{blog.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Clock size={11} /> {blog.readTimeMinutes}m</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {blog.views}</span>
            <span className="flex items-center gap-1"><Heart size={11} /> {blog.likes?.length || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
