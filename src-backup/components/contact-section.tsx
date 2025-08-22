'use client';

import { Phone, Instagram, MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, Easing } from "framer-motion"; // Impor motion dan Easing

export default function ContactSection() {
  // Definisikan easing sebagai variabel untuk konsistensi dan tipe yang benar
  const easeOutCubicBezier: Easing = [0, 0, 0.58, 1];

  // Varian animasi untuk elemen utama
  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutCubicBezier } },
  };

  // Varian animasi untuk kartu-kartu (dengan stagger)
  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Animasi setiap kartu muncul berurutan
        delayChildren: 0.2, // Penundaan sebelum anak-anak mulai menganimasi
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 }, // Efek muncul dari bawah dan sedikit membesar
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: easeOutCubicBezier } },
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "WhatsApp",
      content: "+62 895 700503193",
      href: "https://wa.me/6289570503193",
      description: "Chat langsung untuk konsultasi",
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100"
    },
    {
      icon: Instagram,
      title: "Instagram",
      content: "@hafiportrait",
      href: "https://instagram.com/hafiportrait",
      description: "Lihat portfolio terbaru kami",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      hoverColor: "hover:bg-pink-100"
    },
    {
      icon: Mail,
      title: "Email",
      content: "hafiportrait@gmail.com",
      href: "mailto:hafiportrait@gmail.com",
      description: "Kirim detail acara Anda",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    }
  ];

  const workingHours = [
    { day: "Senin - Jumat", time: "09:00 - 18:00" },
    { day: "Sabtu", time: "09:00 - 15:00" },
    { day: "Minggu", time: "By Appointment" }
  ];

  return (
    <section id="contact" className="py-20 bg-wedding-ivory"> {/* Menggunakan warna tema */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Mengubah container menjadi max-w-7xl */}
        <div className="text-center mb-16">
          <motion.h2
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Hubungi Kami
          </motion.h2>
          <motion.p
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-sm text-gray-700 max-w-3xl mx-auto"
          >
            Siap untuk mengabadikan momen spesial Anda? Mari diskusikan kebutuhan photography Anda dengan tim profesional kami
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Contact Methods */}
          <motion.div
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            
            
            {contactInfo.map((contact, index) => (
              <motion.div variants={cardItemVariants} key={index}> {/* Terapkan varian ke setiap kartu */}
                <Card className={`border-0 shadow-lg ${contact.bgColor} ${contact.hoverColor} transition-all duration-300 hover:shadow-xl group`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full bg-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <contact.icon className={`h-6 w-6 ${contact.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg">{contact.title}</h4>
                        <p className="text-gray-700 text-sm mb-2">{contact.description}</p>
                        <a
                          href={contact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold ${contact.color} hover:underline text-sm sm:text-lg break-words`} 
                        >
                          {contact.content}
                        </a>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white text-gray-700 hover:bg-gray-50 shadow-md flex-shrink-0 mobile-button"
                        onClick={() => window.open(contact.href, '_blank')}
                      >
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Quick Contact CTA */}
            <motion.div variants={cardItemVariants}> {/* Terapkan varian */}
              <div className="bg-gradient-to-r from-wedding-gold to-wedding-rose rounded-2xl p-8 text-white text-center shadow-lg"> {/* Menggunakan warna tema */}
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h4 className="text-xl font-bold mb-2">Quick Consultation</h4>
                <p className="mb-6 opacity-90 text-wedding-ivory"> {/* Menyesuaikan warna teks */}
                  Chat dengan kami sekarang untuk mendapatkan quote dan informasi paket photography
                </p>
                <Button
                  size="lg"
                  className="bg-white text-wedding-gold hover:bg-gray-50 font-semibold mobile-button w-full sm:w-auto" 
                  onClick={() => window.open('https://wa.me/6289570503193?text=Halo%20Hafiportrait,%20saya%20tertarik%20dengan%20layanan%20wedding%20photography%20Anda', '_blank')}
                >
                  <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Chat WhatsApp
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Business Info */}
          <motion.div
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-6"
          >
            <motion.div variants={cardItemVariants}> {/* Terapkan varian */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900"> {/* Menyesuaikan warna teks */}
                    <Clock className="h-6 w-6 text-wedding-gold mr-2" /> {/* Menggunakan warna tema */}
                    Jam Operasional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-800">{schedule.day}</span> {/* Menyesuaikan warna teks */}
                      <span className="text-wedding-gold font-semibold">{schedule.time}</span> {/* Menggunakan warna tema */}
                    </div>
                  ))}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Emergency booking dan konsultasi weekend bisa diatur dengan appointment terlebih dahulu
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardItemVariants}> {/* Terapkan varian */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900"> {/* Menyesuaikan warna teks */}
                    <MapPin className="h-6 w-6 text-wedding-gold mr-2" /> {/* Menggunakan warna tema */}
                    Coverage Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Jabodetabek</span> {/* Menyesuaikan warna teks */}
                      <span className="text-green-600 font-semibold">Free Travel</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Kalimantan Selatan</span> {/* Menyesuaikan warna teks */}
                      <span className="text-blue-600 font-semibold">Available</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Luar Kalimantan</span> {/* Menyesuaikan warna teks */}
                      <span className="text-wedding-gold font-semibold">By Request</span> {/* Menggunakan warna tema */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={cardItemVariants}> {/* Terapkan varian */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-wedding-ivory/50 to-wedding-rose/10"> {/* Menggunakan warna tema */}
                <CardContent className="p-6 text-center">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-wedding-gold">500+</p> {/* Menggunakan warna tema */}
                      <p className="text-sm text-gray-700">Happy Couples</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-wedding-gold">5</p> {/* Menggunakan warna tema */}
                      <p className="text-sm text-gray-700">Years Experience</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-wedding-gold">100%</p> {/* Menggunakan warna tema */}
                      <p className="text-sm text-gray-700">Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
