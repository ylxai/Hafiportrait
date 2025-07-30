
import { Phone, AtSign, MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactSection() {
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
      icon: AtSign,
      title: "Instagram",
      content: "Hafiportrait",
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
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Hubungi Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Siap untuk mengabadikan momen spesial Anda? Mari diskusikan kebutuhan photography Anda dengan tim profesional kami
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
            
            {contactInfo.map((contact, index) => (
              <Card key={index} className={`border-0 shadow-lg ${contact.bgColor} ${contact.hoverColor} transition-all duration-300 hover:shadow-xl group`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-white shadow-md group-hover:scale-110 transition-transform`}>
                      <contact.icon className={`h-6 w-6 ${contact.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{contact.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{contact.description}</p>
                      <a
                        href={contact.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold ${contact.color} hover:underline text-lg`}
                      >
                        {contact.content}
                      </a>
                    </div>
                    <Button
                      size="sm"
                      className="bg-white text-gray-700 hover:bg-gray-50 shadow-md"
                      onClick={() => window.open(contact.href, '_blank')}
                    >
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Contact CTA */}
            <div className="bg-gradient-to-r from-rose-gold to-deep-rose rounded-2xl p-8 text-white text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h4 className="text-xl font-bold mb-2">Quick Consultation</h4>
              <p className="mb-6 opacity-90">
                Chat dengan kami sekarang untuk mendapatkan quote dan informasi paket photography
              </p>
              <Button
                size="lg"
                className="bg-white text-rose-gold hover:bg-gray-50 font-semibold"
                onClick={() => window.open('https://wa.me/6289570503193?text=Halo%20Hafiportrait,%20saya%20tertarik%20dengan%20layanan%20wedding%20photography%20Anda', '_blank')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Chat WhatsApp
              </Button>
            </div>
          </div>

          {/* Business Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="h-6 w-6 text-rose-gold mr-2" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{schedule.day}</span>
                    <span className="text-rose-gold font-semibold">{schedule.time}</span>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Emergency booking dan konsultasi weekend bisa diatur dengan appointment terlebih dahulu
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="h-6 w-6 text-rose-gold mr-2" />
                  Coverage Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Jabodetabek</span>
                    <span className="text-green-600 font-semibold">Free Travel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Jawa Barat</span>
                    <span className="text-blue-600 font-semibold">Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Luar Kota</span>
                    <span className="text-rose-gold font-semibold">By Request</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-rose-gold/10 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Kami melayani photography di seluruh Indonesia dengan biaya transport yang kompetitif
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-6 text-center">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-rose-gold">500+</p>
                    <p className="text-sm text-gray-600">Happy Couples</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-rose-gold">5</p>
                    <p className="text-sm text-gray-600">Years Experience</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-rose-gold">100%</p>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
