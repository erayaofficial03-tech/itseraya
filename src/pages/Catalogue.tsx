import { useMemo, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import SeoHead from "@/components/providers/SeoHead";
import { useProducts, useSettings, useCategories } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const Catalogue = () => {
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const { data: categories = [] } = useCategories();
  const visible = products.filter((p) => p.is_visible);
  const visibleCategories = categories.filter((c) => c.is_visible);
  const heading = s(settings, "catalogue_heading");

  const [activeCat, setActiveCat] = useState<string>("all");
  const filtered = useMemo(() => {
    if (activeCat === "all") return visible;
    return visible.filter((p) => p.category_id === activeCat);
  }, [visible, activeCat]);

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
