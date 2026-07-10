import { Link } from 'react-router-dom';
import { optimizeImage } from '../../../utils/image';

const BlogCard = ({ blog }) => {
  return (
    <article className="glass-card rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer group">
      <Link to={`/blog/${blog.slug}`} className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
          {blog.coverImage ? (
            <img 
              src={optimizeImage(blog.coverImage)} 
              alt={blog.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-surface-container-high)]"></div>
          )}
          <div className="absolute top-4 left-4 bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-[11px] font-bold px-3 py-1 rounded shadow-lg">
            {blog.category || 'Tech'}
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <h4 className="font-headline-md text-[var(--text-headline-md)] font-bold mb-3 text-[var(--color-on-surface)] leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
            {blog.title}
          </h4>
          <p className="text-[var(--color-on-surface-variant)] text-sm line-clamp-3 mb-6">
            {blog.excerpt || blog.subtitle}
          </p>
          
          <div className="mt-auto flex items-center gap-3">
            <img 
              src={blog.author?.avatar || '/default-avatar.png'} 
              alt={blog.author?.name} 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-[var(--color-outline-variant)] object-cover" 
            />
            <div className="text-[12px]">
              <p className="text-[var(--color-on-surface)] font-bold">{blog.author?.name || 'Anonymous'}</p>
              <p className="text-[var(--color-on-surface-variant)]">
                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="mx-1">•</span>
                {blog.readTimeMinutes} min read
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogCard;
