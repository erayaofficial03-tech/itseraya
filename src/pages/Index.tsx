import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HeroSlider from "@/components/eraya/HeroSlider";
import CategoryRow from "@/components/eraya/CategoryRow";
import ProductRow from "@/components/eraya/ProductRow";
import SeoHead from "@/components/providers/SeoHead";
import { useProducts, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { ProductGridSkeleton } from "@/components/ui/skeletons";

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: settings } = useSettings();
  const visible = products.filter((p) => p.is_visible);
  const newArrivals = visible.filter((p) => p.tags.includes("new"));
  const trending = visible.filter((p) => p.tags.includes("bestseller"));
  const onSale = visible.filter((p) => p.discounted_price && p.original_price > p.discounted_price);
  const featured = visible.filter((p) => p.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4 md:pt-6 pb-20 md:pb-0">
        <HeroSlider />
        <CategoryRow />
        {isLoading ? (
          <section className="w-full mb-16 px-6">
            <ProductGridSkeleton count={6} />
          </section>
        ) : (
          <>
            {s(settings, "section_new_arrivals_visible") && (
              <ProductRow
                title={s(settings, "section_new_arrivals_title")}
                products={newArrivals}
                viewAllHref="/catalogue?filter=new"
              />
            )}
            {s(settings, "section_trending_visible") && (
              <ProductRow
                title={s(settings, "section_trending_title")}
                products={trending}
                viewAllHref="/catalogue?filter=bestseller"
              />
            )}
            {s(settings, "section_sale_visible") && (
              <ProductRow
                title={s(settings, "section_sale_title")}
                products={onSale}
                viewAllHref="/catalogue?filter=sale"
              />
            )}
            {s(settings, "section_featured_visible") && (
              <ProductRow
                title={s(settings, "section_featured_title")}
                products={featured}
                viewAllHref="/catalogue?filter=featured"
              />
            )}
            {s(settings, "section_sale_visible") && (
              <ProductRow
                title={s(settings, "section_sale_title")}
                products={onSale}
                viewAllHref="/catalogue"
              />
            )}
            {s(settings, "section_featured_visible") && (
              <ProductRow
                title={s(settings, "section_featured_title")}
                products={featured}
                viewAllHref="/catalogue"
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
