import { useEffect } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HeroSlider from "@/components/eraya/HeroSlider";
import CategoryRow from "@/components/eraya/CategoryRow";
import ProductRow from "@/components/eraya/ProductRow";
import TrustStrip from "@/components/eraya/TrustStrip";
import EmotionalStrip from "@/components/eraya/EmotionalStrip";
import ErayaGirls from "@/components/eraya/ErayaGirls";
import SeoHead from "@/components/providers/SeoHead";
import ReviewsSection from "@/components/eraya/ReviewsSection";
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
    .slice(0, 12);
  const trending = visible.filter((p) => p.tags.includes("bestseller")).slice(0, 12);
  const onSale = visible
    .filter((p) => p.discounted_price && p.original_price > p.discounted_price)
    .slice(0, 12);
  const featured = visible.filter((p) => p.is_featured).slice(0, 12);

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
      <main className="pb-20 md:pb-0">
        <HeroSlider />
        <div className="section-divider" />
        <TrustStrip />
        <div className="section-divider" />
        <CategoryRow />
        <div className="section-divider" />
        {isLoading ? (
          <>
            <ProductRowSkeleton count={6} />
            <ProductRowSkeleton count={6} />
          </>
        ) : (
          <>
            {s(settings, "section_new_arrivals_visible") && (
              <>
                <ProductRow
                  eyebrow="Just in"
                  title={s(settings, "section_new_arrivals_title")}
                  products={newArrivals}
                  viewAllHref="/catalogue?filter=new"
                />
                <div className="section-divider" />
              </>
            )}
            {s(settings, "section_trending_visible") && (
              <>
                <ProductRow
                  eyebrow="Loved most"
                  title={s(settings, "section_trending_title")}
                  products={trending}
                  viewAllHref="/catalogue?filter=bestseller"
                />
                <div className="section-divider" />
              </>
            )}

            <EmotionalStrip text="Jewellery that feels like you." />
            <div className="section-divider" />

            {s(settings, "section_sale_visible") && (
              <>
                <ProductRow
                  eyebrow="Sweet steals"
                  title={s(settings, "section_sale_title")}
                  products={onSale}
                  viewAllHref="/catalogue?filter=sale"
                />
                <div className="section-divider" />
              </>
            )}
            {s(settings, "section_featured_visible") && (
              <>
                <ProductRow
                  eyebrow="Editor's pick"
                  title={s(settings, "section_featured_title")}
                  products={featured}
                  viewAllHref="/catalogue?filter=featured"
                />
                <div className="section-divider" />
              </>
            )}

            <ErayaGirls />
            <div className="section-divider" />
            <ReviewsSection />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;

