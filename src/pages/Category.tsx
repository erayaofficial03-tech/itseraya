import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import Breadcrumb from "@/components/eraya/Breadcrumb";
import ProductCard from "@/components/eraya/ProductCard";
import ProductListItem from "@/components/eraya/ProductListItem";
import ViewToggle, { useViewMode } from "@/components/eraya/ViewToggle";
import { useCategories, useProducts, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import {
  categoryListSchema, breadcrumbSchema, injectSchema, SITE_URL,
} from "@/lib/structuredData";

const Category = () => {
  const { category: slug } = useParams();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const cat = categories.find((c) => c.slug === slug);
  const filtered = products.filter(
    (p) => p.is_visible && (cat ? p.category_id === cat.id : true),
  );
  const [view, setView] = useViewMode();

  if (!catsLoading && slug && !cat) {
    return <Navigate to="/404" replace />;
  }

  useEffect(() => {
    if (!cat) return;
    injectSchema(
      "ld-itemlist",
      categoryListSchema(cat.name, filtered.map((p) => ({ name: p.name, slug: p.slug }))),
    );
    injectSchema(
      "ld-breadcrumb",
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: cat.name, url: `/collection/${cat.slug}` },
      ]),
    );
    return () => {
      injectSchema("ld-itemlist", null);
      injectSchema("ld-breadcrumb", null);
    };
  }, [cat, filtered]);

  const storeName = s(settings, "store_name");
  const brandKeywords = s(settings, "seo_brand_keywords" as any);
  const catName = cat?.name || "All Products";
  const seoTitle = cat
    ? `${catName} — ${storeName} | Artificial ${catName}`
    : `All Jewellery — ${storeName}`;
  const seoDesc = cat
    ? `Shop ${catName} from ${storeName}. Premium artificial ${catName.toLowerCase()} for every occasion. ${brandKeywords}`.trim()
    : `Browse all jewellery from ${storeName}. ${brandKeywords}`.trim();
  const keywords = cat
    ? `${catName}, buy ${catName} online, artificial ${catName}, ${storeName}, ${brandKeywords}`
    : brandKeywords || undefined;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        canonical={cat ? `${SITE_URL}/collection/${cat.slug}` : undefined}
        keywords={keywords}
      />
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-4 md:px-6 pb-[76px]">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: catName },
          ]}
        />
        <div className="text-center mb-6 md:mb-8 mt-4">
          <h1 className="font-serif text-3xl md:text-5xl text-foreground">
            {catName}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {filtered.length} {s(settings, "category_pieces_label")}
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <ViewToggle mode={view} onChange={setView} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">{s(settings, "category_empty_message")}</p>
            <Link to="/" className="text-gold underline">Back to home</Link>
          </div>
        ) : view === "list" ? (
          <div className="divide-y divide-border">
            {filtered.map((p) => <ProductListItem key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8 lg:gap-x-5 lg:gap-y-10">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Category;
