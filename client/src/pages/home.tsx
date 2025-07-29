
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import EventsSection from "@/components/events-section";
import FeaturesGrid from "@/components/features-grid";
import GallerySection from "@/components/gallery-section";
import PricingSection from "@/components/pricing-section";
import ContactSection from "@/components/contact-section";
//import TestimonialsSection from "@/components/testimonials-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-wedding-ivory">
      <Header />
      <main className="relative">
        <HeroSection />
        <EventsSection />
        <GallerySection />  
        <PricingSection />
        <FeaturesGrid />
        <ContactSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
