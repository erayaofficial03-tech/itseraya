import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "eraya_enquiry_cart";
const EVENT = "eraya:enquiry-cart-updated";

export interface EnquiryCartItem {
  product_id: string;
  product_name: string;
  product_image?: string | null;
  price: number | null;
  size?: string | null;
  colour?: string | null;
  quantity: number;
}

const read = (): EnquiryCartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (items: EnquiryCartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
};

const sameVariant = (a: EnquiryCartItem, b: EnquiryCartItem) =>
  a.product_id === b.product_id &&
  (a.size ?? null) === (b.size ?? null) &&
  (a.colour ?? null) === (b.colour ?? null);

export const useEnquiryCart = () => {
  const [items, setItems] = useState<EnquiryCartItem[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addToCart = useCallback((item: EnquiryCartItem) => {
    const current = read();
    const idx = current.findIndex((c) => sameVariant(c, item));
    if (idx >= 0) {
      current[idx].quantity += item.quantity || 1;
    } else {
      current.push({ ...item, quantity: item.quantity || 1 });
    }
    write(current);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    const current = read();
    current.splice(index, 1);
    write(current);
  }, []);

  const updateQuantity = useCallback((index: number, qty: number) => {
    const current = read();
    if (!current[index]) return;
    current[index].quantity = Math.max(1, qty);
    write(current);
  }, []);

  const clearCart = useCallback(() => write([]), []);

  return {
    items,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};
