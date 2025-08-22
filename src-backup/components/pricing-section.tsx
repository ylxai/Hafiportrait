'use client';
// Updated pricing section with modern design

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, MessageCircle, Star, Crown, Clock, Users, Camera, Zap } from "lucide-react";
import { useState, useRef } from "react";
import WhatsAppContactModal from "@/components/ui/whatsapp-contact-modal";
import { PackageDetails } from "@/lib/whatsapp-integration";

export default function PricingSection() {
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(6); // Start with Wedding Ultimate
  
  // Touch/Swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const plans = [
    {
      name: "Paket Akad Nikah Basic",
      price: "IDR 1.300.000",
      originalPrice: "IDR 1.500.000",
      duration: "1 hari kerja",
      guests: "50-100 tamu",
      photos: "200+ foto digital",
      delivery: "3-5 hari kerja",
      features: [
        "1 fotografer profesional",
        "1 hari kerja (4-6 jam)",
        "40 cetak foto 5R (pilihan terbaik)",
        "Album magnetik (tempel)",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 16GB"
      ],
      badge: "💎 Hemat",
      color: "blue"
    },
    {
      name: "Paket Resepsi Standard",
      price: "IDR 1.800.000",
      originalPrice: "IDR 2.100.000",
      duration: "1 hari kerja",
      guests: "100-200 tamu", 
      photos: "300+ foto digital",
      delivery: "3-5 hari kerja",
      features: [
        "1 fotografer & 1 asisten fotografer",
        "1 hari kerja (6-8 jam)",
        "40 cetak foto 5R (pilihan terbaik)",
        "Album magnetik premium",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 32GB",
        "1 cetak besar 14R + frame"
      ],
      badge: "⭐ Populer",
      color: "green"
    },
    {
      name: "Paket Akad Nikah Premium",
      price: "IDR 2.000.000",
      originalPrice: "IDR 2.400.000",
      duration: "1 hari kerja",
      guests: "100-150 tamu",
      photos: "400+ foto digital", 
      delivery: "2-3 hari kerja",
      features: [
        "1 fotografer & 1 asisten fotografer",
        "1 hari kerja (6-8 jam)",
        "80 cetak foto 5R (pilihan terbaik)",
        "Album magnetik premium",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 32GB",
        "1 cetak besar 14R + frame"
      ],
      badge: "🔥 Trending",
      color: "orange"
    },
    {
      name: "Paket Resepsi Premium",
      price: "IDR 2.300.000",
      originalPrice: "IDR 2.800.000",
      duration: "1 hari kerja",
      guests: "150-250 tamu",
      photos: "500+ foto digital",
      delivery: "2-3 hari kerja", 
      features: [
        "1 fotografer & 1 asisten fotografer",
        "1 hari kerja (8-10 jam)",
        "80 cetak foto 5R (pilihan terbaik)",
        "Album magnetik premium",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 64GB",
        "1 cetak besar 14R + frame"
      ],
      badge: "💫 Recommended",
      color: "purple"
    },
    {
      name: "Paket Akad & Resepsi",
      price: "IDR 3.000.000",
      originalPrice: "IDR 3.600.000",
      duration: "2 hari kerja",
      guests: "200-300 tamu",
      photos: "800+ foto digital",
      delivery: "3-5 hari kerja",
      features: [
        "1 fotografer & 1 asisten fotografer",
        "2 hari kerja (akad + resepsi)",
        "80 cetak foto 5R (pilihan terbaik)",
        "Album magnetik premium",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 64GB",
        "1 cetak besar 14R + frame"
      ],
      badge: "💎 Value",
      color: "indigo"
    },
    {
      name: "Paket Wedding Deluxe",
      price: "IDR 4.000.000",
      originalPrice: "IDR 4.800.000",
      duration: "2 hari kerja",
      guests: "300-400 tamu",
      photos: "1000+ foto digital",
      delivery: "2-3 hari kerja",
      features: [
        "1 fotografer & 1 asisten fotografer",
        "2 hari kerja (akad + resepsi)",
        "80 cetak foto 5R (pilihan terbaik)",
        "Album magnetik premium",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 128GB",
        "1 Photo Box eksklusif",
        "Cetak besar 14R Jumbo + frame"
      ],
      badge: "👑 Luxury",
      color: "pink"
    },
    {
      name: "Paket Wedding Ultimate",
      price: "IDR 6.000.000",
      originalPrice: "IDR 7.500.000",
      duration: "2 hari kerja",
      guests: "400+ tamu",
      photos: "1500+ foto digital",
      delivery: "1-2 hari kerja",
      features: [
        "2 fotografer & 1 asisten fotografer",
        "2 hari kerja (akad + resepsi)",
        "120 cetak foto 5R (pilihan terbaik)",
        "Album hard cover magnetik premium",
        "File foto digital tanpa batas",
        "Softcopy di flashdisk 256GB",
        "1 cetak besar 16R Jumbo + frame"
      ],
      popular: true,
      badge: "🏆 Best Value",
      color: "gold"
    }
  ];

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.targetTouches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left - next plan
      setCurrentPlanIndex(currentPlanIndex === plans.length - 1 ? 0 : currentPlanIndex + 1);
    }
    if (isRightSwipe) {
      // Swipe right - previous plan
      setCurrentPlanIndex(currentPlanIndex === 0 ? plans.length - 1 : currentPlanIndex - 1);
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
    isDragging.current = false;
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentPlanIndex(currentPlanIndex === plans.length - 1 ? 0 : currentPlanIndex + 1);
    }
    if (isRightSwipe) {
      setCurrentPlanIndex(currentPlanIndex === 0 ? plans.length - 1 : currentPlanIndex - 1);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    isDragging.current = false;
  };

  const handleSelectPackage = (plan: any) => {
    const packageDetails: PackageDetails = {
      name: plan.name,
      price: plan.price,
      features: plan.features,
      duration: plan.duration,
      guests: plan.guests,
      photos: plan.photos,
      delivery: plan.delivery
    };
    
    setSelectedPackage(packageDetails);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="pricing" className="py-20 bg-dynamic-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dynamic-primary mb-4">
              Paket Harga Terbaik
            </h2>
            <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm font-medium px-4">
              <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-4 py-2 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Konsultasi gratis
              </span>
              <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-4 py-2 rounded-full flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                WhatsApp langsung
              </span>
              <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Harga transparan
              </span>
            </div>
          </div>
          
          {/* Pricing Slider Container */}
          <div 
            className="relative max-w-md mx-auto mt-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden rounded-2xl">
              <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentPlanIndex * 100}%)` }}>
                {plans.map((plan, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <Card 
                      className={`relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 mt-3 mx-4 ${
                        plan.popular 
                          ? 'border-dynamic-accent border-2 shadow-xl bg-gradient-to-br from-white to-blue-50' 
                          : 'border-dynamic hover:border-dynamic-accent/50 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50'
                      }`}
                    >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                  plan.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  plan.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  plan.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                  plan.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  plan.color === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                  plan.color === 'pink' ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                  plan.color === 'gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                  'bg-gradient-to-br from-gray-500 to-gray-600'
                }`} />

                {/* Badge */}
                <div className="absolute top-2 left-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                      : 'bg-white text-dynamic-accent border-2 border-dynamic-accent/20 shadow-md'
                  }`}>
                    {plan.badge}
                  </span>
                </div>


                <CardHeader className="text-center pb-4 pt-8 relative z-10">
                  <CardTitle className="text-xl font-bold text-dynamic-primary mb-3">
                    {plan.name}
                  </CardTitle>
                  
                  
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  {/* Modern Glassmorphism Price Box with Navigation */}
                  <div className="relative mb-6 p-6 bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl shadow-black/10">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                    
                    {/* Navigation Dots */}
                    <div className="flex justify-center mb-4 gap-2 relative z-10">
                      {plans.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPlanIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentPlanIndex 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-150 shadow-lg' 
                              : 'bg-white/50 hover:bg-white/70 hover:scale-125'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Price Content */}
                    <div className="text-center relative z-10">
                      <div className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                        {plan.price}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">/event</div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={() => setCurrentPlanIndex(currentPlanIndex === 0 ? plans.length - 1 : currentPlanIndex - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setCurrentPlanIndex(currentPlanIndex === plans.length - 1 ? 0 : currentPlanIndex + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Features List - Show all features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-dynamic-secondary leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* WhatsApp Button */}
                  <Button 
                    onClick={() => handleSelectPackage(plan)}
                    className={`w-full mobile-button text-sm font-bold py-4 transition-all duration-300 group-hover:scale-105 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-gray-700 text-white hover:bg-gray-800 shadow-md hover:shadow-lg border border-gray-600'
                    }`}
                    size="lg"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {plan.popular ? '🚀 Pilih Sekarang' : '💬 Chat WhatsApp'}
                  </Button>

                  {/* Trust Indicators */}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-1 text-xs text-dynamic-secondary">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>Respon dalam 5 menit</span>
                    </div>
                  </div>
                </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-lg md:text-xl font-bold text-dynamic-primary mb-4">
                Mengapa Memilih HafiPortrait?
              </h3>
              <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 md:mt-8">
                <div className="text-center">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <Camera className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <h4 className="text-xs md:text-base font-bold text-dynamic-primary mb-1 md:mb-2">Fotografer Berpengalaman</h4>
                  <p className="text-xs md:text-sm text-dynamic-secondary">Tim profesional dengan pengalaman 5+ tahun</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <Zap className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <h4 className="text-xs md:text-base font-bold text-dynamic-primary mb-1 md:mb-2">Editing Cepat</h4>
                  <p className="text-xs md:text-sm text-dynamic-secondary">Hasil foto siap dalam 1-5 hari kerja</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <Star className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <h4 className="text-xs md:text-base font-bold text-dynamic-primary mb-1 md:mb-2">Kualitas Terjamin</h4>
                  <p className="text-xs md:text-sm text-dynamic-secondary">100% kepuasan pelanggan atau uang kembali</p>
                </div>
              </div>
              
            </div>
          </div>

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