'use client';

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkAwareSkeleton } from "@/hooks/use-network-aware-skeleton";
import { memo, useMemo } from "react";

interface OptimizedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  variant?: 'simple' | 'medium' | 'complex';
  adaptive?: boolean;
  estimatedLoadTime?: number;
}

// Memoized skeleton component untuk performance
const OptimizedSkeleton = memo(function OptimizedSkeleton({
  className,
  shimmer,
  variant,
  adaptive = true,
  estimatedLoadTime = 1000,
  ...props
}: OptimizedSkeletonProps) {
  const isMobile = useIsMobile();
  const { 
    skeletonConfig, 
    getSkeletonClassName, 
    shouldShowSkeleton,
    isSlowNetwork,
    isSaveDataMode 
  } = useNetworkAwareSkeleton();

  // Determine if skeleton should be shown based on network conditions
  const showSkeleton = useMemo(() => {
    if (!adaptive) return true;
    return shouldShowSkeleton(estimatedLoadTime);
  }, [adaptive, estimatedLoadTime, shouldShowSkeleton]);

  // Calculate optimal skeleton classes based on network conditions
  const skeletonClasses = useMemo(() => {
    const baseClasses = ['rounded-md', 'bg-gray-200'];
    
    // Network-aware optimizations
    if (adaptive) {
      if (isSlowNetwork || isSaveDataMode) {
        baseClasses.push('skeleton-slow-network');
        if (isMobile) {
          baseClasses.push('skeleton-mobile-optimized');
        }
      } else {
        baseClasses.push('skeleton-fast-network');
        if (skeletonConfig.shimmerEnabled) {
          baseClasses.push('shimmer-animation');
        } else {
          baseClasses.push('animate-pulse');
        }
      }
      
      // Add complexity level
      baseClasses.push(`skeleton-${skeletonConfig.complexityLevel}`);
      
      // Add save data optimizations
      if (isSaveDataMode) {
        baseClasses.push('skeleton-save-data');
      }
      
      // Add GPU acceleration for smooth animations
      if (!isSlowNetwork && !isSaveDataMode) {
        baseClasses.push('skeleton-gpu-accelerated');
      }
    } else {
      // Manual configuration
      const effectiveVariant = variant || 'medium';
      baseClasses.push(`skeleton-${effectiveVariant}`);
      
      if (shimmer !== false && !isSaveDataMode) {
        baseClasses.push('shimmer-animation');
      } else {
        baseClasses.push('animate-pulse');
      }
    }
    
    return cn(baseClasses, className);
  }, [
    adaptive,
    isSlowNetwork,
    isSaveDataMode,
    isMobile,
    skeletonConfig,
    variant,
    shimmer,
    className
  ]);

  // Don't render skeleton if network is too fast and load time is minimal
  if (!showSkeleton) {
    return null;
  }

  return (
    <div
      className={skeletonClasses}
      style={{
        animationDuration: adaptive ? `${skeletonConfig.animationDuration}ms` : undefined
      }}
      {...props}
    />
  );
});

// Optimized photo grid skeleton
interface OptimizedPhotoGridSkeletonProps {
  count?: number;
  adaptive?: boolean;
}

