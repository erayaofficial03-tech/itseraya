import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { FileDown } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import LoveItButton from "@/components/eraya/LoveItButton";
import ProductRow from "@/components/eraya/ProductRow";
import ShareMenu from "@/components/product/ShareMenu";
import {
  useProduct, useProducts, useSettings,
  formatINR, productImage, discountPct, withImageParams,
} from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { generateProductPdf } from "@/lib/pdf";

const ProductDetail = () => {
  const { productId } = useParams();
  const { data: product, isLoading } = useProduct(productId);
  const { data: settings } = useSettings();
  const { data: allProducts = [] } = useProducts();
  const [activeImg, setActiveImg] = useState(0);

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
  const related = allProducts
    .filter((p) => p.is_visible && p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 8);



  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={product.name}
        description={product.description || undefined}
        ogImage={images[0]}
      />
      <Header />
      <main className="pt-6 max-w-7xl mx-auto">
        <div className="px-6 mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              {product.categories && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/category/${product.categories.slug}`}>{product.categories.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-muted/30 mb-3">
              <img
                src={withImageParams(images[activeImg], 900, 85)}
                alt={product.name}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      i === activeImg ? "border-gold" : "border-transparent"
                    }`}
                  >
                    <img
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

          <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div>
              {product.categories?.name && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {product.categories.name}
                </p>
              )}
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">{product.name}</h1>
              <p className="text-[11px] font-mono tracking-[0.2em] text-muted-foreground mb-3">
                SKU · {product.sku}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-gold">{formatINR(price)}</span>
                {product.discounted_price && product.original_price > product.discounted_price && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {formatINR(product.original_price)}
                    </span>
                    <Badge style={{ background: "hsl(var(--gold))", color: "hsl(var(--charcoal))" }}>
                      {pct}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {s(settings, "product_tag_visible") && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Badge key={t} variant="outline" className="capitalize">{t}</Badge>
                ))}
              </div>
            )}

            {product.description && (
              <div className="border-t border-border pt-6">
                <h3 className="font-serif text-lg mb-2">{s(settings, "product_description_label")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <LoveItButton product={product} size="lg" className="w-full h-12 text-base" />
              <div className="grid grid-cols-2 gap-3">
                <ShareMenu
                  product={product}
                  settings={settings}
                  buttonLabel={s(settings, "product_share_button_label")}
                  className="h-11 w-full"
                />
                <Button variant="outline" onClick={() => generateProductPdf(product, settings)} className="h-11">
                  <FileDown /> {s(settings, "product_pdf_button_label")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <div className="mt-20">
            <ProductRow title={s(settings, "product_related_title")} products={related} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
