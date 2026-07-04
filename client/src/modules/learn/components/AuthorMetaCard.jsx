import { Clock, Calendar } from 'lucide-react';

/**
 * AuthorMetaCard - Standardized metadata component for the top of the reading page.
 * Displays Author avatar/name, last updated date, and reading time.
 */
const AuthorMetaCard = ({ authorName, authorAvatar, lastUpdated, readTimeMinutes }) => {
  return (
    <div className="flex items-center gap-4 py-4 mb-6 border-b border-black/5 dark:border-white/5">
      {/* Author Avatar */}
      {authorAvatar ? (
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
          {authorName?.charAt(0) || 'A'}
        </div>
      )}
      
      <div className="flex flex-col">
        {/* Author Name */}
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {authorName || 'Platform Author'}
        </span>
        
        {/* Meta info (Date & Read Time) */}
        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {lastUpdated && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(lastUpdated).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
          {readTimeMinutes && (
            <>
              {lastUpdated && <span className="w-1 h-1 rounded-full bg-current opacity-30" />}
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {readTimeMinutes} min read
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorMetaCard;
