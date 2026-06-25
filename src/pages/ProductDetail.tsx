import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEnquiryCartUI } from "@/components/EnquiryCartProvider";
import { useCartContext } from "@/components/providers/CartProvider";
import { openWhatsAppEnquiry } from "@/lib/whatsapp";
import { toast } from "sonner";
import StarRating from "@/components/eraya/StarRating";
import ReviewForm from "@/components/eraya/ReviewForm";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import JsonLd from "@/components/providers/JsonLd";
import Breadcrumb from "@/components/eraya/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductRow from "@/components/eraya/ProductRow";
import ShareMenu from "@/components/product/ShareMenu";
import ImageZoom from "@/components/product/ImageZoom";
import SafeImage from "@/components/ui/SafeImage";
import {
  useProductBySlug, useProducts, useSettings,
  formatINR, productImage, discountPct, withImageParams, productImageSrcSet,
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
  const { addToCart } = useCartContext();
  const { openCart } = useEnquiryCartUI();
  const { user, profile } = useAuth();
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const { data: productReviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product?.id, user?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      let query = supabase.from("reviews").select("*").eq("product_id", product!.id);
      if (user?.id) {
        // Approved & visible OR own review
        query = query.or(
          `and(is_approved.eq.true,is_hidden.eq.false),reviewer_user_id.eq.${user.id}`
        );
      } else {
        query = query.eq("is_approved", true).eq("is_hidden", false);
      }
      const { data } = await query.order("created_at", { ascending: false });
      return data || [];
    },
  });

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
  const handleAddToCart = () => {
    void addToCart(product);
    toast.success("Added to cart");
  };
  const handleEnquire = () => {
    if ((settings as any)?.enquiry_requires_login && !user) {
      toast.error("Please sign in to enquire");
      navigate("/login?redirect=" + window.location.pathname);
      return;
    }
    openWhatsAppEnquiry(product, settings);
  };
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
  const brandKeywords = s(settings, "seo_brand_keywords" as any);
  const autoGen = (settings as any)?.seo_auto_generate !== false;
  const seoTitle = autoGen
    ? `${product.name} — ${storeName} | Buy Online`
    : `${product.name} — ${storeName} | Artificial Jewellery`;
  const seoDesc = autoGen
    ? `Buy ${product.name} from ${storeName}. ${(product.description || "").slice(0, 120)} ${brandKeywords}`.trim()
    : (product.description
        ? product.description.slice(0, 160)
        : `Buy ${product.name} from ${storeName}. Premium artificial jewellery at ${formatINR(price)}. WhatsApp enquiry available.`);
  const keywords = [
    product.name,
    product.categories?.name,
    ...(product.tags || []),
    storeName,
    brandKeywords,
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
      <JsonLd
        id={`product-${product.id}`}
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || seoDesc,
          image: images.length ? images : undefined,
          sku: product.slug ?? product.id,
          brand: { "@type": "Brand", name: storeName },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/jewellery/${product.slug ?? ""}`,
            priceCurrency: "INR",
            price: String(price ?? 0),
            availability: "https://schema.org/InStock",
          },
        }}
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
            <div
              className="md:pt-0"
              style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0px)" }}
            >
              <div
                className="aspect-[4/5] w-full overflow-hidden rounded-b-2xl md:rounded-lg bg-ivory-warm mb-3 relative cursor-zoom-in"
                onClick={() => setIsZoomOpen(true)}
              >
                {(() => {
                  const ss = productImageSrcSet(images[activeImg]);
                  return (
                    <SafeImage
                      src={ss.md}
                      srcSet={ss.srcSet}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      alt={product.name}
                      loading="eager"
                      decoding="async"
                      width={800}
                      height={1000}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  );
                })()}
                {/* Mobile overlay buttons */}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  aria-label="Back"
                  className="md:hidden absolute left-3 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow"
                  style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
                >
                  <ArrowLeft className="h-5 w-5 text-charcoal" />
                </button>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 md:px-0 scrollbar-hide">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative flex-shrink-0 w-14 h-[70px] rounded overflow-hidden border-2 bg-ivory-warm ${
                      i === activeImg ? "border-gold" : "border-transparent"
                    }`}
                  >
                    <SafeImage
                      src={productImageSrcSet(url).thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
            <ImageZoom
              images={images}
              initialIndex={activeImg}
              isOpen={isZoomOpen}
              onClose={() => setIsZoomOpen(false)}
              alt={product.name}
            />
          </div>

          <div className="space-y-5 px-4 md:px-0 mt-4 md:mt-0 lg:sticky lg:top-24 lg:h-fit">
            <div>
              {product.categories?.name && (
                <span className="inline-block text-[11px] uppercase tracking-widest text-gold border border-gold rounded-full px-2.5 py-0.5 mb-3">
                  {product.categories.name}
                </span>
              )}
              <h1 className="font-serif text-[22px] md:text-4xl text-foreground mb-2">{product.name}</h1>
              {(() => {
                const visible = productReviews.filter((r: any) => !r.is_hidden && r.is_approved);
                if (visible.length === 0) return null;
                const avg = visible.reduce((a: number, r: any) => a + r.rating, 0) / visible.length;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("reviews");
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <StarRating rating={avg} size="sm" showCount={false} />
                    <span>
                      {avg.toFixed(1)} · {visible.length} review{visible.length > 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })()}
              <div className="flex items-center gap-3 flex-wrap mt-2">
                <span className="text-2xl font-bold text-[#C9A84C]">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {product.discounted_price && product.original_price > product.discounted_price && (
                  <>
                    <span
                      className="text-base text-[#9A8F85] line-through decoration-[#9A8F85]"
                      style={{ textDecorationThickness: "2px" }}
                    >
                      ₹{product.original_price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-semibold text-white bg-[#C9A84C] px-3 py-1 rounded-full">
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
              {/* Enquire Now (left) + Add to Cart (right) */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEnquire}
                  size="lg"
                  className="h-12 text-base border-gold text-charcoal hover:bg-gold/10"
                >
                  <MessageCircle className="mr-1 h-5 w-5 text-[#25D366]" />
                  Enquire Now
                </Button>
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  size="lg"
                  className="h-12 text-base bg-gold text-charcoal hover:bg-gold/90 font-medium"
                >
                  <ShoppingBag className="mr-1 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
              <ShareMenu
                product={product}
                settings={settings}
                buttonLabel={s(settings, "product_share_button_label")}
                className="h-11 w-full"
              />
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <div className="mt-14 md:mt-20">
            <ProductRow title={s(settings, "product_related_title")} products={related} />
          </div>
        )}

        {/* Reviews section */}
        <section className="mt-14 md:mt-20 px-4 md:px-6">
          <h2 className="font-serif text-2xl mb-4">Reviews</h2>
          {(() => {
            const visible = productReviews.filter((r: any) => !r.is_hidden && r.is_approved);
            const avg = visible.length
              ? visible.reduce((a: number, r: any) => a + r.rating, 0) / visible.length
              : 0;
            return visible.length > 0 ? (
              <div className="border-t border-[#EDE8E1] pt-6 flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#C9A84C]">{avg.toFixed(1)}</div>
                  <StarRating rating={avg} size="md" showCount={false} />
                  <div className="text-xs text-[#9A8F85] mt-1">{visible.length} reviews</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your thoughts.</p>
            );
          })()}

          <div className="space-y-4 mt-4">
            {productReviews.map((review: any) => (
              <div
                key={review.id}
                className={`p-4 rounded-2xl border ${
                  review.is_hidden
                    ? "border-[#F5D78E] bg-[#FFFBF0] opacity-60"
                    : "border-[#EDE8E1] bg-white"
                }`}
              >
                {review.is_hidden && (
                  <div className="text-xs text-[#9A8F85] mb-2 italic">
                    🙈 This review is hidden and only visible to you
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <StarRating rating={review.rating} size="sm" showCount={false} />
                    <p className="text-sm font-semibold mt-1">{review.customer_name}</p>
                    {review.customer_city && (
                      <p className="text-xs text-[#9A8F85]">{review.customer_city}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#9A8F85] flex-shrink-0">
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#2C2C2C] mt-2 leading-relaxed">{review.review_text}</p>
                {review.is_fake && (
                  <span className="text-[10px] text-[#9A8F85] mt-1 block">✓ Verified Customer</span>
                )}
              </div>
            ))}
          </div>

          {user ? (
            <ReviewForm
              productId={product.id}
              productName={product.name}
              userId={user.id}
              userProfile={profile}
              onSubmitted={() => refetchReviews()}
            />
          ) : (
            <div className="mt-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE8E1] text-center">
              <p className="text-sm text-[#9A8F85]">
                <Link to="/login" className="text-[#C9A84C] underline">
                  Sign in
                </Link>{" "}
                to write a review
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
