import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { deriveVariantUrls } from "./imageProcessing";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
};

export type ProductImage = { id: string; image_url: string; sort_order: number };

export type Product = {
  id: string;
  name: string;
  slug: string | null;
  category_id: string | null;
  description: string | null;
  original_price: number;
  discounted_price: number | null;
  tags: string[];
  sizes?: string[] | null;
  colours?: string[] | null;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  sku: string;
  product_images?: ProductImage[];
  categories?: { name: string; slug: string } | null;
};

export type Announcement = {
  id: string;
  title: string | null;
  message: string;
  cta_text: string | null;
  cta_url: string | null;
  bg_color: string | null;
  text_color: string | null;
  is_active: boolean;
  display_order: number;
  starts_at: string | null;
  expires_at: string | null;
  is_marquee: boolean;
};

export type Settings = {
  id: number;
  // Brand
  store_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  whatsapp_number: string | null;

  // Colors (hex)
  color_primary: string | null;
  color_background: string | null;
  color_text: string | null;
  color_accent: string | null;

  // Hero
  hero_image_url: string | null;
  hero_headline: string | null;
  hero_subtext: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  hero_overlay_opacity: number | null;

  // Homepage sections
  section_categories_title: string | null;
  section_categories_visible: boolean | null;
  section_new_arrivals_title: string | null;
  section_new_arrivals_visible: boolean | null;
  section_trending_title: string | null;
  section_trending_visible: boolean | null;
  section_sale_title: string | null;
  section_sale_visible: boolean | null;
  section_featured_title: string | null;
  section_featured_visible: boolean | null;

  // Navigation
  nav_home_label: string | null;
  nav_catalogue_label: string | null;
  nav_show_search: boolean | null;

  // Product page
  product_enquiry_button_label: string | null;
  product_share_button_label: string | null;
  product_pdf_button_label: string | null;
  product_description_label: string | null;
  product_related_title: string | null;
  product_tag_visible: boolean | null;

  // Catalogue / Category
  catalogue_heading: string | null;
  catalogue_subtext: string | null;
  catalogue_download_label: string | null;
  category_empty_message: string | null;
  category_pieces_label: string | null;

  // WhatsApp
  whatsapp_message_template: string | null;
  enquiry_button_color: string | null;

  // Footer
  footer_tagline: string | null;
  footer_copyright: string | null;
  footer_show_logo: boolean | null;
  footer_show_social: boolean | null;
  footer_show_whatsapp: boolean | null;
  footer_whatsapp_label: string | null;
  footer_links_visible: boolean | null;

  // Announcement bar

  // PDF
  pdf_store_name: string | null;
  pdf_tagline: string | null;
  pdf_footer_text: string | null;
  pdf_primary_color: string | null;

  // SEO
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_url: string | null;

  // Contact
  store_address: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_city: string | null;

  // PWA
  pwa_name: string | null;
  pwa_short_name: string | null;
  pwa_description: string | null;
  pwa_theme_color: string | null;
  pwa_background_color: string | null;

  // Install prompt
  install_prompt_visible: boolean | null;
  install_prompt_text: string | null;
  install_prompt_button_label: string | null;

  // Admin
  admin_panel_title: string | null;
  admin_welcome_message: string | null;
  admin_brand_color: string | null;

  // Enquiry mode: 'cart' (multi-product) or 'direct' (single product WhatsApp)
  enquiry_mode: string | null;

  // Theme engine
  active_theme_id: string | null;
  font_heading: string | null;
  font_body: string | null;
  font_heading_url: string | null;
  font_body_url: string | null;
  radius_base: number | null;
  container_max: number | null;
  section_spacing: number | null;
  font_size_base: number | null;

  // USP carousel (legacy, kept)
  usp_interval_ms: number;
  usp_fade_speed_ms: number;

  // Pricing & shipping
  pricing_sell_multiplier: number | null;
  pricing_mrp_multiplier: number | null;
  shipping_free_above: number | null;
  shipping_charge: number | null;
  // Legacy aliases (kept optional for backward compat)
  shipping_free_min_order?: number | null;
  shipping_flat_cost?: number | null;
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  is_visible: boolean;
  display_order: number;
};

const FIVE_MIN = 5 * 60 * 1000;

export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as Settings;
    },
  });

