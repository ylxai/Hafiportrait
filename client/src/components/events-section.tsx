
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Camera, MapPin, Clock, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useLocation } from "wouter";
import type { Event } from "@shared/schema";

export default function EventsSection() {
  const [, setLocation] = useLocation();

  // Fetch all events - temporarily disabled due to API route issue
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      // Temporarily return empty array until API route is fixed
      return [] as Event[];
      // const response = await apiRequest("GET", "/api/events");
      // return response.json() as Promise<Event[]>;
    },
  });

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  const pastEvents = events
    .filter(event => new Date(event.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <section id="events" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Event Photography
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Lihat dokumentasi pernikahan dan acara spesial yang telah kami abadikan dengan sempurna
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Calendar className="h-6 w-6 text-rose-gold mr-2" />
                    Upcoming Events
                  </h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {upcomingEvents.length} Event{upcomingEvents.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-rose-gold transition-colors">
                              {event.name}
                            </CardTitle>
                            <div className="flex items-center text-sm text-gray-600 mt-2">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(event.date)}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-0">
                            Upcoming
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Camera className="h-4 w-4 mr-1" />
                              {event.isPremium ? 'Premium' : 'Standard'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-gold hover:text-deep-rose hover:bg-rose-gold/10"
                            onClick={() => setLocation(`/event/${event.id}`)}
                          >
                            View
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events Portfolio */}
            {pastEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Camera className="h-6 w-6 text-rose-gold mr-2" />
                    Portfolio Events
                  </h3>
                  <Badge variant="outline" className="border-rose-gold text-rose-gold">
                    Recent Work
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group overflow-hidden">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-rose-gold/20 to-deep-rose/20 flex items-center justify-center">
                          <Camera className="h-16 w-16 text-rose-gold/60" />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <Button
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-all bg-white/90 text-rose-gold hover:bg-white"
                            onClick={() => setLocation(`/event/${event.id}`)}
                          >
                            View Gallery
                          </Button>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-rose-gold text-white border-0">
                          Completed
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-gray-800">
                          {event.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(event.date)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            Event Documentation
                          </div>
                          <span className="text-rose-gold font-semibold">
                            {event.isPremium ? 'Premium Package' : 'Standard Package'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Events State */}
            {events.length === 0 && (
              <div className="text-center py-16">
                <Camera className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-4">No Events Yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Event photography sessions will be displayed here once they are created by our admin team.
                </p>
                <Button
                  className="bg-rose-gold text-white hover:bg-deep-rose"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contact Us for Booking
                </Button>
              </div>
            )}

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-rose-gold/10 to-deep-rose/10 rounded-2xl p-8 md:p-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Ready to Book Your Special Day?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Hubungi kami sekarang untuk mendiskusikan paket photography yang sesuai dengan kebutuhan acara Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-rose-gold text-white hover:bg-deep-rose px-8 py-3"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white px-8 py-3"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Packages
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
