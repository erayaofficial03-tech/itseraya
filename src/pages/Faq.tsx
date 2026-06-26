import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import JsonLd from "@/components/providers/JsonLd";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFaqs, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const Faq = () => {
  const { data: settings } = useSettings();
  const { data: faqs = [], isLoading } = useFaqs();

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`FAQ — ${s(settings, "store_name")}`}
        description="Answers to common questions about Eraya jewellery, shipping, returns and care."
      />
      <JsonLd
        id="faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-5 md:px-6 py-10 pb-[76px]">
        <h1 className="font-serif text-3xl md:text-5xl text-foreground text-center">Frequently Asked</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 mb-8">
          Everything you need to know before you buy.
        </p>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && faqs.length === 0 && (
          <p className="text-muted-foreground text-center py-10">No FAQs yet.</p>
        )}

        {!isLoading && faqs.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left font-serif text-base">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Faq;
