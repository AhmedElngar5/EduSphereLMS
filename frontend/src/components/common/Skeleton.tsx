import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const CourseCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
    <Skeleton className="w-full h-44 rounded-none" />
    <div className="p-4 flex-1 flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="pt-2 flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-3.5 w-28" />
      </div>
      <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full space-y-3">
    <Skeleton className="h-10 w-full rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-full rounded-lg" />
    ))}
  </div>
);

