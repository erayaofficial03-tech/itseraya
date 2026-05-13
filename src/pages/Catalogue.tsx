import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Share2, MessageCircle } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { useProducts, useSettings, useCategories } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsApp } from "@/lib/whatsapp";
import erayaLogo from "@/assets/eraya-logo.png";
import { toast } from "sonner";

const Catalogue = () => {
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const { data: categories = [] } = useCategories();
  const [params] = useSearchParams();
  const filterParam = params.get("filter"); // new | bestsellers | sale
  const collectionParam = params.get("collection"); // bridal | daily | office | party
  const visible = products.filter((p) => p.is_visible);
  const visibleCategories = categories.filter((c) => c.is_visible);
  const heading =
    collectionParam === "bridal" ? "Bridal Collection"
    : collectionParam === "daily" ? "Daily Wear"
    : collectionParam === "office" ? "Office Wear"
    : collectionParam === "party" ? "Party Wear"
    : filterParam === "new" ? "New Arrivals"
    : filterParam === "bestsellers" ? "Bestsellers"
    : filterParam === "sale" ? "On Sale"
    : s(settings, "catalogue_heading");

  const [activeCat, setActiveCat] = useState<string>("all");
  const filtered = useMemo(() => {
    let list = visible;
    if (filterParam === "new") {
      list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 60);
    } else if (filterParam === "sale") {
      list = list.filter((p) => p.discounted_price && p.discounted_price < p.original_price);
    } else if (filterParam === "bestsellers") {
      list = list.filter((p) => p.is_featured);
    }
    if (collectionParam) {
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(collectionParam))
      );
    }
    if (activeCat !== "all") list = list.filter((p) => p.category_id === activeCat);
    return list;
  }, [visible, activeCat, filterParam, collectionParam]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={heading} description={s(settings, "catalogue_subtext")} />
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-16">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-serif text-[28px] md:text-5xl text-foreground">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {s(settings, "catalogue_subtext")}
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible md:justify-center">
          <button
            onClick={() => setActiveCat("all")}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
              activeCat === "all"
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-foreground border-border hover:border-gold"
            }`}
          >
            All
          </button>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeCat === c.id
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-foreground border-border hover:border-gold"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
