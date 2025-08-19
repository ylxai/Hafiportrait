'use client'; // Tetap gunakan ini karena ada hooks seperti useQuery

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Photo } from "@/lib/database";
import LoadingSpinner from "@/components/ui/loading-spinner";

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

  // Mengembalikan data fetching dari API untuk galeri homepage
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
  });

  console.log("GallerySection: Status Render", {
    isLoading,
    isError,
    photosLength: photos?.length,
    photosData: photos
  });

  // Fungsi untuk membuka lightbox
  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

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

        {!isLoading && !isError && photos && photos.length > 0 && (
          <>
            {/* Swiper Gallery - Auto-playing carousel */}
            <SwiperGallery 
              photos={photos} 
              onPhotoClick={openLightbox}
            />

            {/* Photo Grid - Traditional grid layout */}
            <div className="photo-grid">
              {photos.map((photo, index) => ( 
                <div 
                  key={photo.id} 
                  className="relative group overflow-hidden rounded-lg shadow-md cursor-pointer animate-fade-in-up hover:animate-pulse-glow"
                  onClick={() => openLightbox(index)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {photo.optimized_images ? (
                    <OptimizedImage
                      images={photo.optimized_images}
                      alt={photo.original_name || 'Gallery Photo'}
                      usage="gallery"
                      className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                      loading={index < 6 ? 'eager' : 'lazy'}
                      priority={index < 3}
                    />
                  ) : (
                    <img
                      src={photo.url}
                      alt={photo.original_name || 'Gallery Photo'}
                      className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                      loading={index < 6 ? 'eager' : 'lazy'}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Swiper Lightbox untuk Homepage */}
      {isLightboxOpen && photos && (
        <SwiperLightbox
          photos={photos}
          currentIndex={currentPhotoIndex}
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}
