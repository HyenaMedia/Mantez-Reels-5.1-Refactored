import React from 'react';

/**
 * Skeleton Loader Component
 * Provides beautiful loading placeholders
 */

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/10 ${className}`}
      {...props}
    />
  );
};

// Card Skeleton
export const CardSkeleton = () => (
  <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-12 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// List Skeleton
export const ListSkeleton = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/10">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Stats Skeleton
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
);

// Image Skeleton
export const ImageSkeleton = ({ className = '' }) => (
  <Skeleton className={`aspect-video ${className}`} />
);

// Text Skeleton
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

export default Skeleton;
