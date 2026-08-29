import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 6, columns = 6 }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-4 border-b border-slate-100 pb-4 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded skeleton-shimmer" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-2 border-b border-slate-50 last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={`h-5 rounded skeleton-shimmer ${
                  c === 0 ? 'w-24' : c === 1 ? 'flex-1' : c === 2 ? 'w-20' : 'w-28'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
