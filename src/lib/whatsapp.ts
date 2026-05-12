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

export const openWhatsAppEnquiry = (
  product: Product,
  settings: Settings | undefined,
) => {
  const number = settings?.whatsapp_number?.replace(/\D/g, "");
  void logEnquiry(product);

  if (!number) {
    toast("Enquiry setup coming soon!");
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
  window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(msg)}`,
    "_blank",
  );
};
