import React from 'react';

export const StatCardSkeleton = () => (
  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
    <div className="w-9 h-9 rounded-lg mb-3 animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
    <div className="h-8 w-16 rounded animate-pulse mb-2" style={{ backgroundColor: 'var(--border)' }} />
    <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
  </div>
);

export const ContentTreeSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="h-5 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
          <div className="h-7 w-7 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
    <div className="h-12 border-b animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }} />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-14 border-b animate-pulse flex items-center px-4 gap-4" style={{ borderColor: 'var(--border)' }}>
        <div className="h-4 w-1/4 rounded" style={{ backgroundColor: 'var(--border)' }} />
        <div className="h-4 w-1/4 rounded" style={{ backgroundColor: 'var(--border)' }} />
        <div className="h-4 w-1/4 rounded" style={{ backgroundColor: 'var(--border)' }} />
      </div>
    ))}
  </div>
);
