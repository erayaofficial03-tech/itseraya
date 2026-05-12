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
  store_name: string;
  tagline: string;
  logo_url: string | null;
  whatsapp_number: string | null;
  hero_image_url: string | null;
  hero_headline: string | null;
  hero_subtext: string | null;
  hero_cta_label: string | null;
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
