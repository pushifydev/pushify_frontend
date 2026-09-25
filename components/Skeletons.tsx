'use client';

interface CardGridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3;
  height?: number;
}

/** Skeleton placeholder for card grids (projects, servers, databases) */
export function CardGridSkeleton({ count = 3, columns = 3, height = 160 }: CardGridSkeletonProps) {
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 flex flex-col gap-3"
          style={{ height, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}
          aria-hidden
        >
          <div className="flex items-center gap-3">
            <div className="dash-skeleton w-8 h-8 rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="dash-skeleton h-3.5 w-1/2 rounded" />
              <div className="dash-skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
          <div className="dash-skeleton h-3 w-2/3 rounded mt-auto" />
        </div>
      ))}
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
  height?: number;
}

/** Skeleton placeholder for list/table rows */
export function ListSkeleton({ rows = 5, height = 56 }: ListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4"
          style={{ height, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}
          aria-hidden
        >
          <div className="dash-skeleton w-1.5 h-1.5 rounded-full shrink-0" />
          <div className="dash-skeleton h-3.5 w-1/3 rounded" />
          <div className="dash-skeleton h-3 w-16 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a detail page header area */
export function DetailHeaderSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="dash-skeleton h-8 w-48 max-w-[60%] rounded-md" />
      <div className="dash-skeleton h-4 w-80 max-w-[90%] rounded-md" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dash-skeleton h-24 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
