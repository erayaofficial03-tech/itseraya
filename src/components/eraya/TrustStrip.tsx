import { Droplets, Sparkles, Leaf, Truck } from "lucide-react";

const items = [
  { icon: Droplets, label: "Waterproof" },
  { icon: Sparkles, label: "Tarnish Resistant" },
  { icon: Leaf, label: "Hypoallergenic" },
  { icon: Truck, label: "PAN India Shipping" },
];

/**
 * Slim trust strip — sits directly under the hero.
 * Soft champagne icons + Cormorant labels, generous tracking.
 */
const TrustStrip = () => (
  <section className="w-full bg-blush/40 border-y border-champagne/20">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 md:py-5">
      <ul className="flex items-center justify-between gap-3 md:gap-10 overflow-x-auto scrollbar-hide">
        {items.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 md:gap-3 shrink-0 text-ink-soft"
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-champagne-deep" strokeWidth={1.5} />
            <span className="font-display text-[12px] md:text-sm tracking-wide whitespace-nowrap">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustStrip;
