'use client';

import { useEffect, useState } from 'react';
import { Camera, Heart, Star, Sparkles, Image, Users } from 'lucide-react';

// Floating particles animation
export function FloatingParticles({ count = 6 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate consistent random positions on client side only
    const newParticles = Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    }));
    setParticles(newParticles);
  }, [count]);

  // Don't render particles on server to avoid hydration mismatch
  if (!isClient) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        >
          {i % 3 === 0 && <Camera className="w-4 h-4 text-wedding-gold" />}
          {i % 3 === 1 && <Heart className="w-3 h-3 text-pink-400" />}
          {i % 3 === 2 && <Sparkles className="w-3 h-3 text-blue-400" />}
        </div>
      ))}
    </div>
  );
}

// Pulsing dots loader
export function PulsingDots({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-wedding-gold rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
}

// Morphing shapes loader
export function MorphingLoader() {
  const [shape, setShape] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShape(prev => (prev + 1) % 3);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-wedding-gold to-pink-400 transition-all duration-700 ease-in-out ${
            shape === 0 ? 'rounded-full' : 
            shape === 1 ? 'rounded-lg rotate-45' : 
            'rounded-none rotate-12'
          }`}
        />
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          {shape === 0 && <Camera className="w-4 h-4 text-wedding-gold" />}
          {shape === 1 && <Heart className="w-4 h-4 text-pink-400" />}
          {shape === 2 && <Star className="w-4 h-4 text-blue-400" />}
        </div>
      </div>
    </div>
  );
}

// Skeleton with shimmer wave
export function ShimmerSkeleton({ 
  className = '', 
  children 
}: { 
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-wave" />
      {children}
    </div>
  );
}

// Photo grid loading with stagger
export function PhotoGridLoader({ count = 8 }: { count?: number }) {
  const [loadedItems, setLoadedItems] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadedItems(prev => {
        if (prev.length >= count) {
          clearInterval(timer);
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 120);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="photo-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-500 ${
            loadedItems.includes(index) 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          <ShimmerSkeleton className="w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
          </ShimmerSkeleton>
          
          {/* Floating particles */}
          <FloatingParticles count={3} />
        </div>
      ))}
    </div>
  );
}

// Event cards loading
export function EventCardsLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
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
        </div>
      ))}
    </div>
  );
}

// Hero section loading
export function HeroLoader() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-wedding-ivory to-white">
      <FloatingParticles count={12} />
      
      <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="space-y-4">
          <ShimmerSkeleton className="h-12 md:h-16 w-3/4 mx-auto" />
          <ShimmerSkeleton className="h-6 w-1/2 mx-auto" />
        </div>
        
        <div className="flex justify-center gap-4">
          <ShimmerSkeleton className="h-12 w-32 rounded" />
          <ShimmerSkeleton className="h-12 w-32 rounded" />
        </div>
        
        <div className="mt-12">
          <MorphingLoader />
        </div>
      </div>
    </div>
  );
}

// Loading overlay with progress
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
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <MorphingLoader />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">{message}</p>
          
          {progress > 0 && (
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-wedding-gold to-pink-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        
        <PulsingDots />
      </div>
    </div>
  );
}

// Success animation
export function SuccessAnimation({ 
  isVisible, 
  onComplete 
}: { 
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-green-50/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-green-700">Berhasil!</p>
      </div>
    </div>
  );
}