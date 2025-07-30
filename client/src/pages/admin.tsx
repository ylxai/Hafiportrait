import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Camera, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Download,
  Trash2,
  Eye,
  Settings,
  Database,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { Event, Photo, Message } from "@shared/schema";

interface AdminStats {
  totalEvents: number;
  totalPhotos: number;
  totalMessages: number;
  activeEvents: number;
  storageUsed: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedEventForUpload, setSelectedEventForUpload] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("weddings");
  const [pricing, setPricing] = useState<any>({});
  const [pricingPDF, setPricingPDF] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication
  const handleLogin = () => {
    if (username === "admin" && password === "klp123") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome Admin",
        description: "Successfully logged into admin dashboard.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      return response.json() as Promise<AdminStats>;
    },
    enabled: isAuthenticated,
  });

  // Fetch all events for admin
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/admin/events'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/events");
      return response.json() as Promise<Event[]>;
    },
    enabled: isAuthenticated,
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/events/${eventId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Event Deleted",
        description: "Event and all associated data have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Official photo upload function - optimized untuk performance
  const handleOfficialPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!selectedEventForUpload) {
      toast({
        title: "Select Event",
        description: "Please select an event first.",
        variant: "destructive",
      });
      return;
    }

    let completed = 0;
    const totalFiles = files.length;

    // Process files in chunks untuk menghindari blocking
    const CHUNK_SIZE = 3;
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      
      const promises = chunk.map(async (file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive",
        });
          return false;
      }

      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('uploaderName', 'Admin');
        formData.append('albumName', 'Official');

        const response = await fetch(`/api/events/${selectedEventForUpload}/photos`, {
          method: 'POST',
          body: formData,
        });

          return response.ok;
      } catch (error) {
        console.error('Upload error:', error);
          return false;
        }
      });

      const results = await Promise.all(promises);
      completed += results.filter(Boolean).length;
      setUploadProgress((completed / totalFiles) * 100);
      
      // Give UI time to update antara chunks
      if (i + CHUNK_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (completed > 0) {
      toast({
        title: "Upload Complete",
        description: `${completed} official photos uploaded successfully.`,
      });
      loadRecentPhotos();
    }

    setTimeout(() => setUploadProgress(0), 2000);
  };

  // Load recent photos
  const loadRecentPhotos = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/recent-photos");
      const photos = await response.json();
      setRecentPhotos(photos);
    } catch (error) {
      console.error('Error loading recent photos:', error);
    }
  };

  // Delete photo function
  const deletePhoto = async (photoId: string) => {
    try {
      await apiRequest("DELETE", `/api/admin/photos/${photoId}`);
      toast({
        title: "Photo Deleted",
        description: "Photo has been removed successfully.",
      });
      loadRecentPhotos();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the photo.",
        variant: "destructive",
      });
    }
  };

  // Gallery photo upload
  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('category', selectedCategory);

        const response = await fetch('/api/admin/gallery', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast({
            title: "Upload Success",
            description: "Gallery photo uploaded successfully.",
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  // Load pricing data
  const loadPricing = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/pricing");
      const pricingData = await response.json();
      setPricing(pricingData);
    } catch (error) {
      console.error('Error loading pricing:', error);
    }
  };

  // Update pricing
  const savePricing = async () => {
    try {
      await apiRequest("POST", "/api/admin/pricing", pricing);
      toast({
        title: "Pricing Updated",
        description: "Pricing has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save pricing.",
        variant: "destructive",
      });
    }
  };

  // Upload pricing PDF
  const handlePricingPDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/admin/pricing/pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setPricingPDF(file);
        toast({
          title: "PDF Uploaded",
          description: "Pricing PDF has been uploaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload PDF.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-wedding-ivory flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-rose-gold mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
            />
            <Button 
                type="submit"
              className="w-full bg-rose-gold text-white hover:bg-deep-rose"
            >
              Login to Dashboard
            </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-ivory">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-rose-gold/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-rose-gold" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-3xl font-bold text-rose-gold">
                    {statsLoading ? <LoadingSpinner size="sm" /> : adminStats?.totalEvents || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-rose-gold/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Photos</p>
                  <p className="text-3xl font-bold text-rose-gold">
                    {statsLoading ? <LoadingSpinner size="sm" /> : adminStats?.totalPhotos || 0}
                  </p>
                </div>
                <Camera className="h-8 w-8 text-rose-gold/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-rose-gold">
                    {statsLoading ? <LoadingSpinner size="sm" /> : adminStats?.totalMessages || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-rose-gold/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-3xl font-bold text-rose-gold">
                    {statsLoading ? <LoadingSpinner size="sm" /> : adminStats?.storageUsed || "0 GB"}
                  </p>
                </div>
                <Database className="h-8 w-8 text-rose-gold/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Event Management</h2>
              <Button className="bg-rose-gold text-white hover:bg-deep-rose">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} • {event.id}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant={event.isPremium ? "default" : "outline"}>
                              {event.isPremium ? "Premium" : "Free"}
                            </Badge>
                            <Badge variant="outline">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/event/${event.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            disabled={deleteEventMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events found. Events created by users will appear here.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Photo Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Cleanup Storage
                </Button>
                <Button className="bg-rose-gold text-white hover:bg-deep-rose">
                  <Download className="h-4 w-4 mr-2" />
                  Backup Photos
                </Button>
              </div>
            </div>

            {/* Event Selection for Official Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Official Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Event</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => setSelectedEventForUpload(e.target.value)}
                    value={selectedEventForUpload}
                  >
                    <option value="">Choose an event for official photos</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} - {new Date(event.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEventForUpload && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-rose-gold border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-3 text-rose-gold" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Upload Official Photos</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, atau GIF (maks. 10MB per file)</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleOfficialPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-rose-gold h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {recentPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={photo.originalName}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deletePhoto(photo.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{photo.albumName}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent photo uploads.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Message Moderation</h2>
              <Button className="bg-rose-gold text-white hover:bg-deep-rose">
                <MessageSquare className="h-4 w-4 mr-2" />
                Review Flagged
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Message moderation interface - shows recent messages and moderation tools.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analytics & Reports</h2>
              <Button className="bg-rose-gold text-white hover:bg-deep-rose">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Usage analytics chart - events created over time, photo uploads, user engagement.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Event Duration</span>
                      <span className="font-semibold">4.2 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Photos per Event</span>
                      <span className="font-semibold">47 avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guest Participation</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Uptime</span>
                      <span className="font-semibold text-green-600">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gallery Management</h2>
              <Button 
                className="bg-rose-gold text-white hover:bg-deep-rose"
                onClick={() => document.querySelector<HTMLInputElement>('#gallery-upload')?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Add to Gallery
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Portfolio Photos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Category</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="weddings">Weddings</option>
                      <option value="engagement">Engagement</option>
                      <option value="prewedding">Pre-wedding</option>
                      <option value="family">Family</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-rose-gold border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-3 text-rose-gold" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Upload Portfolio Photos</span>
                        </p>
                        <p className="text-xs text-gray-500">High quality wedding photos for {selectedCategory}</p>
                      </div>
                      <input 
                        id="gallery-upload"
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleGalleryPhotoUpload}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gallery Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['weddings', 'engagement', 'prewedding', 'family'].map((category) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge>{galleryPhotos.filter(p => p.category === category).length} Photos</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {galleryPhotos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo.url || "https://images.unsplash.com/photo-1522673607200-164d1b6ce486"}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Pricing Management</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => document.querySelector<HTMLInputElement>('#add-package')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tambah Paket
                </Button>
                <Button 
                  className="bg-rose-gold text-white hover:bg-deep-rose"
                  onClick={savePricing}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Save All Changes
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-rose-gold" />
                    Wedding Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Paket Akad Nikah */}
                  <div className="p-6 border-2 border-gray-200 rounded-lg hover:border-rose-gold transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">Paket Akad Nikah</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500 text-white">PROMO</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nama Paket</label>
                        <Input 
                          placeholder="Paket Akad Nikah" 
                          value="Paket Akad Nikah"
                          onChange={(e) => setPricing({...pricing, akad: {...pricing.akad, name: e.target.value}})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Harga (IDR)</label>
                        <Input 
                          placeholder="1300000" 
                          value={pricing.akad?.price || "1300000"}
                          onChange={(e) => setPricing({...pricing, akad: {...pricing.akad, price: e.target.value}})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Badge</label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={pricing.akad?.badge || "PROMO"}
                          onChange={(e) => setPricing({...pricing, akad: {...pricing.akad, badge: e.target.value}})}
                        >
                          <option value="PROMO">PROMO</option>
                          <option value="POPULAR">POPULAR</option>
                          <option value="RECOMMENDED">RECOMMENDED</option>
                          <option value="LUXURY">LUXURY</option>
                          <option value="NEW">NEW</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Icon</label>
                        <Input 
                          placeholder="👰‍♀️💒 (emoji icon)" 
                          value={pricing.akad?.icon || "👰‍♀️💒"}
                          onChange={(e) => setPricing({...pricing, akad: {...pricing.akad, icon: e.target.value}})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Fitur (satu per baris)</label>
                        <textarea 
                          className="w-full p-3 border border-gray-300 rounded-md text-sm"
                          rows={6}
                          placeholder="1 fotografer&#10;1 hari kerja&#10;40 cetak foto 5R&#10;Album magnetik&#10;File foto tanpa batas"
                          value={pricing.akad?.features || "1 fotografer\n1 hari kerja\n40 cetak foto 5R (pilihan)\nAlbum magnetik (tempel)\nFile foto tanpa batas\nSoftcopy di flashdisk"}
                          onChange={(e) => setPricing({...pricing, akad: {...pricing.akad, features: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paket Premium */}
                  <div className="p-6 border-2 border-rose-gold rounded-lg bg-rose-gold/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">Paket Premium</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-rose-gold text-white">RECOMMENDED</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nama Paket</label>
                        <Input 
                          placeholder="Paket Premium" 
                          value="Paket Premium"
                          onChange={(e) => setPricing({...pricing, premium: {...pricing.premium, name: e.target.value}})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Harga (IDR)</label>
                        <Input 
                          placeholder="8000000" 
                          value={pricing.premium?.price || "8000000"}
                          onChange={(e) => setPricing({...pricing, premium: {...pricing.premium, price: e.target.value}})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Badge</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="RECOMMENDED" selected>RECOMMENDED</option>
                          <option value="POPULAR">POPULAR</option>
                          <option value="PROMO">PROMO</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Icon</label>
                        <Input placeholder="💍✨ (emoji icon)" value="💍✨" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Fitur (satu per baris)</label>
                        <textarea 
                          className="w-full p-3 border border-gray-300 rounded-md text-sm"
                          rows={6}
                          value={pricing.premium?.features || "2 fotografer\n8 jam liputan\n200 foto edit profesional\nAlbum premium 40 halaman\nUSB flashdisk custom\nOnline gallery selamanya\nVideo highlight 3-5 menit"}
                          onChange={(e) => setPricing({...pricing, premium: {...pricing.premium, features: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paket Platinum */}
                  <div className="p-6 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">Paket Platinum</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">LUXURY</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nama Paket</label>
                        <Input placeholder="Paket Platinum" value="Paket Platinum" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Harga (IDR)</label>
                        <Input 
                          placeholder="12000000" 
                          value={pricing.platinum?.price || "12000000"}
                          onChange={(e) => setPricing({...pricing, platinum: {...pricing.platinum, price: e.target.value}})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Badge</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="LUXURY" selected>LUXURY</option>
                          <option value="PREMIUM">PREMIUM</option>
                          <option value="EXCLUSIVE">EXCLUSIVE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Icon</label>
                        <Input placeholder="👑💎 (emoji icon)" value="👑💎" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Fitur (satu per baris)</label>
                        <textarea 
                          className="w-full p-3 border border-gray-300 rounded-md text-sm"
                          rows={6}
                          value={pricing.platinum?.features || "3 fotografer + videographer\nFull day coverage\nUnlimited foto edit\nAlbum premium leather\nCinematic wedding video\nDrone footage\nPre-wedding session\nSame day edit + highlight"}
                          onChange={(e) => setPricing({...pricing, platinum: {...pricing.platinum, features: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PDF Upload Section */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Pricing PDF</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-rose-gold border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Download className="w-8 h-8 mb-3 text-rose-gold" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Upload Pricing PDF</span>
                              </p>
                              <p className="text-xs text-gray-500">PDF file with detailed pricing</p>
                            </div>
                            <input 
                              type="file" 
                              accept=".pdf" 
                              className="hidden"
                              onChange={handlePricingPDFUpload}
                            />
                          </label>
                        </div>

                        {pricingPDF && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Download className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{pricingPDF.name}</span>
                              <Badge className="bg-green-600 text-white">Uploaded</Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Pre-wedding Session</span>
                      <Input className="w-32" placeholder="Price" defaultValue="2500000" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Engagement Session</span>
                      <Input className="w-32" placeholder="Price" defaultValue="1500000" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Extra Hour Coverage</span>
                      <Input className="w-32" placeholder="Price" defaultValue="500000" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Album Upgrade</span>
                      <Input className="w-32" placeholder="Price" defaultValue="800000" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Video Highlight</span>
                      <Input className="w-32" placeholder="Price" defaultValue="1200000" />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-rose-gold/10 rounded-lg">
                    <h5 className="font-semibold text-rose-gold mb-2">Pricing Notes</h5>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      rows={4}
                      placeholder="Additional notes about pricing..."
                      defaultValue="- Harga belum termasuk transport luar kota&#10;- DP 30% untuk booking&#10;- Pelunasan H-7 sebelum acara&#10;- Reschedule maksimal 2x"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">System Settings</h2>
              <Button className="bg-rose-gold text-white hover:bg-deep-rose">
                <Settings className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Files per Event</label>
                    <Input type="number" defaultValue="1000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Allowed File Types</label>
                    <Input defaultValue="jpg, jpeg, png, gif" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Run Database Cleanup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Check System Health
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export System Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}