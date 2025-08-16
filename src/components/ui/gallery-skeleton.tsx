'use client';

import { useEffect, useState } from 'react';

interface GallerySkeletonProps {
  count?: number;
  className?: string;
}

export function GallerySkeleton({ count = 8, className = '' }: GallerySkeletonProps) {
  const [loadedItems, setLoadedItems] = useState<number[]>([]);

  // Staggered loading animation
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadedItems(prev => {
        if (prev.length >= count) {
          clearInterval(timer);
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 150); // Stagger by 150ms

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className={`photo-grid ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-500 ${
            loadedItems.includes(index) 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
          </div>
          
          {/* Placeholder content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-400/30 rounded-full animate-pulse"></div>
          </div>
          
          {/* Bottom info placeholder */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/20 to-transparent">
            <div className="h-2 bg-white/30 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced skeleton with progressive reveal
export function ProgressiveGallerySkeleton({ count = 8 }: { count?: number }) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedCount(prev => {
        if (prev >= count) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="photo-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-700 ease-out ${
            index < revealedCount 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-4'
          }`}
          style={{ 
            transitionDelay: `${index * 50}ms`,
            background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 animate-pulse"></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>
      ))}
    </div>
  );
}