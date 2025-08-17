/**
 * Admin Dashboard - Mobile Optimized Version
 * Prioritas tampilan mobile dengan navigasi yang lebih baik
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRequireAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Event, Stats } from "@/lib/database";

// Import mobile components
import { MobileBottomNav } from "@/components/admin/mobile-bottom-nav";
import { MobileHeader } from "@/components/admin/mobile-header";
import { ResponsiveGrid, MobileCard } from "@/components/admin/responsive-grid";
import { MobileDataTable } from "@/components/admin/mobile-data-table";
import { 
  MobileFormField, 
  MobileFormSection, 
  MobileFormActions,
  MobileInput,
  MobileTextarea,
  MobileSelect 
} from "@/components/admin/mobile-form";

// Import existing components
import EventForm from "@/components/admin/EventForm";
import { EventStatusSummary } from "@/components/admin/event-status-summary";
import { AutoStatusManager } from "@/components/admin/auto-status-manager";
import { SmartNotificationManager } from "@/components/admin/smart-notification-manager";
import { QRCodeDialog } from "@/components/admin/qr-code-dialog";
import StatsCards from "@/components/admin/StatsCards";
import { ToastProvider } from "@/components/ui/toast-notification";
import PhotoLightbox from "@/components/photo-lightbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Import icons
import { 
  Calendar, 
  Camera, 
  MessageSquare,
  Plus,
  Edit,
  Archive,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Image,
  Trash,
  QrCode,
  Play,
  Pause,
  CheckCircle,
  Settings
} from "lucide-react";

// Dynamic imports untuk komponen berat
const DSLRMonitor = dynamic(() => import("@/components/admin/dslr-monitor"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>
});

const SystemMonitor = dynamic(() => import("@/components/admin/system-monitor"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>
});

const BackupStatusMonitor = dynamic(() => import("@/components/admin/backup-status-monitor").then(mod => ({ default: mod.BackupStatusMonitor })), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>
});

const ColorPaletteSwitcher = dynamic(() => import("@/components/ui/color-palette-switcher").then(mod => mod.ColorPaletteSwitcher), {
  ssr: false,
  loading: () => <div className="w-8 h-8"></div>
});

export default function AdminDashboardMobileOld() {
  const auth = useRequireAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  
  // Photo management states
  const [selectedPhotoTab, setSelectedPhotoTab] = useState("homepage");
  
  // Slideshow management states
  const [slideshowSettings, setSlideshowSettings] = useState({
    interval: 5000,
    transition: 'fade',
    autoplay: true,
    loop: true
  });
  const [selectedEventForPhotos, setSelectedEventForPhotos] = useState("");
  const [isHomepageUploadOpen, setIsHomepageUploadOpen] = useState(false);
  const [isOfficialUploadOpen, setIsOfficialUploadOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // QR Code Dialog state
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedEventForQR, setSelectedEventForQR] = useState<Event | null>(null);
  
  // Logout handler
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/admin/events'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/events");
      return response.json() as Promise<Event[]>;
    },
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch photos for homepage
  const { data: homepagePhotos = [], isLoading: homepagePhotosLoading } = useQuery({
    queryKey: ['/api/admin/photos/homepage'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/photos/homepage");
      return response.json();
    },
  });

  // Fetch photos for selected event
  const { data: eventPhotos = [], isLoading: eventPhotosLoading } = useQuery({
    queryKey: ['/api/admin/photos/event', selectedEventForPhotos],
    queryFn: async () => {
      if (!selectedEventForPhotos) return [];
      const response = await apiRequest("GET", `/api/events/${selectedEventForPhotos}/photos`);
      return response.json();
    },
    enabled: !!selectedEventForPhotos,
  });

  // Fetch slideshow photos
  const { data: slideshowPhotos = [], isLoading: slideshowPhotosLoading } = useQuery({
    queryKey: ['/api/admin/slideshow'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/slideshow");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: selectedPhotoTab === 'slideshow', // Only fetch when tab is active
  });

  // Create/Update event mutations
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/admin/events", eventData);
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: (newEvent: Event) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setCreatedEvent(newEvent);
      toast({
        title: "✅ Event Berhasil Dibuat!",
        description: "Event baru telah ditambahkan.",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("PUT", `/api/admin/events/${eventData.id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      setIsEventFormOpen(false);
      setEditingEvent(null);
      setCreatedEvent(null);
      toast({
        title: "✅ Event Berhasil Diperbarui!",
        description: "Perubahan telah disimpan.",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "✅ Event Berhasil Dihapus!",
        description: "Event dan semua data terkait telah dihapus.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Gagal Menghapus Event",
        description: error.message || "Terjadi kesalahan saat menghapus event.",
        variant: "destructive",
      });
    },
  });

  // Update event status mutation
  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/events/${eventId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "✅ Status Event Diperbarui!",
        description: "Status event berhasil diubah.",
      });
    },
  });

  // Add photo to slideshow mutation
  const addToSlideshowMutation = useMutation({
    mutationFn: async (photoId: string) => {
      console.log('Adding photo to slideshow:', photoId);
      const response = await apiRequest('POST', '/api/admin/slideshow', {
        photoId: photoId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add photo to slideshow');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Successfully added to slideshow:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slideshow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/photos/homepage'] });
      toast({
        title: "✅ Berhasil!",
        description: "Foto berhasil ditambahkan ke slideshow",
      });
    },
    onError: (error: any) => {
      console.error('Error adding to slideshow:', error);
      toast({
        title: "❌ Gagal",
        description: error.message || "Gagal menambahkan foto ke slideshow",
        variant: "destructive",
      });
    },
  });

  // Remove photo from slideshow mutation
  const removeFromSlideshowMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/slideshow?photoId=${photoId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slideshow'] });
      toast({
        title: "✅ Berhasil!",
        description: "Foto berhasil dihapus dari slideshow",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Gagal",
        description: error.message || "Gagal menghapus foto dari slideshow",
        variant: "destructive",
      });
    },
  });

  // Upload homepage photo mutation
  const uploadHomepagePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiRequest("POST", "/api/admin/photos/homepage", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/photos/homepage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "✅ Foto Berhasil Diupload!",
        description: "Foto telah ditambahkan ke galeri homepage.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Gagal Upload Foto",
        description: "Terjadi kesalahan saat mengupload foto.",
        variant: "destructive",
      });
    },
  });

  // Upload official photo mutation
  const uploadOfficialPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploaderName', 'Admin');
      formData.append('albumName', 'Official');
      const response = await apiRequest("POST", `/api/events/${selectedEventForPhotos}/photos`, formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/photos/event', selectedEventForPhotos] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsOfficialUploadOpen(false);
      toast({
        title: "✅ Foto Official Berhasil Diupload!",
        description: "Foto telah ditambahkan ke galeri official event.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Gagal Upload Foto Official",
        description: "Terjadi kesalahan saat mengupload foto official.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/photos/${photoId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete photo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/photos/homepage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/photos/event', selectedEventForPhotos] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "✅ Foto Berhasil Dihapus!",
        description: "Foto telah dihapus dari sistem.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Gagal Menghapus Foto",
        description: "Terjadi kesalahan saat menghapus foto.",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleCreateNewEvent = () => {
    setEditingEvent(null);
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventFormOpen(true);
  };

  const handleEventSubmit = async (data: any) => {
    if (editingEvent) {
      updateEventMutation.mutate({ ...data, id: editingEvent.id });
    } else {
      createEventMutation.mutate(data);
    }
  };

  // Photo management handlers
  const handleHomepagePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 10MB.",
          variant: "destructive",
        });
        return;
      }
      uploadHomepagePhotoMutation.mutate(file);
    });
  };

  const handleOfficialPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 10MB.",
          variant: "destructive",
        });
        return;
      }
      uploadOfficialPhotoMutation.mutate(file);
    }
  };

  // QR Code handlers
  const handleShowQRCode = (event: Event) => {
    setSelectedEventForQR(event);
    setIsQRDialogOpen(true);
  };

  // Loading state
  if (!auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader 
          user={auth.user} 
          onLogout={handleLogout}
        />

        {/* Desktop Header */}
        <div className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">HafiPortrait Photography</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">{auth.user.full_name}</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-4 md:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Hidden TabsList - Required for Tabs to work, navigation handled by MobileBottomNav */}
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              {/* Stats Cards - Mobile Optimized */}
              <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
                 <MobileCard
                  title="Total Event"
                  value={(stats?.totalEvents as number) || 0}
                  icon={<Calendar className="h-5 w-5" />}
                  subtitle="Event aktif & selesai"
                />
                 <MobileCard
                  title="Total Foto"
                  value={(stats?.totalPhotos as number) || 0}
                  icon={<Camera className="h-5 w-5" />}
                  subtitle="Semua galeri"
                />
                 <MobileCard
                  title="Total Pesan"
                  value={(stats?.totalMessages as number) || 0}
                  icon={<MessageSquare className="h-5 w-5" />}
                  subtitle="Dari pengunjung"
                />
              </ResponsiveGrid>

              {/* Performance Overview - Real Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }} gap="sm">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">{events.filter(e => e.status === 'active').length}</div>
                      <div className="text-xs text-gray-600">Event Aktif</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Camera className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'completed').length}</div>
                      <div className="text-xs text-gray-600">Event Selesai</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Archive className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">{events.filter(e => e.is_archived).length}</div>
                      <div className="text-xs text-gray-600">Event Diarsip</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <MessageSquare className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold text-orange-600">{events.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length}</div>
                      <div className="text-xs text-gray-600">Event Hari Ini</div>
                    </div>
                  </ResponsiveGrid>
                </CardContent>
              </Card>

              {/* Recent Activity - Real Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.slice(0, 3).map((event, index) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          event.status === 'active' ? 'bg-green-500' : 
                          event.status === 'completed' ? 'bg-blue-500' : 
                          event.status === 'draft' ? 'bg-gray-500' : 'bg-orange-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{event.name}</p>
                          <p className="text-xs text-gray-600">
                            {event.status === 'active' ? 'Event Aktif' : 
                             event.status === 'completed' ? 'Event Selesai' : 
                             event.status === 'draft' ? 'Draft' : 'Status: ' + event.status}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(event.date).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Belum ada event</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              {/* Quick Actions */}
              <div className="flex gap-3 mb-4">
                <Button 
                  onClick={handleCreateNewEvent} 
                  className="flex-1"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Event Baru
                </Button>
              </div>

              {/* Enhanced Stats Cards */}
              <StatsCards stats={stats} />

              {/* Event Status Summary */}
              <EventStatusSummary events={events} />

              {/* Auto Status Manager */}
              <AutoStatusManager events={events} />

              {/* Events List - Mobile Optimized */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daftar Event</CardTitle>
                </CardHeader>
                <CardContent>
              <MobileDataTable
                    data={events}
                    columns={[
                      {
                        key: 'name',
                        label: 'Nama Event',
                        priority: 'high',
                        render: (event) => (
                           <div>
                             <p className="font-medium">{event.name}</p>
                             <p className="text-xs text-gray-500">{event.is_premium ? 'Premium' : 'Reguler'}</p>
                           </div>
                        )
                      },
                      {
                        key: 'date',
                        label: 'Tanggal',
                        priority: 'high',
                        render: (event) => new Date(event.date).toLocaleDateString('id-ID')
                      },
                      {
                        key: 'status',
                        label: 'Status',
                        priority: 'medium',
                      render: (event) => (
                          <>{(() => {
                            const labelMap: Record<string, { label: string; cls: string }> = {
                              draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700' },
                              active: { label: 'Aktif', cls: 'bg-green-100 text-green-700' },
                              paused: { label: 'Dijeda', cls: 'bg-yellow-100 text-yellow-700' },
                              completed: { label: 'Selesai', cls: 'bg-gray-100 text-gray-700' },
                              cancelled: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
                              archived: { label: 'Diarsipkan', cls: 'bg-gray-100 text-gray-700' },
                            };
                            const conf = labelMap[event.status || 'draft'];
                            return (
                              <span className={`px-2 py-1 text-xs rounded-full ${conf.cls}`}>
                                {conf.label}
                              </span>
                            );
                          })()}</>
                        )
                      },
                      {
                        key: 'photo_count',
                        label: 'Foto',
                        priority: 'medium',
                        render: (event) => `${event.photo_count || 0} foto`
                      }
                    ]}
                    actions={(event) => (
                      <div className="flex flex-col gap-1">
                        {/* Primary Actions */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowQRCode(event)}
                            title="Show QR Code"
                          >
                            <QrCode className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEvent(event)}
                            title="Edit Event"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus event "${event.name}"? Semua foto dan pesan akan ikut terhapus.`)) {
                                deleteEventMutation.mutate(event.id);
                              }
                            }}
                            title="Delete Event"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Status Actions */}
                        <div className="flex gap-1">
                          {event.status !== 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, status: 'active' })}
                              title="Aktifkan Event"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {event.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                              onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, status: 'paused' })}
                              title="Jeda Event"
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          {(event.status === 'active' || event.status === 'paused') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, status: 'completed' })}
                              title="Selesaikan Event"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    emptyMessage="Belum ada event"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedPhotoTab} onValueChange={setSelectedPhotoTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="homepage" className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Homepage
                      </TabsTrigger>
                      <TabsTrigger value="slideshow" className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Slideshow
                      </TabsTrigger>
                      <TabsTrigger value="events" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Event
                      </TabsTrigger>
                    </TabsList>

                    {/* Homepage Photos */}
                    <TabsContent value="homepage" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Foto Galeri Homepage</h3>
                        <Button 
                          onClick={() => setIsHomepageUploadOpen(true)} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Foto
                        </Button>
                      </div>

                      {/* Upload Modal */}
                      {isHomepageUploadOpen && (
                        <Card className="mb-6 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Plus className="w-5 h-5 text-blue-600" />
                              Upload Foto Homepage
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="homepage-photo-input">Pilih Foto</Label>
                              <Input
                                id="homepage-photo-input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleHomepagePhotoUpload}
                                className="mt-1"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Ukuran maksimal 10MB per file.
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setIsHomepageUploadOpen(false)}
                                variant="outline"
                              >
                                Batal
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {uploadHomepagePhotoMutation.isPending && (
                        <div className="flex items-center justify-center py-4">
                          <LoadingSpinner />
                          <span className="ml-2 text-sm text-gray-600">Mengupload foto...</span>
                        </div>
                      )}
                        
                      {homepagePhotosLoading ? (
                        <div className="text-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : homepagePhotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {homepagePhotos.map((photo: any, index: number) => (
                            <div key={photo.id} className="relative group cursor-pointer"
                            onClick={() => {
                              setSelectedPhotoIndex(index);
                              setIsLightboxOpen(true);
                            }}>
                              <img
                                src={photo.url}
                                alt={photo.original_name}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Yakin ingin menghapus foto ini?')) {
                                      deletePhotoMutation.mutate(photo.id);
                                    }
                                  }}
                                >
                                  <Trash className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Belum ada foto di galeri homepage. Upload foto pertama Anda!</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Slideshow Photos Tab */}
                    <TabsContent value="slideshow" className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-semibold">Hero Slideshow</h3>
                        <p className="text-sm text-muted-foreground">Kelola foto untuk slideshow di homepage</p>
                      </div>

                      {/* Mobile-optimized slideshow manager */}
                      <div className="space-y-4">
                        {/* Slideshow photos grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {slideshowPhotosLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                            ))
                          ) : slideshowPhotos.length > 0 ? (
                            // Existing slideshow photos
                            slideshowPhotos.map((photo: any, index: number) => (
                              <div key={photo.id} className="relative group">
                                <img
                                  src={photo.url}
                                  alt={photo.original_name}
                                  className="w-full aspect-square object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeFromSlideshowMutation.mutate(photo.id)}
                                    disabled={removeFromSlideshowMutation.isPending}
                                  >
                                    <Trash className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  #{index + 1}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-8">
                              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm text-gray-500 mb-2">Belum ada foto slideshow</p>
                              <p className="text-xs text-gray-400">Pilih foto dari galeri homepage di bawah</p>
                            </div>
                          )}
                        </div>

                        {/* Available homepage photos to add to slideshow */}
                        {homepagePhotos.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-700">
                              Tambah ke Slideshow 
                              <span className="text-xs text-gray-500 ml-2">
                                ({homepagePhotos.length} homepage, {slideshowPhotos.length} slideshow)
                              </span>
                            </h4>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {homepagePhotos.map((photo: any) => {
                                const isInSlideshow = slideshowPhotos.some((sp: any) => sp.id === photo.id);
                                console.log('Photo mapping:', {
                                  photoId: photo.id,
                                  isInSlideshow,
                                  slideshowIds: slideshowPhotos.map((sp: any) => sp.id)
                                });
                                return (
                                  <div key={photo.id} className="relative">
                                    <img
                                      src={photo.url}
                                      alt={photo.original_name}
                                      className={`w-full aspect-square object-cover rounded cursor-pointer transition-opacity ${
                                        isInSlideshow ? 'opacity-50' : ''
                                      }`}
                                      onClick={() => {
                                        console.log('Photo clicked:', {
                                          photoId: photo.id,
                                          isInSlideshow,
                                          isPending: addToSlideshowMutation.isPending,
                                          canAdd: !isInSlideshow && !addToSlideshowMutation.isPending
                                        });
                                        
                                        if (!isInSlideshow && !addToSlideshowMutation.isPending) {
                                          console.log('Attempting to add photo to slideshow');
                                          addToSlideshowMutation.mutate(photo.id);
                                        } else {
                                          console.log('Cannot add photo:', {
                                            reason: isInSlideshow ? 'Already in slideshow' : 'Mutation pending'
                                          });
                                        }
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      {isInSlideshow ? (
                                        <div className="bg-green-500 text-white rounded-full p-1">
                                          <CheckCircle className="w-4 h-4" />
                                        </div>
                                      ) : (
                                        <div className="bg-blue-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity">
                                          <Plus className="w-4 h-4" />
                                        </div>
                                      )}
                                    </div>
                                    {addToSlideshowMutation.isPending && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Slideshow Settings */}
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Slideshow Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="interval" className="text-sm">Interval (ms)</Label>
                                <Input
                                  id="interval"
                                  type="number"
                                  value={slideshowSettings.interval}
                                  onChange={(e) => setSlideshowSettings(prev => ({ ...prev, interval: Number(e.target.value) }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="transition" className="text-sm">Transition</Label>
                                <select
                                  id="transition"
                                  value={slideshowSettings.transition}
                                  onChange={(e) => setSlideshowSettings(prev => ({ ...prev, transition: e.target.value }))}
                                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                >
                                  <option value="fade">Fade</option>
                                  <option value="slide">Slide</option>
                                </select>
                              </div>
                              <div>
                                <Label htmlFor="autoplay" className="text-sm">Autoplay</Label>
                                <select
                                  id="autoplay"
                                  value={slideshowSettings.autoplay.toString()}
                                  onChange={(e) => setSlideshowSettings(prev => ({ ...prev, autoplay: e.target.value === 'true' }))}
                                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              </div>
                              <div>
                                <Label htmlFor="loop" className="text-sm">Loop</Label>
                                <select
                                  id="loop"
                                  value={slideshowSettings.loop.toString()}
                                  onChange={(e) => setSlideshowSettings(prev => ({ ...prev, loop: e.target.value === 'true' }))}
                                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Event Photos */}
                    <TabsContent value="events" className="space-y-4"> 
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                        <h3 className="text-lg font-semibold">Foto Galeri Event</h3>
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                          <select
                            value={selectedEventForPhotos}
                            onChange={(e) => setSelectedEventForPhotos(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                          >
                            <option value="">Pilih Event</option>
                            {events.map((event: any) => (
                              <option key={event.id} value={event.id}>
                                {event.name}
                              </option>
                            ))}
                          </select>
                          {selectedEventForPhotos && (
                            <Button
                              onClick={() => setIsOfficialUploadOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Upload Official
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Official Photo Upload Modal */}
                      {isOfficialUploadOpen && selectedEventForPhotos && (
                        <Card className="mb-6 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Plus className="w-5 h-5 text-blue-600" />
                              Upload Foto Official
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="officialPhoto">Pilih Foto</Label>
                              <Input
                                id="officialPhoto"
                                type="file"
                                accept="image/*"
                                onChange={handleOfficialPhotoUpload}
                                className="mt-1"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Ukuran maksimal 10MB. Format: JPG, PNG, GIF
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setIsOfficialUploadOpen(false)}
                                variant="outline"
                              >
                                Batal
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {uploadOfficialPhotoMutation.isPending && (
                        <div className="flex items-center justify-center py-4">
                          <LoadingSpinner />
                          <span className="ml-2 text-sm text-gray-600">Mengupload foto official...</span>
                        </div>
                      )}

                      {selectedEventForPhotos ? (
                        eventPhotosLoading ? (
                          <div className="text-center py-8">
                            <LoadingSpinner />
                          </div>
                        ) : eventPhotos.length > 0 ? (
                          <div>
                            {/* Group photos by album */}
                            {["Official", "Tamu", "Bridesmaid"].map(albumName => { 
                              const albumPhotos = eventPhotos.filter((photo: any) => photo.album_name === albumName);
                              if (albumPhotos.length === 0) return null;
                              
                              return (
                                <div key={albumName} className="mb-8">
                                  <h4 className="text-md font-semibold mb-4 text-blue-600 flex items-center gap-2">
                                    Album {albumName} ({albumPhotos.length} foto)
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      {albumPhotos.map((photo: any, index: number) => (
                                      <div key={photo.id} className="relative group cursor-pointer"
                                      onClick={() => {
                                        setSelectedPhotoIndex(index);
                                        setIsLightboxOpen(true);
                                      }}>
                                        <img
                                          src={photo.url}
                                          alt={photo.original_name}
                                          className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center">
                                          <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/50 rounded px-1 py-0.5 truncate">
                                            {photo.uploader_name || 'Anonim'}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Belum ada foto di event ini.</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Pilih event untuk melihat foto-fotonya.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              {/* System Monitors */}
              <div className="space-y-4">
                <SystemMonitor />
                <DSLRMonitor />
                <BackupStatusMonitor />
                 <SmartNotificationManager events={events} />
              </div>
            </TabsContent>

            {/* Customization Tab */}
            <TabsContent value="customization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tema & Tampilan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pilih Tema Warna</p>
                        <p className="text-sm text-gray-500">Ubah skema warna website</p>
                      </div>
                      <ColorPaletteSwitcher />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        {/* Event Form Modal */}
        {isEventFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsEventFormOpen(false)} />
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <EventForm
                  editingEvent={editingEvent}
                  createdEvent={createdEvent}
                  isSaving={createEventMutation.isPending || updateEventMutation.isPending}
                  onSave={handleEventSubmit}
                  onCancel={() => {
                    setIsEventFormOpen(false);
                    setEditingEvent(null);
                    setCreatedEvent(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Lightbox */}
        {isLightboxOpen && selectedPhotoIndex !== null && (
          <PhotoLightbox
            photos={selectedPhotoTab === "homepage" ? homepagePhotos : eventPhotos}
            currentIndex={selectedPhotoIndex}
            onClose={() => setIsLightboxOpen(false)}
            onDelete={(photoId) => {
              if (confirm('Yakin ingin menghapus foto ini secara permanen?')) {
                deletePhotoMutation.mutate(photoId, {
                  onSuccess: () => {
                    setIsLightboxOpen(false); 
                  },
                });
              }
            }}
            onLike={(photoId) => {
              // Like functionality not implemented in admin panel
              console.log('Like photo:', photoId);
            }}
            onUnlike={(photoId) => {
              // Unlike functionality not implemented in admin panel
              console.log('Unlike photo:', photoId);
            }}
          />
        )}

        {/* QR Code Dialog */}
        <QRCodeDialog
          event={selectedEventForQR}
          isOpen={isQRDialogOpen}
          onClose={() => {
            setIsQRDialogOpen(false);
            setSelectedEventForQR(null);
          }}
        />
      </div>
    </ToastProvider>
  );
}
