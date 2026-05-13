import { useEffect, useState } from "react";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const StatusBar = () => {
  const { data: settings } = useSettings();
  const [i, setI] = useState(0);

  const interval = settings?.usp_interval_ms ?? 3500;
  const fadeSpeed = settings?.usp_fade_speed_ms ?? 300;

  const usps = [s(settings, "usp_1"), s(settings, "usp_2"), s(settings, "usp_3")]
    .map((t) => (t || "").trim())
    .filter(Boolean);

  useEffect(() => {
    if (usps.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % usps.length), interval);
    return () => clearInterval(t);
  }, [interval, usps.length]);

  if (usps.length === 0) return null;
  const current = usps[i % usps.length];

  return (
    <div className="w-full bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-center overflow-hidden">
        <p
          key={`${i}-${current}`}
          className="text-[11px] sm:text-xs font-light tracking-[0.2em] uppercase animate-fade-in"
          style={{ animationDuration: `${fadeSpeed}ms` }}
        >
          {current}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;
