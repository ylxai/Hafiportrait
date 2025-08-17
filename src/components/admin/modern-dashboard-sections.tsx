'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Camera, 
  MessageSquare, 
  TrendingUp,
  Users,
  Activity,
  Plus,
  Edit,
  QrCode,
  Trash,
  Play,
  Pause,
  CheckCircle,
  Image,
  Monitor,
  Settings
} from "lucide-react";
import { ResponsiveGrid, MobileCard } from "./responsive-grid";
import { MobileDataTable } from "./mobile-data-table";
import { QuickActionButtons } from "./quick-action-buttons";
import { SlideshowPanel } from "./slideshow-panel";
import StatsCards from "./StatsCards";
import { EventStatusSummary } from "./event-status-summary";
import { AutoStatusManager } from "./auto-status-manager";
import EventForm from "./EventForm";
import dynamic from 'next/dynamic';

// Dynamic imports
const SystemMonitor = dynamic(() => import("./system-monitor"), { ssr: false });
const DSLRMonitor = dynamic(() => import("./dslr-monitor"), { ssr: false });
const BackupStatusMonitor = dynamic(() => import("./backup-status-monitor").then(mod => ({ default: mod.BackupStatusMonitor })), { ssr: false });
const SmartNotificationManager = dynamic(() => import("./smart-notification-manager").then(mod => ({ default: mod.SmartNotificationManager })), { ssr: false });
const ColorPaletteSwitcher = dynamic(() => import("../ui/color-palette-switcher").then(mod => mod.ColorPaletteSwitcher), { ssr: false });

interface DashboardSectionProps {
  stats?: any;
  events?: any[];
  onCreateEvent?: () => void;
  onEditEvent?: (event: any) => void;
  onDeleteEvent?: (eventId: string) => void;
  onShowQRCode?: (event: any) => void;
  onUpdateEventStatus?: (eventId: string, status: string) => void;
}

// Dashboard Overview
export function DashboardSection({ stats, events = [] }: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang di Admin Dashboard</h1>
        <p className="text-blue-100">Kelola event dan galeri foto HafiPortrait Photography</p>
      </div>

      {/* Quick Stats */}
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
        <MobileCard
          title="Total Event"
          value={stats?.totalEvents || 0}
          icon={<Calendar className="h-5 w-5" />}
          subtitle="Event aktif & selesai"
          trend="+12%"
        />
        <MobileCard
          title="Total Foto"
          value={stats?.totalPhotos || 0}
          icon={<Camera className="h-5 w-5" />}
          subtitle="Semua galeri"
          trend="+8%"
        />
        <MobileCard
          title="Total Pesan"
          value={stats?.totalMessages || 0}
          icon={<MessageSquare className="h-5 w-5" />}
          subtitle="Dari pengunjung"
          trend="+15%"
        />
        <MobileCard
          title="Pengunjung"
          value="2.4K"
          icon={<Users className="h-5 w-5" />}
          subtitle="Bulan ini"
          trend="+23%"
        />
      </ResponsiveGrid>

      {/* Event Status Overview */}
      <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }}>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm text-green-700">Event Aktif</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-sm text-blue-700">Event Selesai</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter(e => e.status === 'draft').length}
            </div>
            <div className="text-sm text-yellow-700">Draft</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {events.filter(e => e.is_archived).length}
            </div>
            <div className="text-sm text-purple-700">Diarsip</div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <QuickActionButtons 
        onCreateEvent={() => {}}
        onUploadPhoto={() => {}}
        onViewAnalytics={() => {}}
        onSystemCheck={() => {}}
      />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Event Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'active' ? 'bg-green-500' : 
                    event.status === 'completed' ? 'bg-blue-500' : 
                    'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Events List Section
