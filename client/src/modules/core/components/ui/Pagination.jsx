import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Simple numbered pagination with prev/next. Shows up to 5 page numbers
 * centered around the current page, with ellipses for the rest.
 */
const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  const windowSize = 1;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(pages, page + windowSize);

  if (start > 1) pageNumbers.push(1);
  if (start > 2) pageNumbers.push('…');
  for (let p = start; p <= end; p++) pageNumbers.push(p);
  if (end < pages - 1) pageNumbers.push('…');
  if (end < pages) pageNumbers.push(pages);

  const btnBase =
    'min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
    'hover:-translate-y-0.5';

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${btnBase} flex items-center justify-center border disabled:opacity-30 disabled:hover:translate-y-0`}
        style={{ borderColor: 'var(--border)' }}
      >
        <ChevronLeft size={15} />
      </button>

      {pageNumbers.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={btnBase}
            style={{
              backgroundColor: p === page ? 'var(--accent)' : 'transparent',
              color: p === page ? 'var(--bg)' : 'var(--text-muted)',
              border: p === page ? 'none' : '1px solid var(--border)',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className={`${btnBase} flex items-center justify-center border disabled:opacity-30 disabled:hover:translate-y-0`}
        style={{ borderColor: 'var(--border)' }}
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
};

export default Pagination;
