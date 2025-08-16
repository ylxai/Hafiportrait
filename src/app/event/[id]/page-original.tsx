'use client';

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  QrCode, 
  Share2, 
  Heart,
  Download,
  Users,
  MessageSquare,
  Calendar,
  Lock,
  Key,
  CheckCircle,
  Copy,
  ExternalLink,
  Filter,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";
import type { Event, Photo, Message, MessageReactions } from "@/lib/database";
import LoadingSpinner from "@/components/ui/loading-spinner";
import PhotoLightbox from "@/components/photo-lightbox";
import PhotoUploadForm from "@/components/event/PhotoUploadForm";

export default function EventPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  const [accessCode, setAccessCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("Official");
  const [guestName, setGuestName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // New enhanced features states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "uploader">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "official" | "guest">("all");
  const [showQRModal, setShowQRModal] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['/api/events', id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${id}`);
      return response.json() as Promise<Event>;
    },
    enabled: !!id,
  });

  // Fetch event photos for current album
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/events', id, 'photos', selectedAlbum],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${id}/photos`);
      return response.json() as Promise<Photo[]>;
    },
    enabled: !!id && !!selectedAlbum,
  });

  // Fetch event messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/events', id, 'messages'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${id}/messages`);
      return response.json() as Promise<Message[]>;
    },
    enabled: !!id,
  });

  // Verify access code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", `/api/events/${id}/verify-code`, { accessCode: code });
      return response.json();
    },
    onSuccess: () => {
      setIsCodeVerified(true);
      toast({
        title: "Kode Akses Benar!",
        description: "Anda sekarang dapat mengupload foto.",
      });
    },
    onError: () => {
      toast({
        title: "Kode Salah",
        description: "Silakan periksa kembali kode akses Anda.",
        variant: "destructive",
      });
    },
  });
  // Enhanced photo filtering and sorting
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = photos.filter(p => p.album_name === selectedAlbum);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.uploader_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.original_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply uploader filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "official") {
        filtered = filtered.filter(p => p.uploader_name === "Admin" || p.album_name === "Official");
      } else if (selectedFilter === "guest") {
        filtered = filtered.filter(p => p.uploader_name !== "Admin" && p.album_name !== "Official");
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case "oldest":
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        case "uploader":
          return (a.uploader_name || "").localeCompare(b.uploader_name || "");
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [photos, selectedAlbum, searchTerm, selectedFilter, sortBy]);

  // Keep original albumPhotos for compatibility
  const albumPhotos = filteredAndSortedPhotos;

  // Message submission mutation
  const addMessageMutation = useMutation({
    mutationFn: async (data: { guestName: string; message: string }) => {
      const response = await apiRequest("POST", `/api/events/${id}/messages`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'messages'] });
      setGuestName("");
      setMessageText("");
      toast({
        title: "Pesan Berhasil Dikirim!",
        description: "Pesan Anda telah ditambahkan ke buku tamu.",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal mengirim pesan.",
        variant: "destructive",
      });
    },
  });

  // Like message mutation
  const likeMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/hearts`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'messages'] });
      toast({
        title: "❤️ Liked!",
        description: "Anda menyukai pesan ini.",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal memberikan like.",
        variant: "destructive",
      });
    },
  });

  // Like photo mutation
  const likePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      // Get current photo to increment likes
      const currentPhoto = photos.find(p => p.id === photoId);
      const newLikes = (currentPhoto?.likes || 0) + 1;
      
      const response = await apiRequest("PATCH", `/api/photos/${photoId}/likes`, {
        likes: newLikes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'photos'] });
      toast({
        title: "❤️ Liked!",
        description: "Anda menyukai foto ini.",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal memberikan like pada foto.",
        variant: "destructive",
      });
    },
  });

  // Reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, reactionType }: { messageId: string; reactionType: keyof MessageReactions }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/reactions`, {
        reactionType
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'messages'] });
      const reactionEmojis = {
        love: "😍",
        laugh: "😂",
        wow: "😮",
        sad: "😢",
        angry: "😠"
      };
      toast({
        title: `${reactionEmojis[variables.reactionType]} Reaction Added!`,
        description: `Anda memberikan reaksi ${variables.reactionType}.`,
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal memberikan reaksi.",
        variant: "destructive",
      });
    },
  });
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "File Tidak Valid",
          description: "Hanya file gambar yang diperbolehkan.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 15MB.",
          variant: "destructive",
        });
        return;
      }
      
      // uploadPhotoMutation.mutate(file); // TODO: Define uploadPhotoMutation
    });
  };

  const handleSubmitMessage = () => {
    if (!guestName.trim() || !messageText.trim()) {
      toast({
        title: "Informasi Kurang",
        description: "Mohon isi nama dan pesan.",
        variant: "destructive",
      });
      return;
    }

    addMessageMutation.mutate({
      guestName: guestName.trim(),
      message: messageText.trim(),
    });
  };

  const handleLikeMessage = (messageId: string) => {
    likeMessageMutation.mutate(messageId);
  };

  const handleAddReaction = (messageId: string, reactionType: keyof MessageReactions) => {
    addReactionMutation.mutate({ messageId, reactionType });
  };

  const handleLikePhoto = (photoId: string) => {
    likePhotoMutation.mutate(photoId);
  };

  const handleDeletePhoto = (photoId: string) => {
    // Implementasi delete foto jika diperlukan
    console.log('Delete photo:', photoId);
    toast({
      title: "Info",
      description: "Fitur hapus foto belum tersedia.",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Berhasil Disalin!",
          description: "Link telah disalin ke clipboard.",
        });
      } else {
        // Fallback untuk browser yang tidak support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast({
            title: "Berhasil Disalin!",
            description: "Link telah disalin ke clipboard.",
          });
        } catch (err) {
          toast({
            title: "Gagal Menyalin",
            description: "Silakan salin link secara manual.",
            variant: "destructive",
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      toast({
        title: "Gagal Menyalin",
        description: "Tidak dapat menyalin ke clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-wedding-ivory flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-wedding-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acara Tidak Ditemukan</h1>
          <p className="text-gray-600">Acara yang Anda cari tidak ada atau telah dihapus.</p>
        </div>
      </div>
    );
  }

  
  // 4. Handler untuk membuka lightbox dengan logika yang benar
  const handlePhotoClick = (photoIndexInAlbum: number) => {
    setSelectedPhotoIndex(photoIndexInAlbum);
    setIsLightboxOpen(true);
  };

  // Enhanced features handlers
  const handleShareEvent = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Berhasil Disalin!",
        description: `${type} telah disalin ke clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Gagal Menyalin",
        description: "Tidak dapat menyalin ke clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPhoto = async (photoUrl: string, fileName: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Berhasil!",
        description: `Foto ${fileName} telah didownload.`,
      });
    } catch (error) {
      toast({
        title: "Download Gagal",
        description: "Tidak dapat mendownload foto.",
        variant: "destructive",
      });
    }
  };
  

  const needsAccessCode = (selectedAlbum === "Tamu" || selectedAlbum === "Bridesmaid") && !isCodeVerified;

  return (
    <div className="min-h-screen bg-wedding-ivory">
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-wedding-gold/20 shadow-sm">
        <div className="mobile-container">
          <div className={`flex items-center justify-between ${isMobile ? 'py-3' : 'py-4'}`}>
            <div className="flex-1 min-w-0">
              <h1 className={`font-bold text-gray-800 truncate ${
                isMobile ? 'text-xl leading-tight' : 'text-3xl'
              }`}>
                {event.name}
              </h1>
              <p className={`text-gray-600 truncate ${
                isMobile ? 'text-xs mt-1' : 'text-sm'
              }`}>
                {new Date(event.date).toLocaleDateString('id-ID', { 
                  weekday: isMobile ? 'short' : 'long', 
                  year: 'numeric', 
                  month: isMobile ? 'short' : 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => event.shareable_link && copyToClipboard(event.shareable_link)}
                className={`mobile-button ${isMobile ? 'px-3 py-2' : ''}`}
              >
                <Share2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {!isMobile && <span className="ml-2">Share</span>}
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={handleShowQR}
                className={`mobile-button ${isMobile ? 'px-3 py-2' : ''}`}
              >
                <QrCode className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {!isMobile && <span className="ml-2">QR</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-container mobile-spacing">
        {/* Mobile-Optimized Access Code Section */}
        {needsAccessCode && (
          <Card className={`mb-6 mx-auto ${isMobile ? 'mobile-card' : 'max-w-md'}`}>
            <CardHeader className={isMobile ? 'mobile-card-header' : ''}>
              <CardTitle className={`flex items-center gap-2 ${
                isMobile ? 'mobile-card-title text-lg' : ''
              }`}>
                <Lock className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                Masukkan Kode Akses
              </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-4 ${isMobile ? 'mobile-card-content' : ''}`}>
              <p className={`text-gray-600 ${isMobile ? 'text-sm leading-relaxed' : 'text-sm'}`}>
                Album "{selectedAlbum}" memerlukan kode akses untuk mengupload foto. 
                Dapatkan kode dari penyelenggara acara.
              </p>
              <div className={`flex ${isMobile ? 'gap-3' : 'gap-2'}`}>
                <Input
                  type="text"
                  placeholder="Masukkan kode akses"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className={`uppercase ${isMobile ? 'mobile-input text-lg' : ''}`}
                />
                <Button
                  onClick={() => verifyCodeMutation.mutate(accessCode)}
                  disabled={!accessCode.trim() || verifyCodeMutation.isPending}
                  className={isMobile ? 'mobile-button px-4' : ''}
                >
                  <Key className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile-Optimized Tabs */}
        <Tabs value={selectedAlbum} onValueChange={setSelectedAlbum} className="w-full">
          <div className={isMobile ? 'mobile-tabs-container' : ''}>
            <TabsList className={`${
              isMobile 
                ? 'mobile-tabs-list grid grid-cols-4 h-auto p-1' 
                : 'grid w-full grid-cols-4'
            }`}>
              <TabsTrigger 
                value="Official" 
                className={isMobile ? 'mobile-tab text-xs py-3' : ''}
              >
                {isMobile ? 'Official' : 'Official'}
              </TabsTrigger>
              <TabsTrigger 
                value="Tamu" 
                className={isMobile ? 'mobile-tab text-xs py-3' : ''}
              >
                {isMobile ? 'Tamu' : 'Tamu'}
              </TabsTrigger>
              <TabsTrigger 
                value="Bridesmaid" 
                className={isMobile ? 'mobile-tab text-xs py-3' : ''}
              >
                {isMobile ? 'Bridesmaid' : 'Bridesmaid'}
              </TabsTrigger>
              <TabsTrigger 
                value="Guestbook" 
                className={isMobile ? 'mobile-tab text-xs py-3' : ''}
              >
                {isMobile ? 'Guestbook' : 'Guestbook'}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Photo Tabs Content */}
          {["Official", "Tamu", "Bridesmaid"].map((album) => (
            <TabsContent key={album} value={album} className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <div className="text-center">
                <h2 className={`font-bold mb-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  Foto {album}
                </h2>
                <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : 'mb-6'}`}>
                  {album === "Official" && "Foto resmi dari fotografer acara"}
                  {album === "Tamu" && "Upload dan lihat foto dari para tamu"}
                  {album === "Bridesmaid" && "Album khusus untuk para bridesmaid"}
                </p>
              </div>

              {/* Upload Form - Only for Tamu and Bridesmaid */}
              {(album === "Tamu" || album === "Bridesmaid") && !needsAccessCode && (
      <Card className={`${isMobile ? 'mobile-card mobile-padding' : 'p-4 sm:p-6'}`}>
        <PhotoUploadForm 
          eventId={id}
          albumName={album}
          disabled={false}
        />
      </Card>
              )}
              
              {/* Photo Gallery */}
              {photosLoading ? (
                <div className={`text-center ${isMobile ? 'py-12' : 'py-8'}`}>
                  <LoadingSpinner />
                  {isMobile && (
                    <p className="mt-4 text-sm text-gray-500">Memuat foto...</p>
                  )}
                </div>
              ) : albumPhotos.filter(p => p.album_name === album).length > 0 ? (
                <div className={`photo-grid ${
                  isMobile 
                    ? 'grid-cols-2 gap-3' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                }`}>
                  {albumPhotos.filter(p => p.album_name === album).map((photo, index) => (
                    <div 
                      key={photo.id} 
                      className={`relative group cursor-pointer touch-feedback ${
                        isMobile ? 'rounded-xl overflow-hidden' : 'rounded-lg overflow-hidden'
                      }`}
                      onClick={() => handlePhotoClick(index)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.original_name}
                        className={`w-full object-cover transition-transform duration-200 ${
                          isMobile 
                            ? 'h-40 group-active:scale-95' 
                            : 'h-48 group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />
                      
                      {/* Mobile-Optimized Overlay */}
                      <div className={`absolute inset-0 transition-all duration-200 flex items-end ${
                        isMobile 
                          ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent' 
                          : 'bg-black/0 group-hover:bg-black/30'
                      }`}>
                        <div className={`transition-opacity duration-200 text-white ${
                          isMobile 
                            ? 'opacity-100 p-3 w-full' 
                            : 'opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full'
                        }`}>
                          <div className={`flex items-center ${
                            isMobile ? 'justify-between w-full' : 'space-x-2'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <Heart className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                              <span className={`${isMobile ? 'text-sm font-medium' : 'text-sm'}`}>
                                {photo.likes || 0}
                              </span>
                            </div>
                            {isMobile && photo.uploader_name && (
                              <span className="text-xs opacity-80 truncate max-w-20">
                                {photo.uploader_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Touch Indicator */}
                      {isMobile && (
                        <div className="absolute top-2 right-2 bg-black/20 rounded-full p-1">
                          <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center text-gray-500 ${
                  isMobile ? 'py-16 px-6' : 'py-12'
                }`}>
                  <div className={`${
                    isMobile ? 'bg-gray-50 rounded-2xl p-8' : ''
                  }`}>
                    <Camera className={`mx-auto mb-4 text-gray-300 ${
                      isMobile ? 'h-16 w-16' : 'h-12 w-12'
                    }`} />
                    <p className={`${
                      isMobile ? 'text-base font-medium mb-2' : 'text-sm'
                    }`}>
                      Belum ada foto di album {album}
                    </p>
                    {isMobile && (album === "Tamu" || album === "Bridesmaid") && (
                      <p className="text-sm text-gray-400">
                        Jadilah yang pertama upload foto!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}

          {/* Separate Guestbook Tab - NO PHOTOS */}


          {/* Simplified Guestbook Tab */}
          <TabsContent value="Guestbook" className={isMobile ? 'space-y-4' : 'space-y-6'}>
            <div className="text-center">
              <h2 className={`font-bold mb-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                Buku Tamu Digital
              </h2>
              <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : 'mb-6'}`}>
                Tinggalkan pesan dan ucapan untuk pengantin
              </p>
            </div>

            {/* Simplified Message Form */}
            <Card className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nama Anda"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={isMobile ? 'h-10 text-base' : ''}
                  disabled={addMessageMutation.isPending}
                />
                <Textarea
                  placeholder="Tulis pesan atau ucapan Anda..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={3}
                  className={isMobile ? 'text-base resize-none' : ''}
                  disabled={addMessageMutation.isPending}
                />
                
                {/* Simple Submit Button */}
                <Button
                  onClick={handleSubmitMessage}
                  disabled={addMessageMutation.isPending || !guestName.trim() || !messageText.trim()}
                  className={`w-full bg-wedding-gold text-black hover:bg-wedding-gold/90 ${
                    isMobile ? 'h-11' : ''
                  }`}
                >
                  {addMessageMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span>Mengirim...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Kirim Pesan</span>
                    </div>
                  )}
                </Button>
              </div>
            </Card>

            {/* Simple Messages List */}
            {messagesLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{message.guest_name || message.sender_name}</h4>
                          <p className="text-gray-600 mt-1">{message.message || message.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(message.created_at || message.sent_at || new Date()).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeMessage(message.id)}
                          disabled={likeMessageMutation.isPending}
                          className={`flex items-center space-x-1 text-wedding-rose hover:bg-wedding-rose/10 transition-all duration-200 ${
                            likeMessageMutation.isPending ? 'opacity-50' : 'hover:scale-105'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${
                            likeMessageMutation.isPending ? 'animate-pulse' : ''
                          }`} />
                          <span className="font-medium">{message.hearts || 0}</span>
                        </Button>
                      </div>
                      
                      {/* Reactions Section */}
                      <div className="border-t pt-3">
                        {/* Display existing reactions */}
                        {message.reactions && Object.values(message.reactions).some(count => count > 0) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(message.reactions).map(([reaction, count]) => {
                              if (count === 0) return null;
                              const reactionEmojis = {
                                love: "😍",
                                laugh: "😂", 
                                wow: "😮",
                                sad: "😢",
                                angry: "😠"
                              };
                              return (
                                <span
                                  key={reaction}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                  <span>{reactionEmojis[reaction as keyof MessageReactions]}</span>
                                  <span className="font-medium">{count}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Reaction buttons */}
                        <div className="flex flex-wrap gap-1">
                          {(['love', 'laugh', 'wow', 'sad', 'angry'] as const).map((reactionType) => {
                            const reactionEmojis = {
                              love: "😍",
                              laugh: "😂",
                              wow: "😮", 
                              sad: "😢",
                              angry: "😠"
                            };
                            return (
                              <Button
                                key={reactionType}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddReaction(message.id, reactionType)}
                                disabled={addReactionMutation.isPending}
                                className={`p-2 h-8 w-8 hover:scale-110 transition-all duration-200 ${
                                  addReactionMutation.isPending ? 'opacity-50' : ''
                                }`}
                                title={`React with ${reactionType}`}
                              >
                                <span className="text-lg">{reactionEmojis[reactionType]}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada pesan. Jadilah yang pertama menulis ucapan!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {isLightboxOpen && selectedPhotoIndex !== null && (
          <PhotoLightbox
            photos={albumPhotos.filter(p => p.album_name === selectedAlbum)} 
            currentIndex={selectedPhotoIndex}
            onClose={() => setIsLightboxOpen(false)}
            onDelete={handleDeletePhoto}
            onLike={handleLikePhoto}
            onUnlike={() => { /* Implementasi Batal Suka jika diperlukan */ }}
          />
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">QR Code Event</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQRModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <div className="p-6 text-center space-y-4">
                {event.qr_code ? (
                  <>
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                      <img 
                        src={event.qr_code} 
                        alt="QR Code Event" 
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Scan QR code ini untuk mengakses event
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => event.qr_code && window.open(event.qr_code, '_blank')}
                          className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-black"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buka QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => event.qr_code && copyToClipboard(event.qr_code)}
                          className="w-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy QR Code URL
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => event.shareable_link && copyToClipboard(event.shareable_link)}
                          className="w-full"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Copy Link Event
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 py-8">
                    <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>QR Code tidak tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 