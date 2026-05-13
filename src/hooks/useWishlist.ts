import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/lib/queries";

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

export const wishlistKey = (userId: string | undefined) => ["wishlist", userId ?? "anon"];

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: wishlistKey(user?.id),
    queryFn: async (): Promise<WishlistItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id,product_id,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
};

export const useWishlistProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist-products", user?.id],
    queryFn: async (): Promise<Product[]> => {
      if (!user) return [];
      const { data: items, error } = await supabase
        .from("wishlist_items")
        .select("product_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (items || []).map((i) => i.product_id);
      if (!ids.length) return [];
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("*, product_images(image_url, sort_order)")
        .in("id", ids);
      if (pErr) throw pErr;
      // preserve wishlist order
      const order = new Map(ids.map((id, i) => [id, i] as const));
      return (products || [])
        .map((p: any) => ({
          ...p,
          tags: p.tags || [],
          images: (p.product_images || [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((x: any) => x.image_url),
        }))
        .sort((a: any, b: any) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)) as Product[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
};

export const useToggleWishlist = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const itemsKey = wishlistKey(user?.id);
  const productsKey = ["wishlist-products", user?.id];

  return useMutation({
    mutationFn: async ({ productId, isSaved }: { productId: string; isSaved: boolean }) => {
      if (!user) throw new Error("not_signed_in");
      if (isSaved) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        return { added: false };
      }
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId });
      if (error && !String(error.message).includes("duplicate")) throw error;
      return { added: true };
    },
    onMutate: async ({ productId, isSaved }) => {
      if (!user) return;
      await Promise.all([
        qc.cancelQueries({ queryKey: itemsKey }),
        qc.cancelQueries({ queryKey: productsKey }),
      ]);
      const prevItems = qc.getQueryData<WishlistItem[]>(itemsKey);
      const prevProducts = qc.getQueryData<Product[]>(productsKey);

      // Optimistically update items list
      qc.setQueryData<WishlistItem[]>(itemsKey, (old = []) => {
        if (isSaved) return old.filter((w) => w.product_id !== productId);
        if (old.some((w) => w.product_id === productId)) return old;
        return [
          { id: `optimistic-${productId}`, product_id: productId, created_at: new Date().toISOString() },
          ...old,
        ];
      });

      // Optimistically remove from products list (we don't have full product on add)
      if (isSaved && prevProducts) {
        qc.setQueryData<Product[]>(productsKey, prevProducts.filter((p) => p.id !== productId));
      }

      return { prevItems, prevProducts };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prevItems !== undefined) qc.setQueryData(itemsKey, ctx.prevItems);
      if (ctx?.prevProducts !== undefined) qc.setQueryData(productsKey, ctx.prevProducts);
      if (err.message === "not_signed_in") {
        toast.info("Sign in to save favourites.");
        navigate("/login");
        return;
      }
      toast.error(err.message);
    },
    onSuccess: (res) => {
      toast.success(res.added ? "Added to wishlist" : "Removed from wishlist");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: itemsKey });
      qc.invalidateQueries({ queryKey: productsKey });
    },
  });
};
