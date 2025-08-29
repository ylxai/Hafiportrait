'use client';

import { Button } from "@/components/ui/button";
import { Check, MessageCircle, Star, Crown, Clock, Camera, Heart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import WhatsAppContactModal from "@/components/ui/whatsapp-contact-modal";
import { PackageDetails } from "@/lib/whatsapp-integration";

type PricingPackage = {
  id: string;
  name: string;
  price: string;
  duration?: string;
  guests?: string;
  photos?: string;
  delivery?: string;
  features: string[];
  badge?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  tier?: 'basic' | 'standard' | 'premium' | 'luxury';
};

export default function ModernGlassmorphismPricing() {
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/pricing-packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      } else {
        // Fallback data untuk demo
        setPackages([
          {
            id: '1',
            name: 'Paket Akad Basic',
            price: 'IDR 1.300.000',
            duration: '4-6 jam',
            guests: '50-100 tamu',
            photos: '200+ foto',
            delivery: '3-5 hari',
            features: [
              '1 fotografer profesional',
              '40 cetak foto 5R premium',
              'Album magnetik eksklusif',
              'File digital tanpa batas',
              'Flashdisk 16GB branded',
              'Real-time sharing app'
            ],
            badge: '💎 Hemat',
            is_popular: false,
            is_active: true,
            sort_order: 1,
            tier: 'basic'
          },
          {
            id: '2',
            name: 'Paket Resepsi Standard',
            price: 'IDR 1.800.000',
            duration: '6-8 jam',
            guests: '100-200 tamu',
            photos: '300+ foto',
            delivery: '3-5 hari',
            features: [
              '1 fotografer + 1 asisten',
              '40 cetak foto 5R premium',
              'Album magnetik premium',
              'File digital tanpa batas',
              'Flashdisk 32GB branded',
              'Cetak besar 14R + frame',
              'Real-time sharing app',
              'Backup cloud storage'
            ],
            badge: '⭐ Populer',
            is_popular: true,
            is_active: true,
            sort_order: 2,
            tier: 'standard'
          },
          {
            id: '3',
            name: 'Paket Premium Complete',
            price: 'IDR 2.500.000',
            duration: '8-10 jam',
            guests: '200-300 tamu',
            photos: '500+ foto',
            delivery: '2-3 hari',
            features: [
              '2 fotografer profesional',
              '60 cetak foto 5R premium',
              'Album premium leather bound',
              'File digital tanpa batas',
              'Flashdisk 64GB branded',
              '2 cetak besar 14R + frame',
              'Video highlight 3-5 menit',
              'Real-time sharing app',
              'Priority editing & delivery'
            ],
            badge: '👑 Premium',
            is_popular: false,
            is_active: true,
            sort_order: 3,
            tier: 'premium'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPackage = (pkg: PricingPackage) => {
    const packageDetails: PackageDetails = {
      name: pkg.name,
      price: pkg.price,
      features: pkg.features,
      duration: pkg.duration,
      guests: pkg.guests,
      photos: pkg.photos,
      delivery: pkg.delivery
    };
    
    setSelectedPackage(packageDetails);
    setIsModalOpen(true);
  };

  const getTierGradient = (tier?: string, isPopular?: boolean) => {
    if (isPopular) return 'from-amber-500/20 via-orange-500/20 to-red-500/20';
    
    switch (tier) {
      case 'basic':
        return 'from-blue-500/20 via-cyan-500/20 to-teal-500/20';
      case 'standard':
        return 'from-purple-500/20 via-pink-500/20 to-rose-500/20';
      case 'premium':
        return 'from-amber-500/20 via-yellow-500/20 to-orange-500/20';
      case 'luxury':
        return 'from-violet-500/20 via-purple-500/20 to-indigo-500/20';
      default:
        return 'from-gray-500/20 via-slate-500/20 to-zinc-500/20';
    }
  };

  const getTierBorder = (tier?: string, isPopular?: boolean) => {
    if (isPopular) return 'border-amber-500/50';
    
    switch (tier) {
      case 'basic':
        return 'border-cyan-500/50';
      case 'standard':
        return 'border-pink-500/50';
      case 'premium':
        return 'border-orange-500/50';
      case 'luxury':
        return 'border-violet-500/50';
      default:
        return 'border-gray-500/50';
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
          <div className="absolute inset-0 opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-96 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-lg rounded-2xl border border-white/30"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 relative overflow-hidden">
        {/* Ultra Modern Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
          {/* Animated mesh gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
          
          {/* Advanced floating elements with better animations */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-2xl animate-ping"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
                 backgroundSize: '20px 20px'
               }}>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-6 pb-2">
              Paket Harga
            </h2>
            
            <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
              Pilih paket yang sesuai dengan kebutuhan event spesial Anda
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm max-w-lg mx-auto">
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Save The moments</span>
              </div>
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-gray-700">Save be Cost</span>
              </div>
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-700">Rating 4.9/5</span>
              </div>
            </div>
          </div>
          
          {packages.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-3xl p-8 max-w-md mx-auto">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">Paket harga sedang dalam pembaruan. Silakan hubungi kami untuk informasi terbaru.</p>
                <Button 
                  onClick={() => {
                    const fallbackPackage: PackageDetails = {
                      name: "Konsultasi Paket",
                      price: "Hubungi Kami",
                      features: ["Konsultasi gratis", "Paket custom sesuai kebutuhan", "Harga terbaik"]
                    };
                    setSelectedPackage(fallbackPackage);
                    setIsModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-full px-8 py-3"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Hubungi WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`group relative transition-all duration-500 hover:scale-[1.02] ${
                      pkg.is_popular ? 'lg:scale-105 z-10' : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(pkg.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Popular Badge - Fixed positioning */}
                    {pkg.is_popular && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 whitespace-nowrap">
                          <Crown className="w-4 h-4" />
                          TERPOPULER
                        </div>
                      </div>
                    )}

                    {/* Ultra Modern Glassmorphism Card */}
                    <div className={`
                      relative h-full bg-gradient-to-br ${getTierGradient(pkg.tier, pkg.is_popular)}
                      backdrop-blur-xl border-2 ${getTierBorder(pkg.tier, pkg.is_popular)}
                      rounded-3xl overflow-hidden transition-all duration-700 ease-out
                      ${hoveredCard === pkg.id 
                        ? 'shadow-2xl shadow-purple-500/30 border-purple-400/70 scale-[1.02] bg-white/30' 
                        : 'shadow-xl shadow-black/10 bg-white/20'
                      }
                      ${pkg.is_popular 
                        ? 'ring-2 ring-amber-400/70 shadow-2xl shadow-amber-500/25 bg-gradient-to-br from-amber-50/40 to-orange-50/40' 
                        : ''
                      }
                      min-h-[600px]
                    `}>
                      
                      {/* Ultra Modern Corner Badge */}
                      {pkg.badge && !pkg.is_popular && (
                        <div className="absolute top-4 right-4 z-20">
                          <span className="bg-gradient-to-r from-white/95 to-white/80 backdrop-blur-xl text-gray-800 px-4 py-2 rounded-2xl text-xs font-bold border border-white/70 shadow-xl hover:shadow-2xl transition-all duration-300">
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                        {/* Header */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                            {pkg.name}
                          </h3>
                          
                          <div className="mb-6">
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {pkg.price}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 font-medium">/event</div>
                          </div>

                          {/* Ultra Modern Quick Stats */}
                          {(pkg.duration || pkg.photos) && (
                            <div className={`grid gap-4 text-xs ${
                              pkg.duration && pkg.photos 
                                ? 'grid-cols-2' 
                                : 'grid-cols-1 max-w-[200px] mx-auto'
                            }`}>
                              {pkg.duration && (
                                <div className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                  <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                                  <div className="font-bold text-gray-800 text-center">{pkg.duration}</div>
                                </div>
                              )}
                              {pkg.photos && (
                                <div className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                  <Camera className="w-5 h-5 text-green-600 mx-auto mb-2" />
                                  <div className="font-bold text-gray-800 text-center">{pkg.photos}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Ultra Modern Features List */}
                        <div className="flex-1 mb-6">
                          <ul className="space-y-4">
                            {pkg.features.map((feature, i) => (
                              <li key={i} className="flex items-start text-sm group">
                                <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm rounded-full p-2 mr-3 mt-0.5 flex-shrink-0 border border-green-400/30 group-hover:scale-110 transition-transform duration-300">
                                  <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-gray-700 leading-relaxed font-medium group-hover:text-gray-900 transition-colors duration-300">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Ultra Modern CTA Button */}
                        <div className="mt-auto">
                          <Button 
                            onClick={() => handleSelectPackage(pkg)}
                            className={`
                              w-full py-4 rounded-2xl font-bold text-sm transition-all duration-500 shadow-xl relative overflow-hidden
                              ${pkg.is_popular 
                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white hover:shadow-2xl hover:shadow-amber-500/40 border-2 border-amber-400/50' 
                                : 'bg-gradient-to-r from-white/95 to-white/80 hover:from-white hover:to-white/95 text-gray-900 border-2 border-white/90 hover:border-white hover:shadow-2xl'
                              }
                              backdrop-blur-xl hover:scale-[1.03] active:scale-95 touch-button
                            `}
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {pkg.is_popular ? '🚀 Pilih Paket Terbaik' : '💬 Konsultasi Gratis'}
                          </Button>

                          {/* Ultra Modern Trust Indicator */}
                          <div className="mt-5 text-center">
                            <div className="bg-white/40 backdrop-blur-lg rounded-full px-4 py-2 border border-white/60 shadow-lg inline-flex items-center gap-2 text-xs text-gray-700">
                              <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
                              <span className="font-semibold">Respon dalam 5 menit</span>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <span className="font-semibold">Konsultasi gratis</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Contact Modal */}
      {selectedPackage && (
        <WhatsAppContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          packageDetails={selectedPackage}
        />
      )}
    </>
  );
}