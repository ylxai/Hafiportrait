'use client';

import Header from "@/components/header";
import HeroSlideshow from "@/components/hero-slideshow";
import EventsSection from "@/components/events-section";
import GallerySection from "@/components/gallery-section";
import PricingSection from "@/components/pricing-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { ColorPaletteProvider } from "@/components/ui/color-palette-provider";
import { ColorPaletteSwitcher } from "@/components/ui/color-palette-switcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
} 