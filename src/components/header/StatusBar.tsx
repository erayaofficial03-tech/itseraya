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
    <div className="w-full bg-[hsl(var(--status-bar))] text-[hsl(var(--status-bar-foreground))] border-b border-[hsl(var(--status-bar-foreground))]/15">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-7 sm:h-8 flex items-center justify-center overflow-hidden">
        <p
          key={`${i}-${current}`}
          className="text-[11px] sm:text-xs font-medium tracking-[0.22em] sm:tracking-[0.24em] uppercase animate-fade-in truncate text-center text-[hsl(var(--status-bar-foreground))]"
          style={{
            animationDuration: `${fadeSpeed}ms`,
            textShadow: "0 1px 0 hsl(var(--status-bar) / 0.6)",
          }}
        >
          {current}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;
