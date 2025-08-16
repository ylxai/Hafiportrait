// file: src/components/photo-lightbox.tsx

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, Trash, Heart } from "lucide-react";
import type { Photo } from "@/lib/database";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (photoId: string) => void;
  onLike: (photoId: string) => void;
  onUnlike: (photoId: string) => void;
}

export default function PhotoLightbox({ photos, currentIndex, onClose, onDelete, onLike }: PhotoLightboxProps) {
  const [localIndex, setLocalIndex] = useState(currentIndex);
  const [isLiking, setIsLiking] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Performance optimization: Use refs for timers
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLikeTimeRef = useRef<number>(0);
  
  // Memoize current photo to prevent unnecessary re-renders
  const currentPhoto = useMemo(() => photos[localIndex], [photos, localIndex]);
  
  // Detect device capabilities for adaptive performance
  const isLowEndDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return (navigator as any).hardwareConcurrency <= 2 || 
           (navigator as any).deviceMemory <= 2 ||
           /Android.*Chrome\/[0-5]/.test(navigator.userAgent);
  }, []);

  // Memoized navigation functions to prevent re-renders
  const goToPrevious = useCallback(() => {
    const isFirstSlide = localIndex === 0;
    const newIndex = isFirstSlide ? photos.length - 1 : localIndex - 1;
    setLocalIndex(newIndex);
  }, [localIndex, photos.length]);

  const goToNext = useCallback(() => {
    const isLastSlide = localIndex === photos.length - 1;
    const newIndex = isLastSlide ? 0 : localIndex + 1;
    setLocalIndex(newIndex);
  }, [localIndex, photos.length]);

  // Optimized like handler with performance considerations
  const handleLikeClick = useCallback(async () => {
    const now = Date.now();
    
    // Throttle rapid clicks (1000ms cooldown)
    if (now - lastLikeTimeRef.current < 1000) return;
    if (isLiking) return;
    
    lastLikeTimeRef.current = now;
    setIsLiking(true);
    setShowHeartAnimation(true);
    
    // Adaptive particle count based on device capability
    const particleCount = isLowEndDevice ? 3 : 5;
    const animationDuration = isLowEndDevice ? 1200 : 1500;
    
    // Create floating hearts effect with optimized positioning
    const newHearts = Array.from({ length: particleCount }, (_, i) => ({
      id: now + i,
      x: 45 + (i * 5) + Math.random() * 5, // More predictable positioning
      y: 45 + Math.random() * 10           // Reduced randomness for performance
    }));
    
    setFloatingHearts(newHearts);
    
    // Call the onLike function
    onLike(currentPhoto.id);
    
    // Clear existing timeout if present
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Reset animation with adaptive timing
    animationTimeoutRef.current = setTimeout(() => {
      setShowHeartAnimation(false);
      setIsLiking(false);
      setFloatingHearts([]);
      animationTimeoutRef.current = null;
    }, animationDuration);
  }, [isLiking, onLike, currentPhoto.id, isLowEndDevice]);

  // Optimized keyboard navigation with cleanup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        goToNext();
      } else if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, onClose]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  if (!currentPhoto) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh] p-0 bg-black border-none flex items-center justify-center">
        <VisuallyHidden asChild>
          <DialogTitle>Image Viewer</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden asChild>
          <DialogDescription>
            Viewing image: {currentPhoto.original_name}. Use arrow keys to navigate.
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center gpu-accelerated">
           <img 
              key={currentPhoto.id}
              src={currentPhoto.url} 
              alt={currentPhoto.original_name} 
              className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain animate-fade-in gpu-layer"
            />
            
            {/* Heart Animation Overlay */}
            {showHeartAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none gpu-accelerated">
                <div className="animate-heart-burst gpu-layer">
                  <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-lg" />
                </div>
              </div>
            )}
            
            {/* Floating Hearts Effect */}
            {floatingHearts.length > 0 && (
              <div className="heart-particles absolute inset-0 pointer-events-none gpu-accelerated">
                {floatingHearts.map((heart) => (
                  <div
                    key={heart.id}
                    className="heart-particle absolute gpu-layer"
                    style={{
                      left: `${heart.x}%`,
                      top: `${heart.y}%`,
                    }}
                  >
                    ❤️
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Navigation Buttons - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 hover:text-white touch-target gpu-layer"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-8 w-8 gpu-layer" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 hover:text-white touch-target gpu-layer"
          onClick={goToNext}
        >
          <ChevronRight className="h-8 w-8 gpu-layer" />
        </Button>

        {/* Mobile Navigation - Bottom */}
        <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 gpu-accelerated">
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/50 hover:bg-black/70 hover:text-white touch-target gpu-layer"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6 gpu-layer" />
          </Button>
          <span className="text-white text-sm bg-black/50 px-3 py-1 rounded gpu-layer">
            {localIndex + 1} / {photos.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/50 hover:bg-black/70 hover:text-white touch-target gpu-layer"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6 gpu-layer" />
          </Button>
        </div>

        {/* Top Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`heart-button text-white bg-black/30 hover:bg-red-500/80 hover:text-white touch-target transition-all duration-200 ${
                isLiking ? 'liked scale-110 bg-red-500/90' : ''
              }`}
              onClick={handleLikeClick}
              disabled={isLiking}
              title="Like foto ini"
            >
              <Heart className={`heart-icon h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 ${
                isLiking ? 'fill-white scale-125' : ''
              }`} />
            </Button>
            <a href={currentPhoto.url} download target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 hover:text-white touch-target">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 hover:text-white touch-target" onClick={() => onDelete(currentPhoto.id)}>
              <Trash className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 hover:text-white touch-target" onClick={onClose}>
                <X className="h-5 w-5 sm:h-6 sm:w-6" /> 
            </Button>
        </div>

        {/* Photo Info - Desktop */}
        <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
          {localIndex + 1} / {photos.length}
        </div>

        {/* Photo Info - Bottom Left */}
        <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-2 rounded space-y-1 gpu-accelerated">
          {currentPhoto.uploader_name && (
            <div className="flex items-center gap-2 gpu-layer">
              <span className="text-xs opacity-80">Oleh:</span>
              <span className="font-medium">{currentPhoto.uploader_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 gpu-layer">
            <Heart className="h-4 w-4 text-red-400 gpu-layer" />
            <span className="font-medium">{currentPhoto.likes || 0} likes</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}