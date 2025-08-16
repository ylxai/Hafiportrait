'use client';

import { useEffect, useState, useRef } from 'react';
import { Camera, Heart, Star, Sparkles, Image, Users } from 'lucide-react';

// Optimized floating particles with reduced resource usage
export function FloatingParticles({ count = 3 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Reduce particle count for performance
  const optimizedCount = Math.min(count, 4);

  useEffect(() => {
    setIsClient(true);
    // Generate fewer particles with longer durations to reduce CPU usage
    const newParticles = Array.from({ length: optimizedCount }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 3 // Longer duration, less frequent updates
    }));
    setParticles(newParticles);

    // Auto-disable particles after 10 seconds to save resources
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [optimizedCount]);

  // Don't render if not visible or not client
  if (!isClient || !isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-10" // Reduced opacity
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            willChange: 'transform' // Optimize for animations
          }}
        >
          {i % 3 === 0 && <Camera className="w-3 h-3 text-wedding-gold" />}
          {i % 3 === 1 && <Heart className="w-2 h-2 text-pink-400" />}
          {i % 3 === 2 && <Sparkles className="w-2 h-2 text-blue-400" />}
        </div>
      ))}
    </div>
  );
}

// Optimized morphing loader with better cleanup
export function MorphingLoader() {
  const [shape, setShape] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        setShape(prev => (prev + 1) % 3);
      }
    }, 1200); // Slower transition to reduce CPU usage

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-10 h-10"> {/* Smaller size */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-wedding-gold to-pink-400 transition-all duration-500 ease-in-out ${
            shape === 0 ? 'rounded-full' : 
            shape === 1 ? 'rounded-lg rotate-45' : 
            'rounded-none rotate-12'
          }`}
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          {shape === 0 && <Camera className="w-3 h-3 text-wedding-gold" />}
          {shape === 1 && <Heart className="w-3 h-3 text-pink-400" />}
          {shape === 2 && <Star className="w-3 h-3 text-blue-400" />}
        </div>
      </div>
    </div>
  );
}

// Simplified photo grid loader
export function PhotoGridLoader({ count = 6 }: { count?: number }) {
  const [loadedItems, setLoadedItems] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Reduce count for performance
  const optimizedCount = Math.min(count, 8);

  useEffect(() => {
    mountedRef.current = true;
    
    timerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      setLoadedItems(prev => {
        if (prev.length >= optimizedCount) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 200); // Slower loading animation

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [optimizedCount]);

  return (
    <div className="photo-grid">
      {Array.from({ length: optimizedCount }).map((_, index) => (
        <div
          key={index}
          className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
            loadedItems.includes(index) 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple pulsing dots without heavy animations
export function PulsingDots({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2', 
    lg: 'w-3 h-3'
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-wedding-gold rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.3}s`,
            animationDuration: '1.8s'
          }}
        />
      ))}
    </div>
  );
}

// Lightweight shimmer skeleton
export function ShimmerSkeleton({ 
  className = '', 
  children 
}: { 
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
      {children}
    </div>
  );
}

// Simplified event cards loader
export function EventCardsLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <ShimmerSkeleton className="h-6 w-3/4" />
            <ShimmerSkeleton className="h-5 w-16 rounded-full" />
          </div>
          <ShimmerSkeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-5 w-20 rounded-full" />
            <ShimmerSkeleton className="h-5 w-16 rounded-full" />
          </div>
          <ShimmerSkeleton className="h-10 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

// Lightweight loading overlay
export function LoadingOverlay({ 
  isVisible, 
  progress = 0, 
  message = "Memuat..." 
}: { 
  isVisible: boolean;
  progress?: number;
  message?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <MorphingLoader />
        <div className="space-y-2">
          <p className="text-base font-medium text-gray-700">{message}</p>
          {progress > 0 && (
            <div className="w-48 bg-gray-200 rounded-full h-1">
              <div 
                className="bg-wedding-gold h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <PulsingDots size="sm" />
      </div>
    </div>
  );
}