export function EventsListSection({ 
  events = [], 
  onCreateEvent,
  onEditEvent, 
  onDeleteEvent, 
  onShowQRCode, 
  onUpdateEventStatus 
}: DashboardSectionProps) {
  console.log('EventsListSection props:', { onCreateEvent, events: events.length });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Event</h1>
        <Button onClick={() => onCreateEvent?.()}>
          <Plus className="h-4 w-4 mr-2" />
          Event Baru
        </Button>
      </div>

      <StatsCards stats={{ totalEvents: events.length }} />
      <EventStatusSummary events={events} />
      <AutoStatusManager events={events} />

      <Card>
        <CardHeader>
          <CardTitle>Semua Event</CardTitle>
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
                render: (event) => {
                  const statusConfig = {
                    active: { label: 'Aktif', class: 'bg-green-100 text-green-700' },
                    completed: { label: 'Selesai', class: 'bg-blue-100 text-blue-700' },
                    draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700' },
                    paused: { label: 'Dijeda', class: 'bg-yellow-100 text-yellow-700' }
                  };
                  const config = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.draft;
                  return (
                    <span className={`px-2 py-1 text-xs rounded-full ${config.class}`}>
                      {config.label}
                    </span>
                  );
                }
              }
            ]}
            actions={(event) => (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onShowQRCode?.(event)}>
                  <QrCode className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEditEvent?.(event)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDeleteEvent?.(event.id)}>
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            )}
            emptyMessage="Belum ada event"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Media Sections
