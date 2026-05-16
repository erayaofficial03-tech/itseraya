import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { useIsMobile } from "@/hooks/use-mobile";
import { BannerRenderer } from "./BannerRenderer";
import { type Banner } from "./banner-types";

export type { Banner };

const useBanners = () =>
  useQuery({
    queryKey: ["banners-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Banner[];
    },
    staleTime: 60_000,
  });

const HeroSlider = () => {
  const { data: settings } = useSettings();
  const { data: banners = [] } = useBanners();
  const isMobile = useIsMobile();

  const now = Date.now();
  const visible = useMemo(
    () =>
      banners.filter((b) => {
        if (!b.is_active) return false;
        if (b.starts_at && new Date(b.starts_at).getTime() > now) return false;
        if (b.expires_at && new Date(b.expires_at).getTime() < now) return false;
        return true;
      }),
    [banners, now],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (visible.length <= 1 || paused) return;
    const duration = visible[index]?.autoplay_duration || 5000;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % visible.length), duration);
    return () => window.clearTimeout(t);
  }, [index, visible, paused]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || visible.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) {
      setIndex((i) => (dx < 0 ? (i + 1) % visible.length : (i - 1 + visible.length) % visible.length));
      setPaused(true);
      window.setTimeout(() => setPaused(false), 6000);
    }
  };

  // Fallback hero when no banners
  if (visible.length === 0) {
    return (
      <section
        className="relative w-full flex items-center"
        style={{
          minHeight: 420,
          background: "linear-gradient(135deg, #1C1C1C 0%, #2C2010 50%, rgba(201,168,76,0.12) 100%)",
        }}
      >
        <div className="px-6 max-w-xl">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
            {s(settings, "hero_headline")}
          </h1>
          <p className="text-white/80 text-sm md:text-base mt-3">
            {s(settings, "hero_subtext")}
          </p>
          <a
            href={s(settings, "hero_cta_url") || "/catalogue"}
            className="mt-5 inline-block px-7 py-3 bg-[#C9A84C] text-white text-sm font-semibold rounded-full"
          >
            {s(settings, "hero_cta_label")}
          </a>
        </div>
      </section>
    );
  }

  const banner = visible[index];
  const viewport: "mobile" | "tablet" | "desktop" = isMobile ? "mobile" : "desktop";
  const height = isMobile ? (banner.height_mobile ?? 420) : (banner.height_desktop ?? 580);

  return (
    <section
      className="relative w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <BannerRenderer
        banner={banner}
        viewport={viewport}
        height={height}
        useRouter
        trackClicks
        animKey={banner.id}
      />

      {visible.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setPaused(true); window.setTimeout(() => setPaused(false), 6000); }}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all rounded-full bg-white"
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                opacity: i === index ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
