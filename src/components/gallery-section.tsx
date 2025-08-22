'use client'; // Tetap gunakan ini karena ada hooks seperti useQuery

import { useState, useMemo, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Photo } from "@/lib/database";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

import { BasicLightbox } from "./ui/basic-lightbox";
import { SwiperGallery } from "./ui/swiper-gallery";
import { SwiperLightbox } from "./ui/swiper-lightbox";
import { OptimizedImage } from "./ui/optimized-image";
import { ProgressiveGallerySkeleton } from "./ui/gallery-skeleton";
import { PhotoGridLoader, MorphingLoader, FloatingParticles } from "./ui/engaging-loading-optimized"; 

// --- BAGIAN INI UNTUK FRAMER-MOTION YANG DINONAKTIFKAN (SEBELUMNYA AKAN DIKEMBALIKAN JIKA ANDA INGIN ANIMASI) ---
// import { motion, Easing } from "framer-motion"; 
// const easeOutCubicBezier: Easing = [0, 0, 0.58, 1];
// const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2, }, }, };
// const itemVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutCubicBezier, }, }, };
// ----------------------------------------------------------------------------------------------------

export default function GallerySection() {
  // State untuk lightbox dengan enhanced lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Optimized data fetching dengan caching dan stale-while-revalidate
  const { data: photos, isLoading, isError } = useQuery<Photo[]>({
    queryKey: ['homepagePhotos'],
    queryFn: async () => {
      const response = await fetch('/api/photos/homepage');
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Use cached data on mount
    retry: 2, // Limit retry attempts
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log("GallerySection: Status Render", {
    isLoading,
    isError,
    photosLength: photos?.length,
    photosData: photos
  });

  // Memoized callbacks untuk mencegah re-render
  const openLightbox = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  // Memoized photo processing untuk optimasi performa
  const processedPhotos = useMemo(() => {
    if (!photos) return null;
    
    // Limit photos untuk performa (max 20 untuk homepage)
    const limitedPhotos = photos.slice(0, 20);
    
    // Pre-sort by priority (photos with optimized_images first)
    return limitedPhotos.sort((a, b) => {
      const aHasOptimized = a.optimized_images && typeof a.optimized_images === 'object';
      const bHasOptimized = b.optimized_images && typeof b.optimized_images === 'object';
      
      if (aHasOptimized && !bHasOptimized) return -1;
      if (!aHasOptimized && bHasOptimized) return 1;
      return 0;
    });
  }, [photos]);

  // Dummy handlers untuk PhotoLightbox (masih dipertahankan jika Anda ingin mengintegrasikan lightbox nanti)
  const handlePhotoLike = (photoId: string) => {
    console.log(`Like action for photo: ${photoId} (Not implemented on homepage)`);
  };

  return (
    <section id="gallery" className="py-20 bg-wedding-ivory relative overflow-hidden">
      <FloatingParticles count={2} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Gallery
          </h2>
        </div>
        
        {isLoading && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <MorphingLoader />
            </div>
            <PhotoGridLoader count={6} />
          </div>
        )}

        {isError && (
          <div className="text-center py-8 text-red-500">
            <p>Gagal memuat foto galeri. Silakan coba lagi nanti.</p>
          </div>
        )}

        {!isLoading && !isError && (!photos || photos.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Belum ada foto di galeri homepage.</p>
          </div>
        )}

        {!isLoading && !isError && processedPhotos && processedPhotos.length > 0 && (
          <>
            {/* Swiper Gallery - Auto-playing carousel */}
            <SwiperGallery 
              photos={processedPhotos.slice(0, 8)} // Limit carousel photos
              onPhotoClick={openLightbox}
            />

            {/* Photo Grid - Traditional grid layout with optimized rendering */}
            <div className="photo-grid">
              {processedPhotos.map((photo, index) => ( 
                <PhotoGridItem
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Swiper Lightbox untuk Homepage */}
      {isLightboxOpen && processedPhotos && (
        <SwiperLightbox
          photos={processedPhotos}
          currentIndex={currentPhotoIndex}
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}

// Memoized PhotoGridItem component dengan Intersection Observer
const PhotoGridItem = memo(({ photo, index, onClick }: {
  photo: Photo;
  index: number;
  onClick: () => void;
}) => {
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px', // Load images 100px before they come into view
    triggerOnce: true,
  });

  // Only render image content when it has intersected (or for first few items)
  const shouldLoadImage = index < 3 || hasIntersected;

  return (
    <div 
      ref={elementRef}
      className="relative group overflow-hidden rounded-lg shadow-md cursor-pointer animate-fade-in-up hover:animate-pulse-glow"
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 50, 1000)}ms` }}
    >
      {shouldLoadImage ? (
        photo.optimized_images && typeof photo.optimized_images === 'object' ? (
          <OptimizedImage
            images={photo.optimized_images}
            alt={photo.original_name || 'Gallery Photo'}
            usage="gallery"
            className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
            loading={index < 3 ? 'eager' : 'lazy'}
            priority={index < 2}
          />
        ) : (
          <img
            src={photo.url || photo.thumbnail_url || '/placeholder-image.svg'}
            alt={photo.original_name || 'Gallery Photo'}
            className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        )
      ) : (
        // Placeholder while waiting for intersection
        <div className="w-full h-full aspect-square bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

PhotoGridItem.displayName = 'PhotoGridItem';
