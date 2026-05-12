import { useEffect, useState } from "react";
import { useSettings } from "@/lib/queries";

const usps = [
  "Handcrafted with love",
  "Free shipping on orders over ₹999",
  "Easy WhatsApp enquiries",
  "New arrivals every week",
];

const StatusBar = () => {
  const { data: settings } = useSettings();
  const [i, setI] = useState(0);

  const interval = settings?.usp_interval_ms ?? 3500;
  const fadeSpeed = settings?.usp_fade_speed_ms ?? 300;

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % usps.length), interval);
    return () => clearInterval(t);
  }, [interval]);

  return (
    <div className="w-full bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-center overflow-hidden">
        <p
          key={i}
          className="text-[11px] sm:text-xs font-light tracking-[0.2em] uppercase animate-fade-in"
          style={{ animationDuration: `${fadeSpeed}ms` }}
        >
          {usps[i]}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;
