import { useMemo, useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { useSearchParams, Link } from "react-router-dom";
import { Share2, MessageCircle, PackageSearch, ArrowLeft } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import ProductListItem from "@/components/eraya/ProductListItem";
import ViewToggle, { useViewMode } from "@/components/eraya/ViewToggle";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts, useSettings, useCategories } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsApp } from "@/lib/whatsapp";
import erayaLogo from "@/assets/eraya-logo.png";
import { toast } from "sonner";

const priceOf = (p: any) => (p.discounted_price ?? p.original_price) as number;

const Catalogue = () => {
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const { data: categories = [] } = useCategories();
  const [params, setParams] = useSearchParams();
  const filterParam = params.get("filter"); // new | bestseller | featured | sale
  const collectionParam = params.get("collection"); // bridal | daily | office | party
  const sortParam = (params.get("sort") || "newest") as "newest" | "price-asc" | "price-desc";
  const visible = products.filter((p) => p.is_visible);
  const visibleCategories = categories.filter((c) => c.is_visible);
  const heading =
    collectionParam === "bridal" ? "Bridal Collection"
    : collectionParam === "daily" ? "Daily Wear"
    : collectionParam === "office" ? "Office Wear"
    : collectionParam === "party" ? "Party Wear"
    : filterParam === "new" ? "New Arrivals"
    : filterParam === "bestseller" ? "Trending Now"
    : filterParam === "featured" ? "Hot Selling"
    : filterParam === "sale" ? "On Sale"
    : s(settings, "catalogue_heading");

  const [activeCat, setActiveCat] = useState<string>("all");
  const [view, setView] = useViewMode();

  const handleSortChange = (value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "newest") next.delete("sort");
    else next.set("sort", value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = visible;
    if (filterParam === "new") {
      list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 60);
    } else if (filterParam === "sale") {
      list = list.filter((p) => p.discounted_price && p.discounted_price < p.original_price);
    } else if (filterParam === "bestseller") {
      list = list.filter((p) => (p.tags || []).includes("bestseller"));
    } else if (filterParam === "featured") {
      list = list.filter((p) => p.is_featured);
    }
    if (collectionParam) {
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(collectionParam))
      );
    }
    if (activeCat !== "all") list = list.filter((p) => p.category_id === activeCat);

    if (sortParam === "price-asc") {
      list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sortParam === "price-desc") {
      list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    } else {
      list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list;
  }, [visible, activeCat, filterParam, collectionParam, sortParam]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={`Our Catalogue — ${s(settings, "store_name")} | All Jewellery Collections`} description={`Browse the complete ${s(settings, "store_name")} jewellery catalogue. Rings, earrings, necklaces, bangles, pendants and more. Artificial jewellery for every occasion.`} canonical="https://itseraya.in/catalogue" />
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-4 md:px-6 pb-[76px] md:pb-16"><PageTransition>
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-serif text-[28px] md:text-5xl text-foreground">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {s(settings, "catalogue_subtext")}
          </p>
        </div>

        {/* Share Collection */}
        <div className="mb-6 flex justify-center">
          <Button
            variant="outline"
            className="w-full md:w-auto border-gold text-gold hover:bg-gold/10"
            onClick={async () => {
              const url = window.location.href;
              const shareData = { title: `${settings?.store_name || "Eraya"} Collection`, url };
              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                  return;
                }
              } catch {
                /* user cancelled — silent */
                return;
              }
              try {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied!");
              } catch {
                toast.error("Could not copy link.");
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Collection
          </Button>
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

        <div className="flex items-center justify-between gap-3 mb-4">
          <Select value={sortParam} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <ViewToggle mode={view} onChange={setView} />
        </div>

        {filtered.length === 0 ? (
          (filterParam || collectionParam || activeCat !== "all") ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <PackageSearch className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-serif text-xl text-foreground mb-2">No products match this filter</p>
              <p className="text-sm text-muted-foreground mb-6">
                We couldn't find anything in <span className="font-medium text-foreground">{heading}</span> right now. Try browsing the full collection.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild className="bg-charcoal text-white hover:bg-charcoal/90">
                  <Link to="/catalogue">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Shop
                  </Link>
                </Button>
                {settings?.whatsapp_number && (
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() =>
                      openWhatsApp(
                        settings.whatsapp_number!.replace(/\D/g, ""),
                        `Hi Eraya! Do you have anything under "${heading}"?`,
                      )
                    }
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp us
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 max-w-sm mx-auto">
              <img src={erayaLogo} alt="Eraya Jewellery Logo" draggable={false} className="brand-logo h-10 mx-auto mb-5 object-contain opacity-90" />
              <p className="font-medium text-foreground mb-2">Our collection is coming soon</p>
              <p className="text-sm text-muted-foreground mb-6">
                Check back shortly for new arrivals.
              </p>
              {settings?.whatsapp_number && (
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                  onClick={() =>
                    openWhatsApp(
                      settings.whatsapp_number!.replace(/\D/g, ""),
                      "Hi Eraya! When will the new collection drop?",
                    )
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp us
                </Button>
              )}
            </div>
          )
        ) : view === "list" ? (
          <div className="divide-y divide-border">
            {filtered.map((p) => <ProductListItem key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </PageTransition></main>
      <Footer />
    </div>
  );
};

export default Catalogue;
