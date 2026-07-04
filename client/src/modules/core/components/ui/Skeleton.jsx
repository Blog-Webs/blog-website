import React from 'react';

/**
 * Reusable Skeleton primitive
 * @param {Object} props
 * @param {'rect' | 'circle' | 'line'} [props.variant='rect'] - shape of skeleton
 * @param {string} [props.width] - width css value
 * @param {string} [props.height] - height css value
 * @param {string} [props.className] - additional classes
 */
export const Skeleton = ({ variant = 'rect', width, height, className = '' }) => {
  const baseClasses = 'relative overflow-hidden bg-white/5 dark:bg-black/20';
  
  let shapeClasses = 'rounded-md';
  if (variant === 'circle') shapeClasses = 'rounded-full';
  else if (variant === 'line') shapeClasses = 'rounded-sm';

  const styles = {
    width: width || (variant === 'line' ? '100%' : variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'line' ? '20px' : variant === 'circle' ? '40px' : '100%'),
  };

  return (
    <div 
      className={`${baseClasses} ${shapeClasses} ${className}`} 
      style={styles}
    >
      {/* Shimmer animation */}
      <div 
        className="absolute inset-0 -translate-x-full"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          animation: 'shimmer 1.5s infinite linear'
        }}
      />
    </div>
  );
};

/**
 * Pre-composed Skeleton for a list item (avatar + lines)
 */
export const ListSkeleton = ({ count = 3 }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-black/10">
          <Skeleton variant="circle" width="48px" height="48px" className="shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="line" width="60%" height="16px" />
            <Skeleton variant="line" width="90%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Pre-composed Skeleton for a Card grid
 */
export const CardGridSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 rounded-2xl border border-white/5 bg-black/10">
          <Skeleton variant="rect" height="44px" width="44px" className="mb-4 rounded-xl" />
          <Skeleton variant="line" width="80%" height="20px" className="mb-2" />
          <Skeleton variant="line" width="100%" height="14px" className="mb-1" />
          <Skeleton variant="line" width="90%" height="14px" className="mb-4" />
          <Skeleton variant="line" width="40%" height="14px" />
        </div>
      ))}
    </div>
  );
};

/**
 * Pre-composed Skeleton for article/blog post content
 */
export const ArticleSkeleton = () => {
  return (
    <div className="max-w-[850px] mx-auto w-full p-6 sm:p-10 md:p-12">
      <Skeleton variant="line" width="20%" height="24px" className="mb-4 rounded-full" />
      <Skeleton variant="line" width="85%" height="48px" className="mb-4" />
      <Skeleton variant="line" width="60%" height="20px" className="mb-6" />
      
      <div className="flex gap-4 items-center mb-10">
        <Skeleton variant="circle" width="40px" height="40px" />
        <div className="space-y-2">
          <Skeleton variant="line" width="120px" height="14px" />
          <Skeleton variant="line" width="80px" height="12px" />
        </div>
      </div>

      <Skeleton variant="rect" width="100%" height="300px" className="mb-10 rounded-2xl" />
      
      <div className="space-y-4">
        <Skeleton variant="line" width="100%" height="16px" />
        <Skeleton variant="line" width="100%" height="16px" />
        <Skeleton variant="line" width="90%" height="16px" />
        <Skeleton variant="line" width="95%" height="16px" />
        <Skeleton variant="line" width="80%" height="16px" />
      </div>
    </div>
  );
};
