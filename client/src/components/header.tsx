import { Camera, Menu, X, Phone, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const contactItems = [
    {
      icon: Phone,
      label: "+62 895 700503193",
      href: "tel:+6289570503193",
      className: "hover:text-green-600"
    },
    {
      icon: AtSign,
      label: "@hafiportrait",
      href: "https://instagram.com/hafiportrait",
      className: "hover:text-pink-600"
    }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm fixed w-full top-0 z-50 border-b border-rose-gold/20 shadow-sm">
      <div className="w-full px-4 py-3 md:py-4 max-w-7xl mx-auto">
        <nav className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6 md:h-8 md:w-8 text-rose-gold" />
            <h1 className="text-lg md:text-2xl font-playfair font-bold text-gray-800">Hafiportrait</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-gray-700 hover:text-rose-gold transition-colors font-medium"
            >
              Galeri
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-700 hover:text-rose-gold transition-colors font-medium"
            >
              Paket Harga
            </button>
            <button
              onClick={() => scrollToSection('events')}
              className="text-gray-700 hover:text-rose-gold transition-colors font-medium"
            >
              Event
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-rose-gold transition-colors font-medium"
            >
              Kontak
            </button>
          </div>

          {/* Desktop Contact Icons & Admin */}
          <div className="hidden lg:flex items-center space-x-4">
            {contactItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`flex items-center space-x-2 text-gray-600 transition-colors ${item.className}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-rose-gold ml-4"
              onClick={() => setLocation('/admin')}
            >
              Admin
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-rose-gold p-2 h-12 w-12 min-h-[48px] min-w-[48px] touch-manipulation active:scale-95 transition-transform"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white/98 backdrop-blur-sm z-50 overflow-hidden">
            <div className="flex flex-col items-center justify-start px-4 space-y-6 h-full pt-20 pb-8 overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 z-50 min-h-[48px] min-w-[48px] flex items-center justify-center bg-white/90 rounded-full border border-gray-200 shadow-lg touch-manipulation"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>

              {/* Navigation Links */}
              <div className="space-y-4 w-full max-w-sm mt-8">
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="w-full text-left py-4 px-4 text-gray-700 hover:text-rose-gold hover:bg-gray-50 rounded-lg transition-colors touch-manipulation text-lg font-medium"
                >
                  Galeri
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="w-full text-left py-4 px-4 text-gray-700 hover:text-rose-gold hover:bg-gray-50 rounded-lg transition-colors touch-manipulation text-lg font-medium"
                >
                  Paket Harga
                </button>
                <button
                  onClick={() => scrollToSection('events')}
                  className="w-full text-left py-4 px-4 text-gray-700 hover:text-rose-gold hover:bg-gray-50 rounded-lg transition-colors touch-manipulation text-lg font-medium"
                >
                  Event
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full text-left py-4 px-4 text-gray-700 hover:text-rose-gold hover:bg-gray-50 rounded-lg transition-colors touch-manipulation text-lg font-medium"
                >
                  Kontak
                </button>
              </div>

              {/* Mobile Contact Info */}
              <div className="space-y-4 pt-6 w-full max-w-sm">
                {contactItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`flex items-center py-3 px-4 text-gray-700 ${item.className} hover:bg-gray-50 rounded-lg transition-colors touch-manipulation`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
                <Button 
                  variant="outline"
                  className="w-full mt-4 border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white py-3 touch-manipulation"
                  onClick={() => {
                    setLocation('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Admin Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}