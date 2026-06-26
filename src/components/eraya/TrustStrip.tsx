import { Droplets, Sparkles, Leaf, Truck, Shield, Star, Heart, Package, Gift, Zap, Award, Clock } from "lucide-react";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Droplets, Sparkles, Leaf, Truck, Shield, Star, Heart, Package, Gift, Zap, Award, Clock,
};

/**
 * Slim trust strip — sits directly under the hero.
 * Labels and icons are admin-editable via settings.
 */
const TrustStrip = () => {
  const { data: settings } = useSettings();

  const items = [
    { label: s(settings, "trust_1_label"), icon: s(settings, "trust_1_icon") },
    { label: s(settings, "trust_2_label"), icon: s(settings, "trust_2_icon") },
    { label: s(settings, "trust_3_label"), icon: s(settings, "trust_3_icon") },
    { label: s(settings, "trust_4_label"), icon: s(settings, "trust_4_icon") },
  ].filter((item) => item.label && String(item.label).trim() !== "");

  if (items.length === 0) return null;

  return (
    <section className="w-full bg-blush/40 border-y border-champagne/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 md:py-5">
        <ul className="flex items-center justify-between gap-3 md:gap-10 overflow-x-auto scrollbar-hide">
          {items.map(({ label, icon }) => {
            const Icon = ICON_MAP[String(icon)] || Sparkles;
            return (
              <li key={String(label)} className="flex items-center gap-2 md:gap-3 shrink-0 text-ink-soft">
                <Icon className="h-4 w-4 md:h-5 md:w-5 text-champagne-deep" strokeWidth={1.5} />
                <span className="font-display text-[12px] md:text-sm tracking-wide whitespace-nowrap">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default TrustStrip;
