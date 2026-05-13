import { useEffect } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HeroSlider from "@/components/eraya/HeroSlider";
import CategoryRow from "@/components/eraya/CategoryRow";
import ProductRow from "@/components/eraya/ProductRow";
import SeoHead from "@/components/providers/SeoHead";
import { useProducts, useSettings, useSocialLinks } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { ProductRowSkeleton } from "@/components/ui/skeletons";
import {
  organizationSchema, websiteSchema, injectSchema, SITE_URL,
} from "@/lib/structuredData";

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: settings } = useSettings();
  const { data: socials = [] } = useSocialLinks();
  const visible = products.filter((p) => p.is_visible);
  const newArrivals = [...visible]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
  const trending = visible.filter((p) => p.tags.includes("bestseller")).slice(0, 10);
  const onSale = visible.filter((p) => p.discounted_price && p.original_price > p.discounted_price);
  const featured = visible.filter((p) => p.is_featured).slice(0, 10);

  useEffect(() => {
    const social = (socials || []).filter((l: any) => l.is_visible).map((l: any) => l.url);
    injectSchema("ld-organization", organizationSchema(settings, social));
    injectSchema("ld-website", websiteSchema(settings));
    return () => {
      injectSchema("ld-organization", null);
      injectSchema("ld-website", null);
    };
  }, [settings, socials]);

  const storeName = s(settings, "store_name");
  const tagline = s(settings, "tagline");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`${storeName} — ${tagline} | Artificial Jewellery for Women`}
        description={`${storeName} offers premium handcrafted artificial jewellery for women. Shop rings, earrings, necklaces, bangles and more. WhatsApp enquiries welcome.`}
        canonical={SITE_URL}
        keywords={`${storeName}, artificial jewellery, imitation jewellery, fashion jewellery India, jewellery for women, buy jewellery online, rings, earrings, necklaces, bangles`}
      />
      <Header />
      <main className="pt-4 md:pt-6 pb-20 md:pb-0">
        <HeroSlider />
        <CategoryRow />
        {isLoading ? (
          <>
            <ProductRowSkeleton count={6} />
            <ProductRowSkeleton count={6} />
          </>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
