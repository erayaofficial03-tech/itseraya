import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import JsonLd from "@/components/providers/JsonLd";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Most orders are dispatched within 2 business days and delivered within 4–7 business days across India.",
  },
  {
    q: "Do you offer returns or exchanges?",
    a: "Yes — we accept returns within 7 days of delivery on unused items in their original packaging. Custom pieces are non-returnable.",
  },
  {
    q: "How do I find my ring size?",
    a: "Visit our Care Guide for a quick at-home sizing method, or contact us on WhatsApp and we'll send you a printable size chart.",
  },
  {
    q: "What metals and stones do you use?",
    a: "We work with hallmarked 925 sterling silver, 18K & 22K gold, and certified natural and lab-grown diamonds. Stone details are listed on every product page.",
  },
  {
    q: "How do I care for my jewellery?",
    a: "Avoid contact with perfume, water and lotions. Store each piece separately in a soft pouch. See our Care Guide for cleaning tips.",
  },
  {
    q: "Is there a warranty?",
    a: "Every Eraya piece carries a 6-month warranty against manufacturing defects. Lifetime polishing service is available at our store.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "UPI, all major credit & debit cards, net banking, EMI, and Cash on Delivery for select pin codes.",
  },
  {
    q: "Do you make custom or bridal pieces?",
    a: "Absolutely. Reach out on WhatsApp with your inspiration — our design team typically delivers custom pieces in 3–5 weeks.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship worldwide via insured couriers. International orders may attract customs duties payable at delivery.",
  },
];

const Faq = () => (
  <div className="min-h-screen bg-background">
    <SeoHead title="FAQ — Eraya" description="Answers to common questions about Eraya jewellery, shipping, returns and care." />
    <JsonLd
      id="faq"
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
    <Header />
    <main className="max-w-3xl mx-auto px-5 md:px-6 py-10 pb-[76px]">
      <h1 className="font-serif text-3xl md:text-5xl text-foreground text-center">Frequently Asked</h1>
      <p className="text-sm text-muted-foreground text-center mt-2 mb-8">
        Everything you need to know before you buy.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`f-${i}`}>
            <AccordionTrigger className="text-left font-serif text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
    <Footer />
  </div>
);

export default Faq;
