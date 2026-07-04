const ReplySkeleton = () => {
  return (
    <div className="py-6 border-b last:border-b-0 animate-pulse" style={{ borderColor: 'var(--border)' }}>
      {/* Header Inline */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-white/10" />
          <div className="h-5 w-32 bg-black/10 dark:bg-white/10 rounded-md" />
        </div>
        <div className="h-4 w-12 bg-black/10 dark:bg-white/10 rounded-md" />
      </div>

      {/* Content Area */}
      <div className="pl-13 space-y-3 mb-6">
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-full" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-5/6" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-4/6" />
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 pl-13">
        <div className="h-4 w-10 bg-black/10 dark:bg-white/10 rounded-md" />
        <div className="h-4 w-6 bg-black/10 dark:bg-white/10 rounded-md" />
      </div>
    </div>
  );
};

export default ReplySkeleton;
