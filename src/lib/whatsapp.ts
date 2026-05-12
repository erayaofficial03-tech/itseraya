import { toast } from "sonner";
import type { Product, Settings } from "./queries";
import { formatINR } from "./queries";

export const openWhatsAppEnquiry = (product: Product, settings: Settings | undefined) => {
  const number = settings?.whatsapp_number?.replace(/\D/g, "");
  if (!number) {
    toast("Enquiry setup coming soon!");
    return;
  }
  const price = product.discounted_price ?? product.original_price;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const msg =
    `Hi Eraya! I love this product and would like to know more 😍\n\n` +
    `*${product.name}*\n` +
    `Price: ${formatINR(price)}\n\n` +
    `Product Link: ${url}`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, "_blank");
};
