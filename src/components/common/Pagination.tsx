import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  // Keep all page numbers rendered so no numbers ever disappear upon selection
  const pages: (number | '...')[] = [];
  if (totalPages <= 10) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    const startRange = Math.max(2, safePage - 2);
    const endRange = Math.min(totalPages - 1, safePage + 2);
    if (startRange > 2) pages.push('...');
    for (let i = startRange; i <= endRange; i++) {
      pages.push(i);
    }
    if (endRange < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <p className="pagination-info">
        Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> results
      </p>
      <div className="pagination-controls">
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous Page"
          title="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="page-btn"
              style={{ cursor: 'default', color: 'var(--text-muted)' }}
            >
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              className={`page-btn ${p === safePage ? 'active' : ''}`}
              onClick={() => onPageChange(p as number)}
              style={
                p === safePage
                  ? {
                      backgroundColor: 'var(--primary, #2563eb)',
                      color: '#ffffff',
                      borderColor: 'var(--primary, #2563eb)',
                      fontWeight: 700,
                    }
                  : undefined
              }
              aria-current={p === safePage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next Page"
          title="Next Page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

