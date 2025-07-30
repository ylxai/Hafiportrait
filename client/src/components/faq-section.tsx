import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "How quickly can I set up an event?",
    answer: "Creating an event takes under 10 seconds! Just enter your event name and date, and we'll automatically generate a QR code and shareable link. Your guests can start uploading photos immediately."
  },
  {
    question: "Do guests need to download an app?",
    answer: "No! Hafiportrait works directly in any web browser. Guests simply scan your QR code or click your link to access the album and start uploading photos immediately."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Free accounts get 100 photos, 1GB storage, and 30-day access. Premium offers unlimited photos, unlimited storage, advanced slideshow features, multiple albums, custom branding, and lifetime access for $19 per event."
  },
  {
    question: "Can I download all the original photos?",
    answer: "Yes! We preserve original resolution and EXIF data. Premium users can download all photos in a single ZIP file. Free users can download individual photos in original quality."
  },
  {
    question: "How does the slideshow feature work?",
    answer: "Our slideshow displays uploaded photos in real-time with beautiful fade transitions. You can control timing, enable fullscreen mode, and even sync music (Premium feature). Perfect for displaying during receptions or parties."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. All uploads are encrypted and stored securely. You control who can access your album with privacy settings. Only people with your unique link can view or upload to your event."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Hafiportrait
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex items-center justify-between focus:outline-none hover:bg-transparent"
                  >
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-rose-gold transition-transform" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-rose-gold transition-transform" />
                    )}
                  </Button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
  