export function MediaHomepageSection({ 
  homepagePhotos = [], 
  isLoading = false, 
  onUpload, 
  onDelete,
  onPhotoClick 
}: {
  homepagePhotos?: any[];
  isLoading?: boolean;
  onUpload?: (files: FileList) => void;
  onDelete?: (photoId: string) => void;
  onPhotoClick?: (index: number) => void;
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onUpload) {
      onUpload(files);
      setIsUploadOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Galeri Homepage</h1>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Foto
        </Button>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <Card className="border-blue-200">
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
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ukuran maksimal 10MB per file. Format: JPG, PNG, GIF
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsUploadOpen(false)} variant="outline">
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Grid */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Memuat foto...</p>
            </div>
          ) : homepagePhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {homepagePhotos.map((photo: any, index: number) => (
                <div 
                  key={photo.id} 
                  className="relative group cursor-pointer"
                  onClick={() => onPhotoClick?.(index)}
                >
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
                          onDelete?.(photo.id);
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
        </CardContent>
      </Card>
    </div>
  );
}

export function MediaSlideshowSection({
  slideshowPhotos = [],
  homepagePhotos = [],
  isLoading = false,
  onAddToSlideshow,
  onRemoveFromSlideshow,
  isAddingToSlideshow = false,
  isPanelOpen = false,
  onPanelToggle
}: {
  slideshowPhotos?: any[];
  homepagePhotos?: any[];
  isLoading?: boolean;
  onAddToSlideshow?: (photoId: string) => void;
  onRemoveFromSlideshow?: (photoId: string) => void;
  isAddingToSlideshow?: boolean;
  isPanelOpen?: boolean;
  onPanelToggle?: (open: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hero Slideshow</h1>
          <p className="text-gray-600">Kelola foto untuk slideshow di homepage</p>
        </div>
        <Button 
          onClick={() => onPanelToggle?.(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Settings className="w-4 h-4 mr-2" />
          Kelola Slideshow
        </Button>
      </div>

      {/* Current Slideshow Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Slideshow Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : slideshowPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {slideshowPhotos.map((photo: any, index: number) => (
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
                      onClick={() => onRemoveFromSlideshow?.(photo.id)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm text-gray-500 mb-2">Belum ada foto slideshow</p>
              <p className="text-xs text-gray-400">Pilih foto dari galeri homepage di bawah</p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Tentang Hero Slideshow</h4>
              <p className="text-sm text-blue-700 mt-1">
                Foto-foto ini akan ditampilkan sebagai slideshow di halaman utama website. 
                Urutan foto akan sesuai dengan urutan yang ditampilkan di atas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide-out Panel */}
      <SlideshowPanel
        isOpen={isPanelOpen}
        onClose={() => onPanelToggle?.(false)}
        slideshowPhotos={slideshowPhotos}
        homepagePhotos={homepagePhotos}
        onAddToSlideshow={onAddToSlideshow}
        onRemoveFromSlideshow={onRemoveFromSlideshow}
        isAddingToSlideshow={isAddingToSlideshow}
      />
    </div>
  );
}

export function MediaEventsSection({
  events = [],
  eventPhotos = [],
  selectedEventForPhotos = "",
  isLoading = false,
  onEventSelect,
  onPhotoUpload,
  onPhotoClick
}: {
  events?: any[];
  eventPhotos?: any[];
  selectedEventForPhotos?: string;
  isLoading?: boolean;
  onEventSelect?: (eventId: string) => void;
  onPhotoUpload?: (file: File, albumName: string) => void;
  onPhotoClick?: (index: number) => void;
}) {
  const [selectedAlbum, setSelectedAlbum] = useState("Official");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB");
        return;
      }
      onPhotoUpload?.(file, selectedAlbum);
      setIsUploadOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Foto Event</h1>
          <p className="text-gray-600">Upload dan kelola foto untuk event tertentu</p>
        </div>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="event-select">Event</Label>
              <select
                id="event-select"
                value={selectedEventForPhotos}
                onChange={(e) => onEventSelect?.(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Pilih Event</option>
                {events.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedEventForPhotos && (
              <div className="flex gap-2">
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Foto
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {isUploadOpen && selectedEventForPhotos && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Upload Foto Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="album-select">Album</Label>
              <select
                id="album-select"
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1"
              >
                <option value="Official">Official</option>
                <option value="Tamu">Tamu</option>
                <option value="Bridesmaid">Bridesmaid</option>
              </select>
            </div>
            <div>
              <Label htmlFor="event-photo-input">Pilih Foto</Label>
              <Input
                id="event-photo-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ukuran maksimal 10MB. Format: JPG, PNG, GIF
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsUploadOpen(false)} variant="outline">
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Photos Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedEventForPhotos ? 
              `Foto Event: ${events.find(e => e.id === selectedEventForPhotos)?.name || 'Unknown'}` : 
              'Foto Event'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEventForPhotos ? (
            <div className="text-center py-12 text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Pilih event untuk melihat dan mengelola foto-fotonya</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Memuat foto...</p>
            </div>
          ) : eventPhotos.length > 0 ? (
            <div className="space-y-6">
              {["Official", "Tamu", "Bridesmaid"].map(albumName => {
                const albumPhotos = eventPhotos.filter((photo: any) => photo.album_name === albumName);
                if (albumPhotos.length === 0) return null;
                
                return (
                  <div key={albumName}>
                    <h4 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Album {albumName} ({albumPhotos.length} foto)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {albumPhotos.map((photo: any, index: number) => (
                        <div 
                          key={photo.id} 
                          className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                          onClick={() => onPhotoClick?.(index)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.original_name}
                            className="w-full aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all">
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                                {photo.uploader_name || 'Admin'}
                              </div>
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
              <p>Belum ada foto di event ini</p>
              <Button 
                onClick={() => setIsUploadOpen(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Foto Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// System Sections
export function SystemMonitorSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Monitor</h1>
      <SystemMonitor />
    </div>
  );
}

export function SystemDSLRSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">DSLR Monitor</h1>
      <DSLRMonitor />
    </div>
  );
}

export function SystemBackupSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Backup Status</h1>
      <BackupStatusMonitor />
    </div>
  );
}

export function SystemNotificationsSection({ events = [] }: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <SmartNotificationManager events={events} />
    </div>
  );
}

// Settings Sections
export function SettingsThemeSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tema & Tampilan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pilih Tema Warna</p>
              <p className="text-sm text-gray-500">Ubah skema warna website</p>
            </div>
            <ColorPaletteSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsProfileSection({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Lengkap</label>
              <p className="text-gray-600">{user?.full_name || 'Admin'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-gray-600">{user?.email || 'admin@hafiportrait.com'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EventsCreateSection({ 
  onCreateEvent,
  onEventSubmit,
  isCreating = false,
  onCancel
}: DashboardSectionProps & {
  onEventSubmit?: (eventData: any) => void;
  isCreating?: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buat Event Baru</h1>
          <p className="text-gray-600">Tambahkan event photography baru</p>
        </div>
        <Button 
          onClick={() => onCancel?.()}
          variant="outline"
        >
          Kembali ke Daftar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Event Baru</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <EventForm
            editingEvent={null}
            createdEvent={null}
            isSaving={isCreating}
            onSave={(eventData) => onEventSubmit?.(eventData)}
            onCancel={() => onCancel?.()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function EventsStatusSection({ events = [] }: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Status Manager</h1>
      <EventStatusSummary events={events} />
      <AutoStatusManager events={events} />
    </div>
  );
}