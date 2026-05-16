import { useEffect } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import HomepageSectionRenderer from "@/components/eraya/HomepageSectionRenderer";
import { useProducts, useSettings, useSocialLinks, useHomepageSections } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { ProductRowSkeleton } from "@/components/ui/skeletons";
import {
  organizationSchema, websiteSchema, injectSchema, SITE_URL,
} from "@/lib/structuredData";

const Index = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: settings } = useSettings();
  const { data: socials = [] } = useSocialLinks();
  const { data: sections = [], isLoading: sectionsLoading } = useHomepageSections();

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

  const visibleSections = sections.filter((sec) => sec.is_visible);
  const isLoading = productsLoading || sectionsLoading;

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
        {isLoading ? (
          <>
            <ProductRowSkeleton count={6} />
            <ProductRowSkeleton count={6} />
          </>
        ) : (
          visibleSections.map((section, idx) => {
            // Per-device visibility via Tailwind responsive classes
            const visibilityClass = [
              section.visible_mobile ? "" : "hidden md:block",
              section.visible_desktop ? "" : "md:hidden",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={section.id} className={visibilityClass || undefined}>
                <HomepageSectionRenderer section={section} products={products} />
                {idx < visibleSections.length - 1 && <div className="section-divider" />}
              </div>
            );
          })
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
