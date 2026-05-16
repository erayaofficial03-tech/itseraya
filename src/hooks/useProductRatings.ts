import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductRatingMap = Record<string, { avg: number; count: number }>;

export const useProductRatings = () =>
  useQuery<ProductRatingMap>({
    queryKey: ["product-ratings"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("product_id, rating")
        .eq("is_approved", true)
        .eq("is_hidden", false)
        .not("product_id", "is", null);

      const map: ProductRatingMap = {};
      (data || []).forEach((r: any) => {
        if (!r.product_id) return;
        if (!map[r.product_id]) map[r.product_id] = { avg: 0, count: 0 };
        map[r.product_id].count++;
        map[r.product_id].avg += r.rating;
      });
      Object.keys(map).forEach((id) => {
        map[id].avg = Math.round((map[id].avg / map[id].count) * 10) / 10;
      });
      return map;
    },
  });
