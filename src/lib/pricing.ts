import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type PricingSection = "packing_bom" | "buffer_margin" | "shipping_charge";

export type PricingComponent = {
  id: string;
  section: PricingSection;
  label: string;
  amount: number;
  sort_order: number;
};

export type PricingMultipliers = {
  sell: number;
  mrp: number;
};

export const usePricingComponents = () =>
  useQuery({
    queryKey: ["pricing_components"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_components" as any)
        .select("*")
        .order("section")
        .order("sort_order");
      if (error) throw error;
      return ((data || []) as unknown as PricingComponent[]);
    },
  });

export type AutoPriceBreakdown = {
  steps: { label: string; delta: string; running: number }[];
  productCost: number;
  shipping: number;
  minSellPrice: number;
  mrp: number;
};

const r1 = (n: number) => Math.round(n);

export function computeAutoPrice(
  purchase: number,
  components: PricingComponent[],
  multipliers: PricingMultipliers,
  shippingCost?: number,
): AutoPriceBreakdown {
  const steps: AutoPriceBreakdown["steps"] = [];
  let running = Number(purchase) || 0;
  steps.push({ label: "Purchase Price", delta: `₹${running}`, running });

  const packing = components.filter((c) => c.section === "packing_bom");
  for (const p of packing) {
    running += Number(p.amount);
    steps.push({ label: p.label, delta: `+ ₹${p.amount}`, running });
  }

  const buffers = components.filter((c) => c.section === "buffer_margin");
  for (const b of buffers) {
    running *= 1 + Number(b.amount) / 100;
    steps.push({ label: b.label, delta: `× (1 + ${b.amount}%)`, running });
  }

  const ships = components.filter((c) => c.section === "shipping_charge");
  const shipping =
    typeof shippingCost === "number" && !Number.isNaN(shippingCost)
      ? Number(shippingCost)
      : ships.reduce((s, x) => s + Number(x.amount), 0);

  const productCost = r1(running);
  const minSellPrice = r1(productCost * (multipliers.sell || 2));
  const mrp = r1((productCost + shipping) * (multipliers.mrp || 2));

  return { steps, productCost, shipping: r1(shipping), minSellPrice, mrp };
}

