/**
 * JSON-LD structured data builders + injector.
 * Inject schemas with stable IDs so repeat renders replace the previous tag.
 */

const SITE = "https://itseraya.in";

type AnyProduct = {
  name: string;
  slug?: string | null;
  description?: string | null;
  original_price: number;
  discounted_price?: number | null;
  product_images?: { image_url: string }[];
  categories?: { name?: string | null; slug?: string | null } | null;
};

type AnySettings = {
  store_name?: string | null;
  logo_url?: string | null;
  seo_description?: string | null;
} | null | undefined;

export const productSchema = (p: AnyProduct, settings: AnySettings) => {
  const price = p.discounted_price ?? p.original_price;
  const images = (p.product_images || []).map((i) => i.image_url);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name} from ${settings?.store_name || "Eraya"}`,
    image: images.length ? images : undefined,
    brand: { "@type": "Brand", name: settings?.store_name || "Eraya" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: String(price),
      availability: "https://schema.org/InStock",
      url: p.slug ? `${SITE}/jewellery/${p.slug}` : undefined,
      seller: { "@type": "Organization", name: settings?.store_name || "Eraya" },
    },
    category: p.categories?.name || undefined,
  };
};

export const organizationSchema = (settings: AnySettings, socials: string[] = []) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: settings?.store_name || "Eraya",
  url: SITE,
  logo: settings?.logo_url || `${SITE}/eraya-logo.png`,
  description: settings?.seo_description || "Premium artificial jewellery for women",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: socials.length ? socials : undefined,
});

export const websiteSchema = (settings: AnySettings) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: settings?.store_name || "Eraya",
  url: SITE,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/catalogue?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

export const categoryListSchema = (
  categoryName: string,
  products: { name: string; slug: string | null }[],
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${categoryName} — Eraya`,
  itemListElement: products
    .filter((p) => p.slug)
    .map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${SITE}/jewellery/${p.slug}`,
    })),
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url.startsWith("http") ? it.url : `${SITE}${it.url}`,
  })),
});

export const injectSchema = (id: string, data: object | null) => {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

export const SITE_URL = SITE;
