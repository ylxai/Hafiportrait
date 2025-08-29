'use client';

import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Static imports for simple components
import Header from "@/components/header";
import Footer from "@/components/footer";

// Dynamic imports for components with Context/framer-motion
const HeroSlideshow = dynamic(() => import("@/components/hero-slideshow"), {
  ssr: false,
  loading: () => <div className="h-[70vh] md:min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-pulse" />
});

const EventsSection = dynamic(() => import("@/components/events-section"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />
});

const GallerySection = dynamic(() => import("@/components/gallery-section"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

const PricingSection = dynamic(() => import("@/components/pricing-section-glassmorphism"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 animate-pulse" />
});

const ContactSection = dynamic(() => import("@/components/contact-section"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

const ColorPaletteProvider = dynamic(() => import("@/components/ui/color-palette-provider").then(mod => ({ default: mod.ColorPaletteProvider })), {
  ssr: false,
  loading: () => <div />
});

const ColorPaletteSwitcher = dynamic(() => import("@/components/ui/color-palette-switcher").then(mod => ({ default: mod.ColorPaletteSwitcher })), {
  ssr: false,
  loading: () => <div />
});

const queryClient = new QueryClient();

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorPaletteProvider>
        <div className="min-h-screen bg-dynamic-primary">
        {/* Floating Color Palette Switcher */}
        <ColorPaletteSwitcher variant="floating" />
        
        <Header />
        <main className="relative pt-20 lg:pt-24">
          <HeroSlideshow 
            className="h-[70vh] md:min-h-screen"
            autoplay={true}
            interval={6000}
            showControls={true}
          />
          <EventsSection />
          <GallerySection />  
          <PricingSection />
          <ContactSection />
        </main>
        <Footer />
        </div>
      </ColorPaletteProvider>
    </QueryClientProvider>
  );
} // CI/CD test - development hot reload Fri Aug 22 21:10:26 UTC 2025
// GitHub Actions test - dev workflow 21:15