export type ThemePreset = {
  id: string;
  name: string;
  description: string | null;
  tokens: Record<string, string>;
  is_builtin: boolean;
  display_order: number;
};

export const useThemePresets = () =>
  useQuery({
    queryKey: ["theme_presets"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theme_presets" as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as unknown as ThemePreset[];
    },
  });

export type HomepageSectionType =
  | "hero_slider"
  | "trust_strip"
  | "category_row"
  | "product_row"
  | "emotional_strip"
  | "eraya_girls"
  | "reviews";

export type HomepageSection = {
  id: string;
  type: HomepageSectionType;
  display_order: number;
  is_visible: boolean;
  visible_mobile: boolean;
  visible_desktop: boolean;
  props: {
    eyebrow?: string;
    title?: string;
    text?: string;
    source?: "new" | "bestseller" | "sale" | "featured" | "all";
    view_all?: string;
    category_slug?: string;
    limit?: number;
  };
};

export const useHomepageSections = () =>
  useQuery({
    queryKey: ["homepage_sections"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections" as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as unknown as HomepageSection[];
    },
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Category[];
    },
  });

export type ProductLabel = {
  id: string;
  slug: string;
  name: string;
  tone: "ink" | "champagne" | "blush";
  display_order: number;
  is_active: boolean;
};

export const useProductLabels = (opts: { includeInactive?: boolean } = {}) =>
  useQuery({
    queryKey: ["product_labels", opts.includeInactive ? "all" : "active"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      let q = supabase.from("product_labels").select("*").order("display_order");
      if (!opts.includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ProductLabel[];
    },
  });

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Product[]).map((p) => ({
        ...p,
        product_images: (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
  });

export const useProduct = (id?: string) =>
  useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name, slug)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      const p = data as Product;
      return {
        ...p,
        product_images: (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order),
      };
    },
  });

export const useProductBySlug = (slug?: string) =>
  useQuery({
    queryKey: ["product-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name, slug)")
        .eq("slug", slug!)
        .eq("is_visible", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = data as Product;
      return {
        ...p,
        product_images: (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order),
      };
    },
  });

export const useAnnouncements = () =>
  useQuery({
    queryKey: ["announcements"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      const now = Date.now();
      return (data as Announcement[]).filter((a) => {
        if (a.starts_at && new Date(a.starts_at).getTime() > now) return false;
        if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
        return true;
      });
    },
  });

export const useSocialLinks = () =>
  useQuery({
    queryKey: ["social_links"],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as SocialLink[];
    },
  });

/**
 * Prefetch helpers — call on hover/focus to warm the cache.
 */
import type { QueryClient } from "@tanstack/react-query";

export const prefetchCategory = (qc: QueryClient, slug: string) =>
  qc.prefetchQuery({
    queryKey: ["category-products", slug],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

export const prefetchProduct = (qc: QueryClient, id: string) =>
  qc.prefetchQuery({
    queryKey: ["product", id],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name, slug)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Product;
    },
  });

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const productImage = (p: Product) =>
  p.product_images?.[0]?.image_url ||
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80";

/**
 * Append width/quality params to Supabase Storage image URLs for cheaper
 * downloads. No-op for non-Supabase URLs (e.g. Unsplash fallbacks).
 *
 * Kept for backward compatibility — new product surfaces should prefer
 * `productImageSrcSet` which serves the correct pre-rendered 4:5 variant.
 */
export const withImageParams = (url: string, width: number, quality = 80) => {
  if (!url || !url.includes("/storage/v1/object/")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${width}&quality=${quality}`;
};

/**
 * Build a responsive srcset for a product image URL produced by the
 * upload pipeline (thumb 300w / md 800w / full 1600w WEBP variants).
 * For legacy URLs that lack pipeline variants, the same URL is reused
 * across descriptors so the browser still has a valid srcset.
 */
export const productImageSrcSet = (url: string) => {
  if (!url) return { src: url, srcSet: "", thumb: url, md: url, full: url };
  const v = deriveVariantUrls(url);
  return {
    src: v.md,
    srcSet: `${v.thumb} 300w, ${v.md} 800w, ${v.full} 1600w`,
    thumb: v.thumb,
    md: v.md,
    full: v.full,
  };
};

export const discountPct = (p: Product) =>
  p.discounted_price && p.original_price > p.discounted_price
    ? Math.round(((p.original_price - p.discounted_price) / p.original_price) * 100)
    : 0;
