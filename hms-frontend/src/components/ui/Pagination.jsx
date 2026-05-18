import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
      <p className="text-xs text-text-light">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-xl border border-gray-200 hover:bg-navy/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-text-secondary" />
        </button>
        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
          const start = Math.max(0, Math.min(page - 2, totalPages - 5));
          const p = start + i;
          if (p >= totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                p === page
                  ? 'bg-gradient-to-r from-teal to-teal-dark text-white shadow-md'
                  : 'text-text-secondary hover:bg-navy/5'
              }`}
            >
              {p + 1}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-xl border border-gray-200 hover:bg-navy/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
