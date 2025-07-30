import { Heart, Camera, Phone, AtSign, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-rose-gold" />
              <span className="text-2xl font-bold text-rose-gold">HAFIPORTRAIT</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Mengabadikan momen berharga dengan sentuhan artistik dan profesional. 
              Ciptakan kenangan indah yang akan dikenang selamanya.
            </p>
            <div className="flex items-center space-x-4">
              <Heart className="h-5 w-5 text-rose-gold" />
              <span className="text-sm text-gray-400">Trusted by 100+ couples</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Layanan</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Wedding Photography</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Pre-Wedding Session</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Family Portrait</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Event Documentation</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Custom Package</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Galeri</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Paket Harga</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Event</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Tentang Kami</li>
              <li className="hover:text-rose-gold transition-colors cursor-pointer">Kontak</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Kontak</h3>
            <div className="space-y-3">
              <a 
                href="tel:+6289570050319" 
                className="flex items-center space-x-3 text-gray-400 hover:text-rose-gold transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+62 895 7005 03193</span>
              </a>

              <a 
                href="https://instagram.com/hafiportrait" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-400 hover:text-rose-gold transition-colors"
              >
                <AtSign className="h-5 w-5" />
                <span>Hafiportrait</span>
              </a>

              <a 
                href="mailto:info@hafiportrait.com" 
                className="flex items-center space-x-3 text-gray-400 hover:text-rose-gold transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>hafipotret@gmail.com</span>
              </a>

              <div className="flex items-start space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <span>Jl. Syekh M. Arsyad Al-Banjary, Kelampaian Tengah</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © 2024 HafiPortrait. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="hover:text-rose-gold transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-rose-gold transition-colors cursor-pointer">Terms of Service</span>
              <div className="flex items-center space-x-2">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>in Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}