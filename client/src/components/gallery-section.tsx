
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Heart, Eye, ZoomIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GalleryPhoto {
  id: string;
  url: string;
  originalName: string;
  albumName: string;
  likes: number;
  uploadedAt: string;
}

const categories = ["All", "Wedding", "Pre-Wedding", "Family", "Gallery"];

export default function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryPhoto | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  // Fetch gallery photos from API
  useEffect(() => {
    const fetchGalleryPhotos = async () => {
      try {
        setLoading(true);
        const endpoint = selectedCategory === "All" 
          ? "/api/admin/gallery" 
          : `/api/admin/gallery/${selectedCategory}`;
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const photos = await response.json();
          setGalleryImages(photos);
        } else {
          console.error('Failed to fetch gallery photos');
          setGalleryImages([]);
        }
      } catch (error) {
        console.error('Error fetching gallery photos:', error);
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryPhotos();
  }, [selectedCategory]);

  const filteredImages = galleryImages;

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-rose-gold/10 px-4 py-2 rounded-full mb-4">
            <Camera className="h-5 w-5 text-rose-gold" />
            <span className="text-rose-gold font-medium">GALERI</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-gold to-deep-rose">Terbaik</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Lihat koleksi foto-foto terbaik kami yang mengabadikan momen berharga
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`px-6 py-2 transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-rose-gold to-deep-rose text-white shadow-lg"
                    : "border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
            <p className="mt-4 text-gray-600">Memuat foto...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">Belum ada foto di galeri</p>
            <p className="text-gray-400">
              {selectedCategory === "All" 
                ? "Foto akan ditampilkan setelah diunggah melalui admin dashboard" 
                : `Belum ada foto untuk kategori "${selectedCategory}"`
              }
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && filteredImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredImages.map((image) => (
              <Card 
                key={image.id} 
                className="group overflow-hidden card-hover cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0 relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback jika gambar gagal dimuat
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTA1LjUyMyA4MCAxMTAgODQuNDc3IDExMCA5MEM5NSA5NSA5NSAxMDUgMTEwIDExMEMxMDQuNDc3IDExMCAxMDAgMTE0LjQ3NyAxMDAgMTIwSDEwMEMxMDAgMTA1IDkwIDEwMCA5MCA5MEw5MCA5MEw5MCA5MEM5MCA4NC40NzcgOTQuNDc3IDgwIDEwMCA4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center text-white">
                      <ZoomIn className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-semibold text-lg">{image.originalName}</h3>
                      <p className="text-sm text-gray-300">{image.albumName}</p>
                      <div className="flex items-center justify-center mt-2">
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-sm">{image.likes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage.url}
                alt={selectedImage.originalName}
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">{selectedImage.originalName}</h3>
                <p className="text-sm text-gray-300">{selectedImage.albumName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show More Button - only if there are photos */}
        {!loading && filteredImages.length > 0 && (
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-rose-gold to-deep-rose text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Eye className="h-5 w-5 mr-2" />
              Lihat Semua Portfolio
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
