import { Camera, Menu, X, Phone, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

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
      <div className="container mx-auto px-4 py-3 md:py-4">
        <nav className="flex items-center justify-between">
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
              className="text-rose-gold p-2 h-10 w-10"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white/98 backdrop-blur-sm z-40 top-16">
            <div className="flex flex-col items-center justify-start pt-8 px-4 space-y-6">
              {/* Navigation Links */}
              <div className="space-y-4 w-full max-w-sm">
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="block w-full text-center py-3 text-xl text-gray-700 hover:text-rose-gold transition-colors font-medium border-b border-gray-100"
                >
                  Galeri
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-center py-3 text-xl text-gray-700 hover:text-rose-gold transition-colors font-medium border-b border-gray-100"
                >
                  Paket Harga
                </button>
                <button
                  onClick={() => scrollToSection('events')}
                  className="block w-full text-center py-3 text-xl text-gray-700 hover:text-rose-gold transition-colors font-medium border-b border-gray-100"
                >
                  Event
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-center py-3 text-xl text-gray-700 hover:text-rose-gold transition-colors font-medium border-b border-gray-100"
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
                    className={`flex items-center justify-center space-x-3 text-gray-700 transition-colors py-2 w-full ${item.className}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-lg font-medium">{item.label}</span>
                  </a>
                ))}
                <Button 
                  variant="outline"
                  className="w-full mt-4 border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white"
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