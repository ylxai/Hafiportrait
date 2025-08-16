'use client'; // Pastikan ini di baris pertama
import Link from "next/link";
import { motion, Easing } from "framer-motion"; // Impor motion dan Easing

export default function Footer() {
  // Definisikan easing sebagai variabel untuk konsistensi
  const easeOutCubicBezier: Easing = [0, 0, 0.58, 1];

  // Varian animasi untuk kontainer utama footer
  const footerContainerVariants = {
    hidden: { opacity: 0, y: 50 }, // Mulai dari bawah, transparan
    visible: {
      opacity: 1,
      y: 0, // Geser ke posisi akhir
      transition: {
        duration: 0.8,
        ease: easeOutCubicBezier,
        staggerChildren: 0.15, // Animasi anak-anak muncul berurutan
        delayChildren: 0.3, // Penundaan sebelum anak-anak mulai menganimasi
      },
    },
  };

  // Varian animasi untuk setiap item di dalam footer (logo, layanan, copyright)
  const footerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOutCubicBezier,
      },
    },
  };

  return (
    <footer className="bg-gray-900 text-white">
      <motion.div // Bungkus konten utama footer dengan motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative overflow-hidden"
        variants={footerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }} // Animasikan sekali saat 40% dari footer terlihat
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <motion.div variants={footerItemVariants} className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-extrabold text-wedding-gold mb-4 drop-shadow-md">
              Hafi Portrait
            </h3>
            <p className="text-gray-300 leading-relaxed max-w-lg mb-4">
              Platform berbagi foto terpercaya untuk event dan acara spesial Anda. 
              Abadikan setiap momen berharga bersama orang-orang terkasih.
            </p>
          </motion.div>
          
          {/* Services Links */}
          <motion.div variants={footerItemVariants}>
            <h4 className="text-xl font-bold mb-4 text-wedding-gold">Layanan</h4>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/#gallery" className="hover:text-wedding-gold transition-colors duration-300">Galeri</Link></li>
              <li><Link href="/#pricing" className="hover:text-wedding-gold transition-colors duration-300">Paket Harga</Link></li>
              <li><Link href="/#features" className="hover:text-wedding-gold transition-colors duration-300">Fitur</Link></li>
            </ul>
          </motion.div>
        </div>
        
        {/* Copyright */}
        <motion.div variants={footerItemVariants} className="border-t border-gray-700/50 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 HafiPortrait. Semua hak dilindungi.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
}