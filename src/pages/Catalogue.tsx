import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useProducts, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { generateCatalogPdf } from "@/lib/pdf";

const Catalogue = () => {
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const visible = products.filter((p) => p.is_visible);
  const heading = s(settings, "catalogue_heading");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={heading} description={s(settings, "catalogue_subtext")} />
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">{s(settings, "catalogue_subtext")}</p>
          <Button
            size="lg"
            onClick={() => generateCatalogPdf(visible, settings)}
            className="text-charcoal"
            style={{ background: "var(--gradient-gold)" }}
          >
            <FileDown /> {s(settings, "catalogue_download_label")}
          </Button>
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
