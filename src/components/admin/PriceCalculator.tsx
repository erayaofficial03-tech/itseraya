import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/queries";
import { usePricingComponents, computeAutoPrice } from "@/lib/pricing";

type Props = {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  onApply: (next: { mrp: number; sell: number }) => void;
};

const PriceCalculator = ({ enabled, onToggle, onApply }: Props) => {
  const { data: components = [] } = usePricingComponents();
  const { data: settings } = useSettings();
  const [purchase, setPurchase] = useState<number>(40);

  const multipliers = {
    sell: Number((settings as any)?.pricing_sell_multiplier ?? 2),
    mrp: Number((settings as any)?.pricing_mrp_multiplier ?? 2),
  };

  const shippingCost = Number((settings as any)?.shipping_flat_cost ?? 95);

  const result = useMemo(
    () => computeAutoPrice(purchase, components, multipliers, shippingCost),
    [purchase, components, multipliers.sell, multipliers.mrp, shippingCost],
  );

  return (
    <Card className="col-span-2 p-4 border-dashed">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-gold" />
          <span className="font-medium">Auto Price Calculator</span>
          <span className="text-xs text-muted-foreground">(admin only)</span>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Use calculator</Label>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </div>

      {enabled && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Purchase Price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={purchase}
                onChange={(e) => setPurchase(Number(e.target.value) || 0)}
              />
            </div>

            <div className="text-xs space-y-1 bg-muted/50 rounded p-3 font-mono max-h-56 overflow-y-auto">
              {result.steps.map((s, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <span className="truncate">{s.label}</span>
                  <span className="text-muted-foreground">{s.delta}</span>
                  <span className="text-right w-16">₹{Math.round(s.running)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1 mt-1">
                <span>Shipping Charge</span>
                <span></span>
                <span className="text-right w-16">₹{result.shipping}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Product Cost</div>
              <div className="text-2xl font-semibold">₹{result.productCost}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">
                Min Sell Price (cost × {multipliers.sell}) → Discounted
              </div>
              <div className="text-2xl font-semibold text-gold">₹{result.minSellPrice}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">
                MRP ((cost + ship) × {multipliers.mrp}) → Original · locked
              </div>
              <div className="text-2xl font-semibold">₹{result.mrp}</div>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => onApply({ mrp: result.mrp, sell: result.minSellPrice })}
            >
              <Sparkles className="h-4 w-4" /> Apply to product
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Manage rows & multipliers under <strong>Pricing & Shipping</strong>.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PriceCalculator;
