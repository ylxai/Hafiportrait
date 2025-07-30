import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Heart, Sparkles, ArrowRight, Play, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";

const typingTexts = [
  "Wedding Photography",
  "Abadikan Momen Anda",
  "Professional Photographer"
];

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = typingTexts[currentIndex];

      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % typingTexts.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const scrollToGallery = () => {
    const element = document.getElementById('gallery');
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-wedding-ivory via-white to-rose-gold/10 flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,182,193,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-4 md:left-10 text-rose-gold/30 animate-bounce">
          <Heart className="h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8" />
        </div>
        <div className="absolute top-32 right-4 md:right-16 text-rose-gold/30 animate-pulse">
          <Camera className="h-3 w-3 md:h-5 md:w-5 lg:h-6 lg:w-6" />
        </div>
        <div className="absolute bottom-32 left-4 md:left-20 text-rose-gold/30 animate-bounce delay-300">
          <Sparkles className="h-4 w-4 md:h-6 md:w-6 lg:h-7 lg:w-7" />
        </div>
        <div className="absolute top-1/2 right-2 md:right-8 text-rose-gold/30 animate-pulse delay-700">
          <Star className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
        </div>
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-rose-gold/20 animate-ping">
          <Heart className="h-2 w-2 md:h-3 md:w-3" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center space-x-2 bg-rose-gold/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full animate-fade-in">
                  <Camera className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-rose-gold" />
                  <span className="text-rose-gold font-medium text-xs md:text-sm">HAFIPORTRAIT</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-gold to-deep-rose min-h-[1.5em] md:min-h-[1.2em]">
                    {currentText}
                    <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
                  </span>
                </h1>

                <p className="text-sm md:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 lg:px-0">
                  Mengabadikan setiap momen berharga pernikahan Anda dengan sentuhan artistik dan profesional. 
                  Ciptakan kenangan indah yang akan dikenang selamanya.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-2 lg:px-0">
                <Button 
                  size={isMobile ? "default" : "lg"} 
                  onClick={scrollToGallery}
                  className="bg-gradient-to-r from-rose-gold to-deep-rose text-white hover:shadow-xl hover:scale-105 transition-all duration-300 px-4 md:px-6 lg:px-8 py-3 md:py-4 text-sm md:text-base lg:text-lg"
                >
                  <Heart className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 mr-2" />
                  Lihat Portfolio
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 ml-2" />
                </Button>

                <Button 
                  size={isMobile ? "default" : "lg"} 
                  variant="outline" 
                  onClick={scrollToPricing}
                  className="border-2 border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white transition-all duration-300 px-4 md:px-6 lg:px-8 py-3 md:py-4 text-sm md:text-base lg:text-lg"
                >
                  <Camera className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 mr-2" />
                  Lihat Paket
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 lg:gap-8 pt-6 md:pt-8 border-t border-gray-200 mx-2 lg:mx-0">
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-rose-gold">100+</div>
                  <div className="text-xs md:text-sm text-gray-600">Happy Couples</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-rose-gold">500+</div>
                  <div className="text-xs md:text-sm text-gray-600">Events</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-rose-gold">5+</div>
                  <div className="text-xs md:text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>

            {/* Right Content - 3D Hero Image */}
            <div className="relative mt-8 lg:mt-0 px-4 lg:px-0 order-1 lg:order-2">
              <div className="relative group perspective-1000">
                {/* 3D Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-gold/20 to-deep-rose/20 rounded-2xl md:rounded-3xl transform rotate-3 md:rotate-6 scale-95 group-hover:rotate-12 group-hover:scale-98 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-l from-pink-300/10 to-rose-400/10 rounded-2xl md:rounded-3xl transform -rotate-2 md:-rotate-3 scale-98 group-hover:-rotate-6 group-hover:scale-100 transition-all duration-700"></div>
                
                <Card className="relative bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 z-10">
                  <CardContent className="p-0">
                    <div className="aspect-[4/5] bg-gradient-to-br from-rose-gold/10 via-pink-50 to-deep-rose/10 flex items-center justify-center relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `linear-gradient(45deg, rgba(255,182,193,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,182,193,0.1) 25%, transparent 25%)`,
                          backgroundSize: '20px 20px'
                        }}></div>
                      </div>
                      
                      <div className="text-center space-y-3 md:space-y-4 p-4 relative z-10">
                        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-rose-gold/30 to-deep-rose/30 rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                          <Camera className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-rose-gold" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Portfolio Preview</h3>
                          <p className="text-xs md:text-sm lg:text-base text-gray-600">Lihat hasil karya terbaik kami</p>
                          <Button 
                            variant="outline" 
                            size={isMobile ? "sm" : "default"}
                            onClick={scrollToGallery}
                            className="border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white text-xs md:text-sm lg:text-base transition-all duration-300 hover:scale-105"
                          >
                            <Play className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Lihat Gallery
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3D Floating Cards */}
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 lg:-top-6 lg:-right-6 bg-white rounded-xl md:rounded-2xl shadow-xl p-2 md:p-3 lg:p-4 animate-bounce transform hover:scale-110 transition-all duration-300 z-20">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Heart className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-red-500" />
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">Premium Quality</span>
                </div>
              </div>

              <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 lg:-bottom-6 lg:-left-6 bg-white rounded-xl md:rounded-2xl shadow-xl p-2 md:p-3 lg:p-4 animate-pulse transform hover:scale-110 transition-all duration-300 z-20">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-yellow-500" />
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">Fast Delivery</span>
                </div>
              </div>

              <div className="absolute top-1/2 -left-3 md:-left-4 lg:-left-6 bg-white rounded-lg md:rounded-xl shadow-lg p-2 md:p-3 animate-bounce delay-500 transform hover:scale-110 transition-all duration-300 z-20">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                  <span className="text-xs font-medium">5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for 3D effects */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  );
}