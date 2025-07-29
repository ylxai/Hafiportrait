import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Camera, Star, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const pricingPackages = [
  {
    id: 1,
    name: "Paket Akad Nikah",
    price: "IDR 1.300.000",
    badge: "POPULER",
    icon: "💒",
    features: [
      "1 fotografer",
      "1 hari kerja", 
      "40 cetak foto 5R (pilihan)",
      "Album magnetik (tempel)",
      "File foto tanpa batas",
      "Softcopy di flashdisk"
    ]
  },
  {
    id: 2,
    name: "Paket Resepsi",
    price: "IDR 2.500.000",
    badge: "TERLENGKAP",
    icon: "🎉",
    features: [
      "2 fotografer",
      "1 hari kerja penuh",
      "100 cetak foto 5R",
      "Album premium leather",
      "File foto HD tanpa batas",
      "Video highlight 3-5 menit",
      "USB premium packaging"
    ]
  },
  {
    id: 3,
    name: "Paket Pre-Wedding",
    price: "IDR 1.800.000",
    badge: "ROMANTIS",
    icon: "💕",
    features: [
      "1 fotografer profesional",
      "2-3 jam sesi foto",
      "2 lokasi berbeda",
      "50 foto terbaik edited",
      "Album magnetik 20x30",
      "Softcopy high resolution",
      "Free konsultasi konsep"
    ]
  }
];

export default function PricingSection() {
  const isMobile = useIsMobile();

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-wedding-ivory to-rose-gold/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-rose-gold/10 px-4 py-2 rounded-full mb-4">
            <Heart className="h-5 w-5 text-rose-gold" />
            <span className="text-rose-gold font-medium text-center">PAKET HARGA</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Pilih Paket <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-gold to-deep-rose">Terbaik</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Setiap paket dirancang khusus untuk memberikan hasil terbaik sesuai kebutuhan momen spesial Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPackages.map((pkg, index) => (
            <Card 
              key={pkg.id} 
              className={`relative card-hover border-2 ${
                pkg.badge === "TERLENGKAP" 
                  ? "border-rose-gold bg-gradient-to-br from-white to-rose-gold/5 shadow-2xl scale-105" 
                  : "border-gray-200 bg-white shadow-lg"
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    className={`px-4 py-1 font-semibold ${
                      pkg.badge === "TERLENGKAP" 
                        ? "bg-gradient-to-r from-rose-gold to-deep-rose text-white" 
                        : pkg.badge === "POPULER"
                        ? "bg-green-500 text-white"
                        : "bg-pink-500 text-white"
                    }`}
                  >
                    {pkg.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-4">{pkg.icon}</div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {pkg.name}
                </CardTitle>
                <div className="text-3xl md:text-4xl font-bold text-rose-gold mb-4">
                  {pkg.price}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Button 
                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                      pkg.badge === "TERLENGKAP"
                        ? "bg-gradient-to-r from-rose-gold to-deep-rose text-white hover:shadow-xl hover:scale-105"
                        : "bg-white border-2 border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white"
                    }`}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Pilih Paket
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Butuh paket khusus? Hubungi kami untuk konsultasi gratis
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Konsultasi Custom Package
          </Button>
        </div>
      </div>
    </section>
  );
}