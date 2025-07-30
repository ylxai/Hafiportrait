import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
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
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, Photo, Message } from "@shared/schema";
import LoadingSpinner from "@/components/ui/loading-spinner";
import PhotoLightbox from "@/components/photo-lightbox";

export default function EventPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploaderName, setUploaderName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("Tamu");
  const [guestName, setGuestName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [lightboxPhoto, setLightboxPhoto] = useState<number | null>(null);

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
      const response = await apiRequest("GET", `/api/events/${id}/albums/${selectedAlbum}/photos`);
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

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('uploaderName', uploaderName || 'Anonim');
      formData.append('albumName', selectedAlbum);

      const response = await fetch(`/api/events/${id}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload gagal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'photos'] });
      toast({
        title: "Foto Berhasil Diupload!",
        description: "Foto Anda telah ditambahkan ke album.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Gagal",
        description: "Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

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

  // Heart message mutation
  const heartMessageMutation = useMutation({
    mutationFn: async ({ messageId, hearts }: { messageId: string; hearts: number }) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}/hearts`, { hearts });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'messages'] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Use requestIdleCallback untuk menghindari blocking main thread
    const processFiles = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && files.length > 0) {
        const file = files.shift();
        if (!file) break;
        
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 10MB.",
          variant: "destructive",
        });
          continue;
      }
      uploadPhotoMutation.mutate(file);
      }
      
      // Jika masih ada files, schedule lagi
      if (files.length > 0) {
        requestIdleCallback(processFiles);
      }
  };

    // Start processing dengan idle callback
    if (typeof window.requestIdleCallback !== 'undefined') {
      requestIdleCallback(processFiles);
    } else {
      // Fallback untuk browser yang tidak support requestIdleCallback
      setTimeout(() => processFiles({ timeRemaining: () => 50, didTimeout: false }), 0);
    }
  };

  const handleSubmitMessage = useCallback(() => {
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
  }, [guestName, messageText, addMessageMutation, toast]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Berhasil Disalin!",
      description: "Link telah disalin ke clipboard.",
    });
  }, [toast]);

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

  const needsAccessCode = (selectedAlbum === "Tamu" || selectedAlbum === "Bridesmaid") && !isCodeVerified;

  return (
    <div className="min-h-screen bg-wedding-ivory">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-rose-gold/20 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{event.name}</h1>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(event.shareableLink)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(event.qrCode, '_blank')}
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Access Code Section for Tamu and Bridesmaid */}
        {needsAccessCode && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Masukkan Kode Akses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Album "{selectedAlbum}" memerlukan kode akses untuk mengupload foto. 
                Dapatkan kode dari penyelenggara acara.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Masukkan kode akses"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button
                  onClick={() => verifyCodeMutation.mutate(accessCode)}
                  disabled={!accessCode.trim() || verifyCodeMutation.isPending}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={selectedAlbum} onValueChange={setSelectedAlbum} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="Official">Official</TabsTrigger>
            <TabsTrigger value="Tamu">Tamu</TabsTrigger>
            <TabsTrigger value="Bridesmaid">Bridesmaid</TabsTrigger>
            <TabsTrigger value="Guestbook">Guestbook</TabsTrigger>
          </TabsList>

          {/* Official Photos Tab */}
          <TabsContent value="Official" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Foto Official</h2>
              <p className="text-gray-600 mb-6">Foto resmi dari fotografer acara</p>
            </div>

            {photosLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : photos.length > 0 ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="relative group cursor-pointer"
                    onClick={() => setLightboxPhoto(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.originalName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm">
                          Lihat
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada foto official yang diupload.</p>
              </div>
            )}
          </TabsContent>

          {/* Guest Photos Tab */}
          <TabsContent value="Tamu" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Foto Tamu</h2>
              <p className="text-gray-600 mb-6">Upload dan lihat foto dari para tamu</p>
            </div>

            {/* Upload Section */}
            {(isCodeVerified || selectedAlbum === "Official") && (
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="upload-area flex flex-col items-center justify-center w-full h-32 sm:h-40 cursor-pointer touch-manipulation">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-3 text-rose-gold" />
                        <p className="mb-2 text-sm sm:text-base text-gray-500">
                          <span className="font-semibold">Ketuk untuk upload foto</span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, atau GIF (maks. 10MB per file)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <Input
                    type="text"
                    placeholder="Nama Anda (opsional)"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="text-base"
                  />
                  {uploadPhotoMutation.isPending && (
                    <div className="flex items-center justify-center py-2">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-sm text-gray-600">Mengupload foto...</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Photos Grid */}
            {photosLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : photos.length > 0 ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="relative group cursor-pointer"
                    onClick={() => setLightboxPhoto(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.originalName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>{photo.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada foto yang diupload. Jadilah yang pertama!</p>
              </div>
            )}
          </TabsContent>

          {/* Bridesmaid Photos Tab */}
          <TabsContent value="Bridesmaid" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Foto Bridesmaid</h2>
              <p className="text-gray-600 mb-6">Album khusus untuk para bridesmaid</p>
            </div>

            {/* Upload Section */}
            {(isCodeVerified || selectedAlbum === "Official") && (
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="upload-area flex flex-col items-center justify-center w-full h-32 sm:h-40 cursor-pointer touch-manipulation">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-3 text-rose-gold" />
                        <p className="mb-2 text-sm sm:text-base text-gray-500">
                          <span className="font-semibold">Ketuk untuk upload foto</span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, atau GIF (maks. 10MB per file)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <Input
                    type="text"
                    placeholder="Nama Anda (opsional)"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="text-base"
                  />
                  {uploadPhotoMutation.isPending && (
                    <div className="flex items-center justify-center py-2">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-sm text-gray-600">Mengupload foto...</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Photos Grid */}
            {photosLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : photos.length > 0 ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="relative group cursor-pointer"
                    onClick={() => setLightboxPhoto(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.originalName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>{photo.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada foto bridesmaid yang diupload.</p>
              </div>
            )}
          </TabsContent>

          {/* Guestbook Tab */}
          <TabsContent value="Guestbook" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Buku Tamu Digital</h2>
              <p className="text-gray-600 mb-6">Tinggalkan pesan dan ucapan untuk pengantin</p>
            </div>

            {/* Message Form */}
            <Card className="p-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nama Anda"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <Textarea
                  placeholder="Tulis pesan atau ucapan Anda..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleSubmitMessage}
                  disabled={addMessageMutation.isPending}
                  className="w-full bg-rose-gold text-white hover:bg-deep-rose"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {addMessageMutation.isPending ? "Mengirim..." : "Kirim Pesan"}
                </Button>
              </div>
            </Card>

            {/* Messages List */}
            {messagesLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{message.guestName}</h4>
                        <p className="text-gray-600 mt-1">{message.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(message.createdAt!).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => heartMessageMutation.mutate({
                          messageId: message.id,
                          hearts: (message.hearts || 0) + 1
                        })}
                        className="flex items-center space-x-1 text-rose-gold hover:bg-rose-gold/10"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{message.hearts || 0}</span>
                      </Button>
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
      </div>

      {/* Photo Lightbox */}
      {lightboxPhoto !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          eventId={id!}
        />
      )}
    </div>
  );
}