import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useProducts, useSettings } from "@/lib/queries";
import { generateCatalogPdf } from "@/lib/pdf";

const Catalogue = () => {
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const visible = products.filter((p) => p.is_visible);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">Our Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Browse the full {settings?.store_name || "Eraya"} collection.
          </p>
          <Button
            size="lg"
            onClick={() => generateCatalogPdf(visible, settings)}
            className="text-charcoal"
            style={{ background: "var(--gradient-gold)" }}
          >
            <FileDown /> Download Full Catalogue as PDF
          </Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {visible.map((p) => <ProductCard key={p.id} product={p} showWhatsAppIcon />)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
