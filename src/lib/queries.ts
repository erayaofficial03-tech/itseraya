import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  category_id: string | null;
  description: string | null;
  original_price: number;
  discounted_price: number | null;
  tags: string[];
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  sku: string;
  product_images?: ProductImage[];
  categories?: { name: string; slug: string } | null;
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
  announcement_visible: boolean | null;
  announcement_text: string | null;
  announcement_bg_color: string | null;
  announcement_text_color: string | null;
  announcement_dismissible: boolean | null;

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

  // USP carousel (legacy, kept)
  usp_interval_ms: number;
  usp_fade_speed_ms: number;
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

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
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

export const discountPct = (p: Product) =>
  p.discounted_price && p.original_price > p.discounted_price
    ? Math.round(((p.original_price - p.discounted_price) / p.original_price) * 100)
    : 0;
