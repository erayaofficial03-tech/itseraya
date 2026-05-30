import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const GUEST_CART_KEY = 'eraya_guest_cart';

export type CartItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_colour: string | null;
  quantity: number;
  unit_price: number;
};

export const useCart = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: dbItems = [] } = useQuery<CartItem[]>({
    queryKey: ['cart', user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at');
      if (error) throw error;
      return (data || []) as CartItem[];
    },
  });

  const guestItems: CartItem[] = user
    ? []
    : JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');

  const cartItems = user ? dbItems : guestItems;
  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);
  const subtotal = cartItems.reduce((a, i) => a + i.unit_price * i.quantity, 0);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart', user?.id] });

  const addToCart = async (
    product: {
      id: string;
      name: string;
      product_images?: { image_url: string }[];
      discounted_price?: number | null;
      original_price: number;
    },
    variants: { size?: string; colour?: string } = {},
    qty = 1,
  ) => {
    const price = product.discounted_price ?? product.original_price;
    const imageUrl = product.product_images?.[0]?.image_url ?? null;

    if (!user) {
      const guest: CartItem[] = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const idx = guest.findIndex(
        (i) =>
          i.product_id === product.id &&
          i.variant_size === (variants.size || null) &&
          i.variant_colour === (variants.colour || null),
      );
      if (idx >= 0) guest[idx].quantity += qty;
      else
        guest.push({
          id: crypto.randomUUID(),
          product_id: product.id,
          product_name: product.name,
          product_image_url: imageUrl,
          variant_size: variants.size || null,
          variant_colour: variants.colour || null,
          quantity: qty,
          unit_price: price,
        });
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guest));
      toast.success('Added to cart 🛍️');
      qc.invalidateQueries({ queryKey: ['cart', undefined] });
      return;
    }

    const { error } = await supabase.from('cart_items').upsert(
      {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_image_url: imageUrl,
        variant_size: variants.size || null,
        variant_colour: variants.colour || null,
        quantity: qty,
        unit_price: price,
      },
      { onConflict: 'user_id,product_id,variant_size,variant_colour' },
    );
    if (error) {
      toast.error('Could not add to cart');
      return;
    }
    toast.success('Added to cart 🛍️');
    invalidate();
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) {
      const guest = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]').filter(
        (i: CartItem) => i.id !== itemId,
      );
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guest));
      qc.invalidateQueries({ queryKey: ['cart', undefined] });
      return;
    }
    await supabase.from('cart_items').delete().eq('id', itemId);
    invalidate();
  };

  const updateQty = async (itemId: string, qty: number) => {
    if (qty < 1) {
      await removeFromCart(itemId);
      return;
    }
    if (!user) {
      const guest = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]').map(
        (i: CartItem) => (i.id === itemId ? { ...i, quantity: qty } : i),
      );
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guest));
      qc.invalidateQueries({ queryKey: ['cart', undefined] });
      return;
    }
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId);
    invalidate();
  };

  const clearCart = async () => {
    localStorage.removeItem(GUEST_CART_KEY);
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      invalidate();
    }
  };

  const mergeGuestCart = async () => {
    if (!user) return;
    const guest: CartItem[] = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    if (!guest.length) return;
    for (const item of guest) {
      await supabase.from('cart_items').upsert(
        {
          user_id: user.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image_url: item.product_image_url,
          variant_size: item.variant_size,
          variant_colour: item.variant_colour,
          quantity: item.quantity,
          unit_price: item.unit_price,
        },
        { onConflict: 'user_id,product_id,variant_size,variant_colour' },
      );
    }
    localStorage.removeItem(GUEST_CART_KEY);
    invalidate();
  };

  return {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    mergeGuestCart,
  };
};
