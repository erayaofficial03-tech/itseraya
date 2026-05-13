import { useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { FileDown, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { generateCatalogPdf } from "@/lib/pdf";

const Catalogue = () => {
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const visible = products.filter((p) => p.is_visible);
  const heading = s(settings, "catalogue_heading");

  const [pdfBusy, setPdfBusy] = useState(false);
  const [waBusy, setWaBusy] = useState(false);
  const busy = pdfBusy || waBusy;

  const downloadPdf = async () => {
    if (busy) return;
    setPdfBusy(true);
    const t = toast.loading("Generating catalogue PDF…");
    try {
      await generateCatalogPdf(visible, settings);
      toast.success("Catalogue PDF downloaded", { id: t });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't create catalogue", { id: t });
    } finally {
      setPdfBusy(false);
    }
  };

  const shareCatalogueOnWhatsApp = async () => {
    if (busy) return;
    setWaBusy(true);
    const t = toast.loading("Generating catalogue PDF…");
    try {
      await generateCatalogPdf(visible, settings);
      const wa = settings?.whatsapp_number?.replace(/\D/g, "") || "";
      const url = typeof window !== "undefined" ? window.location.href : "";
      const storeName = s(settings, "store_name") || "Eraya";
      const msg =
        `Hi! Here is the latest *${storeName}* catalogue.\n` +
        `Browse the full collection: ${url}\n\n` +
        `The catalogue PDF has been downloaded — please attach it from your files.`;
      const target = wa ? `https://wa.me/${wa}` : "https://wa.me/";
      window.open(`${target}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
      toast.success("PDF downloaded — open WhatsApp and attach the file to share it", { id: t });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't create catalogue", { id: t });
    } finally {
      setWaBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={heading} description={s(settings, "catalogue_subtext")} />
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">{s(settings, "catalogue_subtext")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={downloadPdf}
              disabled={busy}
              aria-busy={pdfBusy}
              className="text-charcoal"
              style={{ background: "var(--gradient-gold)" }}
            >
              {pdfBusy ? <Loader2 className="animate-spin" /> : <FileDown />}
              {pdfBusy ? "Generating…" : s(settings, "catalogue_download_label")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={shareCatalogueOnWhatsApp}
              disabled={busy}
              aria-busy={waBusy}
              className="border-gold text-charcoal hover:bg-gold/10"
            >
              {waBusy ? <Loader2 className="animate-spin" /> : <MessageCircle />}
              {waBusy ? "Generating…" : "Share Catalogue on WhatsApp"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-4 md:gap-x-5 md:gap-y-8 lg:gap-y-10">
          {visible.map((p) => <ProductCard key={p.id} product={p} showWhatsAppIcon />)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
