import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Heart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import Breadcrumb from "@/components/eraya/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoveItButton from "@/components/eraya/LoveItButton";
import ProductRow from "@/components/eraya/ProductRow";
import ShareMenu from "@/components/product/ShareMenu";
import SafeImage from "@/components/ui/SafeImage";
import {
  useProductBySlug, useProducts, useSettings,
  formatINR, productImage, discountPct, withImageParams,
} from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import {
  productSchema, breadcrumbSchema, injectSchema, SITE_URL,
} from "@/lib/structuredData";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: settings } = useSettings();
  const { data: allProducts = [] } = useProducts();
  const { data: wishlist = [] } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (product?.id) {
      void supabase.from("product_views").insert({ product_id: product.id });
    }
  }, [product?.id]);

  // Inject Product + Breadcrumb JSON-LD
  useEffect(() => {
    if (!product) return;
    injectSchema("ld-product", productSchema(product, settings));
    const crumbs: { name: string; url: string }[] = [{ name: "Home", url: "/" }];
    if (product.categories?.name && product.categories.slug) {
      crumbs.push({ name: product.categories.name, url: `/collection/${product.categories.slug}` });
    }
    crumbs.push({ name: product.name, url: `/jewellery/${product.slug ?? ""}` });
    injectSchema("ld-breadcrumb", breadcrumbSchema(crumbs));
    return () => {
      injectSchema("ld-product", null);
      injectSchema("ld-breadcrumb", null);
    };
  }, [product, settings]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p>Product not found.</p>
      <Link to="/" className="text-gold underline">Back home</Link>
    </div>
  );

  const images = product.product_images?.length
    ? product.product_images.map((i) => i.image_url)
    : [productImage(product)];
  const price = product.discounted_price ?? product.original_price;
  const pct = discountPct(product);
  const isSaved = wishlist.some((w) => w.product_id === product.id);
  const sameCategory = allProducts.filter(
    (p) => p.is_visible && p.id !== product.id && p.category_id === product.category_id
  );
  let related = sameCategory.slice(0, 8);
  if (related.length < 4) {
    const seen = new Set(related.map((p) => p.id));
    seen.add(product.id);
    const bestsellers = allProducts.filter(
      (p) => p.is_visible && !seen.has(p.id) && (p.tags || []).includes("bestseller")
    );
    related = [...related, ...bestsellers].slice(0, 8);
  }

  const storeName = s(settings, "store_name");
  const seoTitle = `${product.name} — ${storeName} | Artificial Jewellery`;
  const seoDesc = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} from ${storeName}. Premium artificial jewellery at ${formatINR(price)}. WhatsApp enquiry available.`;
  const keywords = [
    product.name,
    product.categories?.name,
    ...(product.tags || []),
    storeName,
    "artificial jewellery",
    "imitation jewellery",
    "fashion jewellery India",
    product.categories?.name ? `${product.categories.name} India` : null,
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        ogImage={images[0]}
        ogImageAlt={product.name}
        ogType="product"
        canonical={`${SITE_URL}/jewellery/${product.slug ?? ""}`}
        keywords={keywords}
      />
      {/* Hide header on mobile in favor of overlay back arrow */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main className="md:pt-6 max-w-7xl mx-auto pb-24 md:pb-16">
        <div className="hidden md:block px-6 mb-4">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              ...(product.categories?.slug
                ? [{ name: product.categories.name!, href: `/collection/${product.categories.slug}` }]
                : []),
              { name: product.name },
            ]}
          />
        </div>
        <section className="md:px-6 grid grid-cols-1 lg:grid-cols-2 md:gap-12">
          <div className="relative">
            <div className="aspect-square overflow-hidden md:rounded-lg bg-muted/30 mb-3 relative">
              <SafeImage
                src={withImageParams(images[activeImg], 900, 85)}
                alt={product.name}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
              {/* Mobile overlay buttons */}
              <button
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="md:hidden absolute top-3 left-3 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow"
              >
                <ArrowLeft className="h-5 w-5 text-charcoal" />
              </button>
              <button
                onClick={() => toggleWishlist.mutate({ productId: product.id, isSaved })}
                aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                disabled={toggleWishlist.isPending}
                className="md:hidden absolute top-3 right-3 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow"
              >
                <Heart className={`h-5 w-5 ${isSaved ? "fill-gold text-gold" : "text-charcoal"}`} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 md:px-0 scrollbar-hide">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                      i === activeImg ? "border-gold" : "border-transparent"
                    }`}
                  >
                    <SafeImage
                      src={withImageParams(url, 200, 70)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5 px-4 md:px-0 mt-4 md:mt-0 lg:sticky lg:top-24 lg:h-fit">
            <div>
              {product.categories?.name && (
                <span className="inline-block text-[11px] uppercase tracking-widest text-gold border border-gold rounded-full px-2.5 py-0.5 mb-3">
                  {product.categories.name}
                </span>
              )}
              <h1 className="font-serif text-[22px] md:text-4xl text-foreground mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-xl md:text-2xl font-semibold text-gold">{formatINR(price)}</span>
                {product.discounted_price && product.original_price > product.discounted_price && (
                  <>
                    <span className="text-sm md:text-base text-muted-foreground line-through">
                      {formatINR(product.original_price)}
                    </span>
                    <span className="text-[11px] bg-gold/10 text-gold rounded-full px-2 py-0.5 font-medium">
                      {pct}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {s(settings, "product_tag_visible") && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Badge key={t} variant="outline" className="capitalize">{t}</Badge>
                ))}
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="font-serif text-lg mb-2">{s(settings, "product_description_label")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="border-t border-border" />

            <div className="flex flex-col gap-3">
              <LoveItButton product={product} size="lg" className="w-full h-12 text-base" />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => toggleWishlist.mutate({ productId: product.id, isSaved })}
                  disabled={toggleWishlist.isPending}
                  className="h-11"
                >
                  <Heart className={`mr-1 h-4 w-4 ${isSaved ? "fill-gold text-gold" : ""}`} />
                  {isSaved ? "Saved" : "Wishlist"}
                </Button>
                <ShareMenu
                  product={product}
                  settings={settings}
                  buttonLabel={s(settings, "product_share_button_label")}
                  className="h-11 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <div className="mt-14 md:mt-20">
            <ProductRow title={s(settings, "product_related_title")} products={related} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
