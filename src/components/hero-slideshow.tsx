'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Phone, Eye, Sparkles } from 'lucide-react';
import { OptimizedImage } from './ui/optimized-image';
import { FloatingParticles, MorphingLoader } from './ui/engaging-loading-optimized';

interface SlideshowPhoto {
  id: string;
  url: string;
  original_name: string;
  optimized_images?: any;
}

interface HeroSlideshowProps {
  autoplay?: boolean;
  interval?: number;
  showControls?: boolean;
  className?: string;
}

// Advanced smooth scrolling function with easing
const smoothScrollToSection = (sectionId: string, offset: number = 80) => {
  const element = document.getElementById(sectionId.replace('#', ''));
  if (!element) return;

  const targetPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
  let start: number | null = null;

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  const animation = (currentTime: number) => {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    
    window.scrollTo(0, startPosition + distance * easedProgress);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

export default function HeroSlideshow({ 
  autoplay = true, 
  interval = 5000,
  showControls = true,
  className = ''
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set([0]));
  
  // Dynamic text state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Dynamic main title state
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const mainTitles = [
    "Capture Momen Indah",
    "Save Beautiful Memories", 
    "Your Precious Moments",
    "Moments & Memories"
  ];
  
  const dynamicWords = [
    "Pernikahan Impian ✨",
    "Momen Keluarga 👨‍👩‍👧‍👦", 
    "Acara Corporate 🏢",
    "Ulang Tahun Spesial 🎂",
    "Wisuda Bersejarah 🎓"
  ];

  // Fetch slideshow photos with mobile optimization
  const { data: photos, isLoading, error } = useQuery<SlideshowPhoto[]>({
    queryKey: ['slideshowPhotos'],
    queryFn: async () => {
      const response = await fetch('/api/slideshow');
      if (!response.ok) {
        throw new Error('Failed to fetch slideshow photos');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Limit to 3 photos for mobile performance
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      return isMobile ? data.slice(0, 3) : data.slice(0, 5);
    }
  });

  // Auto-play functionality with mobile optimization
  useEffect(() => {
    if (isPlaying && photos && photos.length > 1) {
      // Slower interval for mobile to save battery
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const mobileInterval = isMobile ? interval + 2000 : interval;
      
      intervalRef.current = setInterval(() => {
        goToNext();
      }, mobileInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, photos, interval]);

  // Dynamic main title rotation (every 10 seconds)
  useEffect(() => {
    const titleInterval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % mainTitles.length);
    }, 10000); // Change every 10 seconds
    
    return () => clearInterval(titleInterval);
  }, [mainTitles.length]);

  // Simple dynamic text rotation (original version)
  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(textInterval);
  }, [dynamicWords.length]);

  // Preload next image for smooth transitions
  useEffect(() => {
    if (photos && photos.length > 1) {
      const nextIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
      if (!preloadedImages.has(nextIndex)) {
        const nextPhoto = photos[nextIndex];
        const img = new Image();
        img.src = nextPhoto.optimized_images?.small?.url || nextPhoto.url;
        img.onload = () => {
          setPreloadedImages(prev => new Set(Array.from(prev).concat(nextIndex)));
        };
      }
    }
  }, [currentIndex, photos, preloadedImages]);

  // Navigation functions
  const goToPrevious = () => {
    if (isTransitioning || !photos) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (isTransitioning || !photos) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || !photos) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos && photos.length > 1) {
      goToNext();
    }
    if (isRightSwipe && photos && photos.length > 1) {
      goToPrevious();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative bg-gradient-to-br from-wedding-ivory to-white ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <MorphingLoader />
        </div>
        <FloatingParticles count={2} />
      </div>
    );
  }

  // Error or no photos - show fallback
  if (error || !photos || photos.length === 0) {
    return (
      <div className={`relative bg-gradient-to-br from-wedding-ivory to-white flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            HafiPortrait
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Professional Photography Services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => smoothScrollToSection('gallery', 100)}
              size="lg" 
              className="bg-wedding-gold hover:bg-wedding-gold/90 text-black transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Lihat Portfolio
            </Button>
            <Button 
              onClick={() => smoothScrollToSection('contact', 100)}
              size="lg" 
              variant="outline"
              className="transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Hubungi Kami
            </Button>
          </div>
        </div>
        <FloatingParticles count={3} />
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image - Mobile Optimized */}
      <div className="absolute inset-0">
        {currentPhoto.optimized_images ? (
          <OptimizedImage
            images={currentPhoto.optimized_images}
            alt={currentPhoto.original_name}
            usage="mobile" // Use mobile-optimized version
            className={`w-full h-full object-cover transition-all duration-500 ${
              isTransitioning ? 'opacity-70 scale-105' : 'opacity-100 scale-100'
            }`}
            priority={currentIndex === 0} // Only prioritize first image
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
          />
        ) : (
          <img
            src={currentPhoto.url}
            alt={currentPhoto.original_name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isTransitioning ? 'opacity-70 scale-105' : 'opacity-100 scale-100'
            }`}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content - Mobile Optimized */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white space-y-4 md:space-y-6 max-w-4xl mx-auto px-4">
          <h1 
            className="text-3xl md:text-6xl lg:text-7xl font-bold mb-2 md:mb-4 animate-fade-in-up"
            style={{
              background: 'linear-gradient(45deg, #d4af37, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))'
            }}
          >
            <span className="transition-all duration-1000 ease-in-out">
              {mainTitles[currentTitleIndex]}
            </span>
          </h1>
          <p className="text-lg md:text-2xl lg:text-3xl mb-4 md:mb-8 animate-fade-in-up transition-all duration-500" style={{ animationDelay: '200ms' }}>
            {dynamicWords[currentWordIndex]}
          </p>
          <div className="flex flex-row gap-2 justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {/* Primary CTA - Portfolio */}
            <Button 
              onClick={() => smoothScrollToSection('gallery', 100)}
              size="sm" 
              className="group relative overflow-hidden bg-gradient-to-r from-wedding-gold via-yellow-400 to-amber-300 hover:from-amber-300 hover:via-yellow-400 hover:to-wedding-gold text-black font-bold h-8 md:h-9 text-xs px-3 md:px-4 rounded-xl shadow-2xl hover:shadow-wedding-gold/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-1">
                <Eye className="w-3 h-3 group-hover:scale-125 transition-transform duration-300" />
                Portfolio
              </span>
              {/* Animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Button>

            {/* Secondary CTA - Kontak */}
            <Button 
              onClick={() => smoothScrollToSection('contact', 100)}
              size="sm" 
              variant="ghost" 
              className="group relative overflow-hidden border border-white/30 text-white hover:text-wedding-gold h-8 md:h-9 text-xs px-3 md:px-4 rounded-xl font-bold backdrop-blur-md bg-black/20 hover:bg-white/10 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-white/20 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-1">
                <Phone className="w-3 h-3 group-hover:rotate-12 group-hover:scale-125 transition-all duration-300" />
                Kontak
              </span>
              {/* Border glow */}
              <div className="absolute inset-0 rounded-xl border border-white/50 scale-100 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && photos.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-20 hidden md:flex items-center justify-center"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-20 hidden md:flex items-center justify-center"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-wedding-gold scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Swipe Indicator */}
          <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium bg-black/30 px-3 py-1 rounded-full md:hidden">
            ← Geser untuk navigasi →
          </div>
        </>
      )}

    </div>
  );
}