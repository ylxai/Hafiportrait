'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoHeader } from "@/components/ui/logo";
import { Camera, Menu, X, Phone, AtSign, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    // Handle scroll effect for mobile
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when breakpoint changes
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/5' 
        : 'bg-transparent'
    }`}>
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-500 ${
          isMobile ? (isScrolled ? 'h-14' : 'h-16') : 'h-20'
        }`}>
          {/* Enhanced Logo with Glow Effect */}
          <Link href="/" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <LogoHeader />
            </div>
          </Link>
          
          {/* Desktop Navigation - Modern Glassmorphism Style */}
          <nav className="hidden lg:flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-white/10 dark:bg-gray-900/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 dark:border-gray-700/20 shadow-xl">
              <Link 
                href="/" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  activeSection === 'home' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                onClick={() => setActiveSection('home')}
              >
                <span className="relative z-10">Beranda</span>
                {activeSection === 'home' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl animate-pulse"></div>
                )}
              </Link>
              
              <Link 
                href="/#gallery" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  activeSection === 'gallery' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                onClick={() => setActiveSection('gallery')}
              >
                <span className="relative z-10">Galeri</span>
                {activeSection === 'gallery' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl animate-pulse"></div>
                )}
              </Link>
              
              <Link 
                href="/#pricing" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  activeSection === 'pricing' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                onClick={() => setActiveSection('pricing')}
              >
                <span className="relative z-10">Harga</span>
                {activeSection === 'pricing' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl animate-pulse"></div>
                )}
              </Link>
              
              <Link 
                href="/#contact" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  activeSection === 'contact' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                onClick={() => setActiveSection('contact')}
              >
                <span className="relative z-10">Kontak</span>
                {activeSection === 'contact' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl animate-pulse"></div>
                )}
              </Link>
              
              <Link 
                href="/admin" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  activeSection === 'admin' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                onClick={() => setActiveSection('admin')}
              >
                <span className="relative z-10 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Admin
                </span>
                {activeSection === 'admin' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl animate-pulse"></div>
                )}
              </Link>
            </div>
          </nav>

          {/* Desktop Quick Contact Icons - Floating Style */}
          <div className="hidden lg:flex items-center space-x-3">
            <a 
              href="tel:+6281234567890" 
              className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-purple-600 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              aria-label="Telepon kami"
            >
              <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
            <a 
              href="mailto:info@hafiportrait.com" 
              className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-purple-600 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              aria-label="Email kami"
            >
              <AtSign className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
            <a 
              href="https://wa.me/6281234567890" 
              className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100/80 dark:bg-green-900/20 backdrop-blur-md border border-green-200/50 dark:border-green-700/30 text-green-600 dark:text-green-400 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              aria-label="WhatsApp kami"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
          </div>

          {/* Enhanced Mobile Menu Button - Glassmorphism */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`mobile-menu-button relative w-12 h-12 rounded-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 ${
                isMobileMenuOpen 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu - Glassmorphism */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 mobile-menu-container">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl p-6 space-y-4">
              {/* Main Navigation Links */}
              <div className="space-y-3">
                <Link 
                  href="/" 
                  className="mobile-menu-item group flex items-center px-4 py-4 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 touch-target font-medium text-base rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-4 text-2xl">🏠</span>
                  <span className="flex-1">Beranda</span>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link 
                  href="/#gallery" 
                  className="mobile-menu-item group flex items-center px-4 py-4 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 touch-target font-medium text-base rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-4 text-2xl">📸</span>
                  <span className="flex-1">Galeri</span>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link 
                  href="/#pricing" 
                  className="mobile-menu-item group flex items-center px-4 py-4 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 touch-target font-medium text-base rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-4 text-2xl">💰</span>
                  <span className="flex-1">Harga</span>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link 
                  href="/#contact" 
                  className="mobile-menu-item group flex items-center px-4 py-4 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 touch-target font-medium text-base rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-4 text-2xl">📞</span>
                  <span className="flex-1">Kontak</span>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link 
                  href="/admin" 
                  className="mobile-menu-item group flex items-center px-4 py-4 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 touch-target font-medium text-base rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-4 text-2xl">⚙️</span>
                  <span className="flex-1">Admin</span>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
              
              {/* Quick Contact Section */}
              <div className="border-t border-purple-200/50 dark:border-purple-800/50 pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Hubungi Kami
                  </h3>
                </div>
                
                {/* Quick Contact Icons for Mobile */}
                <div className="grid grid-cols-3 gap-3">
                  <a 
                    href="tel:+6281234567890" 
                    className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    aria-label="Telepon kami"
                  >
                    <Phone className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Telepon</span>
                  </a>
                  <a 
                    href="mailto:info@hafiportrait.com" 
                    className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    aria-label="Email kami"
                  >
                    <AtSign className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Email</span>
                  </a>
                  <a 
                    href="https://wa.me/6281234567890" 
                    className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200/50 dark:border-green-800/50 text-green-600 dark:text-green-400 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    aria-label="WhatsApp kami"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span className="text-xs font-medium">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
