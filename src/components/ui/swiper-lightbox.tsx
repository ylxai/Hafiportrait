'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Thumbs, FreeMode, Keyboard, EffectFade, Mousewheel } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { OptimizedImage } from './optimized-image';
import { DownloadManager } from '@/utils/download-helper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';

// Import custom enhanced styles
import '@/styles/enhanced-swiper-lightbox.css';

interface Photo {
  id: string;
  url: string;
  original_name: string;
  optimized_images?: any;
  uploader_name?: string;
}

interface SwiperLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SwiperLightbox({ photos, currentIndex, isOpen, onClose }: SwiperLightboxProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [mainSwiper, setMainSwiper] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const resetHideTimer = () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      setShowControls(true);
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetHideTimer();
    const handleTouchStart = () => resetHideTimer();

    if (isOpen) {
      resetHideTimer();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchstart', handleTouchStart);
    }

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          mainSwiper?.slidePrev();
          break;
        case 'ArrowRight':
          mainSwiper?.slideNext();
          break;
        case ' ':
          e.preventDefault();
          // Toggle zoom
          if (isZoomed) {
            mainSwiper?.zoom?.out();
          } else {
            mainSwiper?.zoom?.in();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, mainSwiper, isZoomed, onClose]);

  if (!isOpen || !photos.length) return null;

  return (
    <div className="fixed inset-0 z-50 enhanced-lightbox-backdrop enhanced-lightbox-container flex flex-col">
      {/* Enhanced Header with controls */}
      <div className={`absolute top-4 right-4 z-30 flex gap-2 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        {/* Zoom Controls */}
        <button 
          onClick={() => {
            if (isZoomed) {
              mainSwiper?.zoom?.out();
              setIsZoomed(false);
            } else {
              mainSwiper?.zoom?.in();
              setIsZoomed(true);
            }
          }}
          className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        >
          {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
        </button>

        {/* Download Button */}
        <button 
          onClick={async () => {
            const currentPhoto = photos[currentSlide];
            if (currentPhoto && !isDownloading) {
              setIsDownloading(true);
              setDownloadProgress(0);
              
              const downloadUrl = currentPhoto.optimized_images?.original?.url || currentPhoto.url;
              const filename = currentPhoto.original_name || 'photo.jpg';
              
              await DownloadManager.downloadImage({
                url: downloadUrl,
                filename,
                onProgress: (progress) => setDownloadProgress(progress),
                onSuccess: () => {
                  setDownloadProgress(100);
                  setTimeout(() => {
                    setIsDownloading(false);
                    setDownloadProgress(0);
                  }, 1000);
                },
                onError: (error) => {
                  console.error('Download error:', error);
                  setIsDownloading(false);
                  setDownloadProgress(0);
                }
              });
            }
          }}
          disabled={isDownloading}
          className={`relative ${isDownloading ? 'bg-green-600/80' : 'bg-black/60 hover:bg-black/80'} text-white p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed overflow-hidden`}
          aria-label={isDownloading ? `Downloading... ${downloadProgress}%` : "Download original image"}
          title={isDownloading ? `Downloading original image... ${downloadProgress}%` : "Download original image"}
        >
          {/* Progress ring background */}
          {isDownloading && (
            <div className="absolute inset-0 rounded-full">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 42 42">
                {/* Background circle */}
                <circle
                  className="stroke-current text-white/20"
                  strokeWidth="3"
                  fill="none"
                  cx="21"
                  cy="21"
                  r="19"
                />
                {/* Progress circle */}
                <circle
                  className="stroke-current text-white transition-all duration-500 ease-out"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  cx="21"
                  cy="21"
                  r="19"
                  strokeDasharray={`${(downloadProgress / 100) * 119.38} 119.38`}
                  style={{
                    transformOrigin: '21px 21px',
                  }}
                />
              </svg>
            </div>
          )}
          
          {/* Icon */}
          <div className="relative z-10">
            {isDownloading ? (
              downloadProgress === 100 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Download className="w-5 h-5" />
              )
            ) : (
              <Download className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="bg-black/60 hover:bg-red-600/80 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Photo Info - Moved to top-left to avoid pagination */}
      <div className={`absolute top-16 left-4 z-20 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm max-w-xs">
          <p className="text-sm font-medium truncate">{photos[currentSlide]?.original_name}</p>
          {photos[currentSlide]?.uploader_name && (
            <p className="text-xs text-gray-400">by {photos[currentSlide].uploader_name}</p>
          )}
        </div>
      </div>

      {/* Main Swiper */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-6xl enhanced-swiper-container">
          <Swiper
            modules={[Navigation, Pagination, Zoom, Thumbs, Keyboard, EffectFade, Mousewheel]}
            onSwiper={(swiper) => {
              setMainSwiper(swiper);
              // Ensure pagination is properly initialized
              setTimeout(() => {
                if (swiper.pagination && swiper.pagination.render) {
                  swiper.pagination.render();
                  swiper.pagination.update();
                }
              }, 100);
            }}
            initialSlide={currentIndex}
            spaceBetween={30}
            slidesPerView={1}
            speed={600}
            effect="fade"
            fadeEffect={{
              crossFade: true
            }}
            navigation={{
              nextEl: '.lightbox-button-next',
              prevEl: '.lightbox-button-prev',
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 7,
              el: '.lightbox-pagination',
              renderBullet: (index, className) => {
                return `<span class="${className} lightbox-bullet" data-index="${index}"></span>`;
              },
            }}
            zoom={{
              maxRatio: 4,
              minRatio: 1,
              toggle: true,
            }}
            thumbs={{ 
              swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null 
            }}
            keyboard={{
              enabled: true,
              onlyInViewport: false,
            }}
            mousewheel={{
              thresholdDelta: 50,
              sensitivity: 1,
            }}
            onSlideChange={(swiper) => {
              setCurrentSlide(swiper.activeIndex);
              setIsZoomed(false);
            }}
            onZoomChange={(swiper, scale) => {
              setIsZoomed(scale > 1);
            }}
            grabCursor={true}
            touchRatio={1.5}
            touchAngle={45}
            longSwipesRatio={0.3}
            longSwipesMs={300}
            className="h-full w-full"
            loop={photos.length > 1}
          >
            {photos.map((photo) => (
              <SwiperSlide key={photo.id} className="flex items-center justify-center">
                <div className="swiper-zoom-container w-full h-full flex items-center justify-center">
                  {photo.optimized_images && typeof photo.optimized_images === 'object' ? (
                    <OptimizedImage
                      images={photo.optimized_images}
                      alt={photo.original_name || 'Gallery Photo'}
                      usage="lightbox"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={photo.url || photo.thumbnail_url || '/placeholder-image.svg'} 
                      alt={photo.original_name || 'Gallery Photo'}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Enhanced Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <div className={`lightbox-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              
              <div className={`lightbox-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Thumbnails Swiper */}
      {photos.length > 1 && (
        <div className={`h-24 md:h-32 px-4 pb-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Swiper
            modules={[FreeMode, Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={12}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            centeredSlides={true}
            speed={600}
            touchRatio={1.2}
            resistance={true}
            resistanceRatio={0.85}
            className="h-full"
            breakpoints={{
              640: { slidesPerView: 6, spaceBetween: 14 },
              768: { slidesPerView: 8, spaceBetween: 16 },
              1024: { slidesPerView: 10, spaceBetween: 18 }
            }}
          >
            {photos.map((photo, index) => (
              <SwiperSlide key={`thumb-${photo.id}`} className="cursor-pointer">
                <div className={`thumbnail-container w-full h-full rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                  index === currentSlide 
                    ? 'border-white/80 shadow-lg shadow-white/20' 
                    : 'border-transparent hover:border-white/50'
                }`}>
                  {photo.optimized_images && typeof photo.optimized_images === 'object' ? (
                    <OptimizedImage
                      images={photo.optimized_images}
                      alt={photo.original_name || 'Thumbnail'}
                      usage="thumbnail"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-60 hover:opacity-90'
                      }`}
                    />
                  ) : (
                    <img 
                      src={photo.url || photo.thumbnail_url || '/placeholder-image.svg'} 
                      alt={photo.original_name || 'Thumbnail'}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-60 hover:opacity-90'
                      }`}
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      )}

      {/* Enhanced Pagination - Clean without counter */}
      <div className={`lightbox-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} flex items-center justify-center`}></div>

      {/* Enhanced Instructions - Moved to bottom-right to avoid conflicts */}
      <div className={`absolute bottom-4 right-4 text-white/70 text-xs hidden lg:block transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm text-right">
          <p className="flex items-center gap-1 text-xs">
            <span>⌨️ Arrow keys</span> • 
            <span>🖱️ Double-click zoom</span> • 
            <span>⎋ ESC close</span>
          </p>
        </div>
      </div>
    </div>
  );
}