const OptimizedPhotoGridSkeleton = memo(function OptimizedPhotoGridSkeleton({ 
  count, 
  adaptive = true 
}: OptimizedPhotoGridSkeletonProps) {
  const isMobile = useIsMobile();
  const { skeletonConfig, isSlowNetwork } = useNetworkAwareSkeleton();
  
  // Adjust count based on network conditions
  const effectiveCount = useMemo(() => {
    if (!adaptive) return count || 8;
    
    if (isSlowNetwork) {
      return isMobile ? 4 : 6; // Fewer items for slow networks
    }
    
    return count || skeletonConfig.itemCount;
  }, [adaptive, count, isSlowNetwork, isMobile, skeletonConfig.itemCount]);

  return (
    <div className={`photo-grid ${
      isMobile 
        ? 'grid-cols-2 gap-3' 
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
    }`}>
      {Array.from({ length: effectiveCount }).map((_, index) => (
        <div key={index} className="space-y-2">
          <OptimizedSkeleton 
            className={`w-full ${isMobile ? 'h-40' : 'h-48'} rounded-xl`}
            adaptive={adaptive}
            estimatedLoadTime={2000}
          />
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <OptimizedSkeleton 
                className="h-4 w-4 rounded-full" 
                adaptive={adaptive}
                estimatedLoadTime={500}
              />
              <OptimizedSkeleton 
                className="h-3 w-6" 
                adaptive={adaptive}
                estimatedLoadTime={500}
              />
            </div>
            {!isMobile && (
              <OptimizedSkeleton 
                className="h-3 w-16" 
                adaptive={adaptive}
                estimatedLoadTime={500}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

// Optimized message card skeleton
const OptimizedMessageCardSkeleton = memo(function OptimizedMessageCardSkeleton({
  adaptive = true
}: {
  adaptive?: boolean;
}) {
  const { isSlowNetwork } = useNetworkAwareSkeleton();
  
  return (
    <div className="p-4 border rounded-lg bg-white space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <OptimizedSkeleton 
            className="h-4 w-24" 
            adaptive={adaptive}
            estimatedLoadTime={800}
          />
          <OptimizedSkeleton 
            className="h-4 w-full" 
            adaptive={adaptive}
            estimatedLoadTime={1000}
          />
          <OptimizedSkeleton 
            className="h-4 w-3/4" 
            adaptive={adaptive}
            estimatedLoadTime={1000}
          />
          <OptimizedSkeleton 
            className="h-3 w-32" 
            adaptive={adaptive}
            estimatedLoadTime={500}
          />
        </div>
        <OptimizedSkeleton 
          className="h-8 w-12 rounded-md" 
          adaptive={adaptive}
          estimatedLoadTime={500}
        />
      </div>
      
      {/* Reactions skeleton - simplified for slow networks */}
      {!isSlowNetwork && (
        <div className="border-t pt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <OptimizedSkeleton 
                key={i} 
                className="h-6 w-12 rounded-full" 
                adaptive={adaptive}
                estimatedLoadTime={300}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <OptimizedSkeleton 
                key={i} 
                className="h-8 w-8 rounded-md" 
                adaptive={adaptive}
                estimatedLoadTime={200}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Optimized event page skeleton
const OptimizedEventPageSkeleton = memo(function OptimizedEventPageSkeleton() {
  const isMobile = useIsMobile();
  const { isSlowNetwork } = useNetworkAwareSkeleton();
  
  return (
    <div className="min-h-screen bg-wedding-ivory">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="mobile-container">
          <div className={`flex items-center justify-between ${isMobile ? 'py-3' : 'py-4'}`}>
            <div className="flex-1 min-w-0 space-y-2">
              <OptimizedSkeleton 
                className={`${isMobile ? 'h-6 w-48' : 'h-8 w-64'}`}
                adaptive={true}
                estimatedLoadTime={1500}
              />
              <OptimizedSkeleton 
                className={`${isMobile ? 'h-3 w-32' : 'h-4 w-40'}`}
                adaptive={true}
                estimatedLoadTime={1000}
              />
            </div>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <OptimizedSkeleton 
                className={`${isMobile ? 'h-8 w-8' : 'h-10 w-20'} rounded-md`}
                adaptive={true}
                estimatedLoadTime={500}
              />
              <OptimizedSkeleton 
                className={`${isMobile ? 'h-8 w-8' : 'h-10 w-16'} rounded-md`}
                adaptive={true}
                estimatedLoadTime={500}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-container mobile-spacing">
        {/* Tabs skeleton */}
        <div className="w-full space-y-6">
          <div className={`${
            isMobile 
              ? 'grid grid-cols-4 h-auto p-1 gap-1' 
              : 'grid grid-cols-4 gap-2'
          } bg-gray-100 rounded-lg p-1`}>
            {['Official', 'Tamu', 'Bridesmaid', 'Guestbook'].map((tab) => (
              <OptimizedSkeleton 
                key={tab}
                className={`${isMobile ? 'h-10' : 'h-12'} rounded-md`}
                adaptive={true}
                estimatedLoadTime={300}
              />
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
            {/* Header skeleton */}
            <div className="text-center space-y-2">
              <OptimizedSkeleton 
                className={`mx-auto ${isMobile ? 'h-6 w-32' : 'h-8 w-40'}`}
                adaptive={true}
                estimatedLoadTime={800}
              />
              <OptimizedSkeleton 
                className={`mx-auto ${isMobile ? 'h-4 w-48' : 'h-5 w-56'}`}
                adaptive={true}
                estimatedLoadTime={600}
              />
            </div>

            {/* Photo grid skeleton */}
            <OptimizedPhotoGridSkeleton adaptive={true} />
          </div>
        </div>
      </div>
    </div>
  );
});

export {
  OptimizedSkeleton,
  OptimizedPhotoGridSkeleton,
  OptimizedMessageCardSkeleton,
  OptimizedEventPageSkeleton
};