import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * Minimal page loading fallback component for Suspense boundaries
 * Used during code-split page loads to maintain smooth UX
 */
export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg p-8">
              <Skeleton className="h-6 w-3/4 mb-4 rounded" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
