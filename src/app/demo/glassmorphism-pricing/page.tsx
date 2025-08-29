'use client';

import ModernGlassmorphismPricing from "@/components/modern-glassmorphism-pricing";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function GlassmorphismPricingDemo() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Glassmorphism Pricing Demo</h1>
                <p className="text-sm text-gray-600">Modern & Mobile-Friendly Design</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="gap-2"
              >
                <Palette className="w-4 h-4" />
                {showComparison ? 'Sembunyikan' : 'Bandingkan'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Features Banner */}
      <section className="py-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ✨ Fitur Glassmorphism Design
            </h2>
            <p className="text-gray-600">
              Desain modern dengan efek kaca transparan dan animasi yang smooth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl p-6 text-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Glassmorphism Effects</h3>
              <p className="text-sm text-gray-600">
                Efek kaca transparan dengan backdrop blur yang elegan
              </p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl p-6 text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile-First Design</h3>
              <p className="text-sm text-gray-600">
                Optimized untuk pengalaman mobile yang sempurna
              </p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl p-6 text-center">
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dynamic Colors</h3>
              <p className="text-sm text-gray-600">
                Gradient colors yang menyesuaikan dengan tier paket
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Component */}
      <ModernGlassmorphismPricing />

      {/* Technical Details */}
      <section className="py-16 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🛠️ Technical Implementation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Komponen ini dibangun dengan teknologi modern untuk performa optimal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🎨 CSS Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Backdrop-filter blur effects</li>
                <li>• CSS Grid responsive layout</li>
                <li>• Custom gradient animations</li>
                <li>• Smooth hover transitions</li>
              </ul>
            </div>
            
            <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">📱 Mobile Optimized</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Touch-friendly buttons (44px+)</li>
                <li>• Reduced motion support</li>
                <li>• Performance optimizations</li>
                <li>• Responsive breakpoints</li>
              </ul>
            </div>
            
            <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Performance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lazy loading animations</li>
                <li>• Optimized re-renders</li>
                <li>• Efficient state management</li>
                <li>• Minimal bundle impact</li>
              </ul>
            </div>
            
            <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">♿ Accessibility</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Keyboard navigation</li>
                <li>• Focus indicators</li>
                <li>• Screen reader support</li>
                <li>• Color contrast compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Guide */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📋 Cara Implementasi
            </h2>
            <p className="text-gray-600">
              Langkah-langkah untuk mengintegrasikan komponen ini ke sistem HafiPortrait
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Import CSS Styles</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Tambahkan file CSS glassmorphism ke layout utama:
                  </p>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                    import '@/styles/glassmorphism-pricing.css'
                  </code>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Replace Component</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Ganti komponen pricing lama dengan yang baru:
                  </p>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {'<ModernGlassmorphismPricing />'}
                  </code>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Test & Deploy</h3>
                  <p className="text-gray-600 text-sm">
                    Test responsivitas di berbagai device dan deploy ke production
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white/30 backdrop-blur-lg border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            Glassmorphism Pricing Component untuk HafiPortrait Photography
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Dibuat dengan ❤️ untuk pengalaman user yang lebih modern
          </p>
        </div>
      </footer>
    </div>
  );
}