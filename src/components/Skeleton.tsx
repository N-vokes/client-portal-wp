import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`animate-skeleton bg-gradient-to-r from-sand via-cream to-sand bg-[length:200%_100%] ${className}`} />;
};

interface DashboardSkeletonProps {
  userRole: 'planner' | 'couple';
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = () => {
  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 md:py-24 space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
          <Skeleton className="h-4 w-1/3 rounded-lg" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg p-8">
              <Skeleton className="h-10 w-20 mx-auto mb-4 rounded" />
              <Skeleton className="h-4 w-24 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Milestones Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-8 w-48 mb-6 rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6">
                <Skeleton className="h-5 w-2/3 mb-3 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineSkeletonProps {
  userRole: 'planner' | 'couple';
}

export const TimelineSkeleton: React.FC<TimelineSkeletonProps> = () => {
  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg p-6 text-center">
              <Skeleton className="h-10 w-16 mx-auto mb-3 rounded" />
              <Skeleton className="h-4 w-24 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-12 flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* Timeline Events Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="relative">
              <div className="absolute left-0 w-16 h-16 rounded-full bg-sand" />
              <div className="ml-32 bg-white rounded-lg p-8 space-y-3">
                <Skeleton className="h-5 w-2/3 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ContractVaultSkeletonProps {
  userRole: 'planner' | 'couple';
}

export const ContractVaultSkeleton: React.FC<ContractVaultSkeletonProps> = () => {
  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg p-8 text-center">
              <Skeleton className="h-10 w-20 mx-auto mb-3 rounded" />
              <Skeleton className="h-4 w-28 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-12 flex flex-wrap gap-3">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* Contracts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg p-8 space-y-4">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-8 w-12 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MoodBoardSkeletonProps {
  userRole: 'planner' | 'couple';
}

export const MoodBoardSkeleton: React.FC<MoodBoardSkeletonProps> = () => {
  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg p-6 text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-3 rounded" />
              <Skeleton className="h-4 w-24 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-12 flex flex-wrap gap-3">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* Mood Board Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max mb-16">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx}>
              <Skeleton className="aspect-square rounded-lg mb-4" />
              <div className="bg-white rounded-lg p-4 space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
