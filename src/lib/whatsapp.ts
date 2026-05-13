import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Settings } from "./queries";
import { formatINR } from "./queries";

const DEFAULT_TEMPLATE =
  "Hi Eraya! I love this product and would like to know more 😍\n\n*{product_name}*\nPrice: {price}\n\nProduct Link: {url}";

const renderTemplate = (
  tpl: string,
  vars: Record<string, string>,
): string =>
  tpl.replace(/\{(product_name|price|url)\}/g, (_, k) => vars[k] ?? "");

const logEnquiry = async (product: Product) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    await supabase.from("enquiries").insert({
      product_id: product.id,
      product_name: product.name,
      product_price: product.discounted_price ?? product.original_price,
      customer_email: user?.email ?? null,
      customer_name:
        (user?.user_metadata as Record<string, unknown> | undefined)?.full_name as string ??
        (user?.user_metadata as Record<string, unknown> | undefined)?.name as string ??
        null,
    });
  } catch {
    /* fire-and-forget */
  }
};

export interface WhatsAppBlockedDetail {
  url: string;
  message: string;
  number: string;
}

export const WHATSAPP_BLOCKED_EVENT = "whatsapp:blocked";

/**
 * Build a wa.me link for a given (digits-only) number and message.
 * Number is optional — falls back to the generic share link.
 */
export const buildWhatsAppUrl = (number: string | null | undefined, message: string): string => {
  const cleaned = (number ?? "").replace(/\D/g, "");
  const target = cleaned ? `https://wa.me/${cleaned}` : "https://wa.me/";
  return `${target}?text=${encodeURIComponent(message)}`;
};

/**
 * Open WhatsApp with a prefilled message. If the browser blocks the popup
 * (returns null) or closes it immediately, dispatches a global
 * `whatsapp:blocked` event so a fallback dialog can render the link and
 * message text for the user to copy/open manually.
 *
 * Returns true if the popup opened, false otherwise.
 */
export type WhatsAppSource =
  | "float_button"
  | "product_card"
  | "enquiry_drawer"
  | "product_detail";

export const logWhatsAppClick = (
  source: WhatsAppSource,
  product_id: string | null = null,
) => {
  void supabase.from("whatsapp_clicks").insert({ source, product_id });
};

export const openWhatsApp = (
  number: string | null | undefined,
  message: string,
  source?: WhatsAppSource,
  product_id: string | null = null,
): boolean => {
  const url = buildWhatsAppUrl(number, message);
  let win: Window | null = null;
  try {
    win = window.open(url, "_blank", "noopener");
  } catch {
    win = null;
  }
  const blocked = !win || win.closed || typeof win.closed === "undefined";
  if (source) logWhatsAppClick(source, product_id);
  if (blocked) {
    const detail: WhatsAppBlockedDetail = {
      url,
      message,
      number: (number ?? "").replace(/\D/g, ""),
    };
    window.dispatchEvent(new CustomEvent(WHATSAPP_BLOCKED_EVENT, { detail }));
    return false;
  }
  return true;
};

export const openWhatsAppEnquiry = (
  product: Product,
  settings: Settings | undefined,
) => {
  const number = settings?.whatsapp_number?.replace(/\D/g, "");
  void logEnquiry(product);

  if (!number) {
    toast("WhatsApp enquiry coming soon!");
    return;
  }
  const price = product.discounted_price ?? product.original_price;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const tpl = settings?.whatsapp_message_template || DEFAULT_TEMPLATE;
  const msg = renderTemplate(tpl, {
    product_name: product.name,
    price: formatINR(price),
    url,
  });
  openWhatsApp(number, msg, "product_detail", product.id);
};
