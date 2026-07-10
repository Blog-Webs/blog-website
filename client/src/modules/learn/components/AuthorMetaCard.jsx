const AuthorMetaCard = ({ authorName, authorAvatar, lastUpdated, readTimeMinutes }) => {
  return (
    <div className="flex items-center gap-3 py-2 mb-8">
      {/* Author Avatar */}
      {authorAvatar ? (
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-[#131315] flex items-center justify-center text-gray-400 border border-white/10">
          {authorName?.charAt(0) || 'A'}
        </div>
      )}
      
      <div className="flex flex-col justify-center">
        {/* Author Name */}
        <span className="text-sm font-semibold text-white">
          By {authorName || 'Platform Author'}
        </span>
        
        {/* Meta info (Date & Read Time) */}
        <div className="text-xs text-gray-400 mt-0.5">
          {lastUpdated && (
            <span>
              Updated {new Date(lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
          {readTimeMinutes && (
            <>
              {lastUpdated && <span className="mx-1.5">•</span>}
              <span>{readTimeMinutes} min read</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorMetaCard;
