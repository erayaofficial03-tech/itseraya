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
    staleTime: 5 * 60 * 1000,
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

  // Fallback hero when no banners — soft, feminine, editorial
  if (visible.length === 0) {
    return (
      <section className="relative w-full px-4 md:px-8 pt-3 md:pt-6">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blush via-ivory-warm to-blush-deep/60"
          style={{ minHeight: 460 }}
        >
          {/* Soft top-to-bottom ivory wash so any background image stays bright */}
          {settings?.hero_image_url && (
            <>
              <img
                src={settings.hero_image_url}
                alt={s(settings, "hero_headline")}
                decoding="async"
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover animate-soft-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ivory/85 via-ivory/30 to-transparent" />
            </>
          )}
          <div className="relative z-10 h-full min-h-[460px] flex flex-col justify-end md:justify-center max-w-2xl px-7 md:px-14 py-10 md:py-16">
            <span className="eyebrow animate-fade-up">New Season · Spring '26</span>
            <h1 className="editorial-headline text-[44px] md:text-7xl text-ink mt-3 md:mt-4 animate-fade-up [animation-delay:80ms]">
              {s(settings, "hero_headline")}
            </h1>
            <p className="font-body text-base md:text-lg text-ink-soft mt-4 md:mt-5 max-w-md animate-fade-up [animation-delay:160ms]">
              {s(settings, "hero_subtext")}
            </p>
            <a
              href={s(settings, "hero_cta_url") || "/catalogue"}
              className="mt-7 md:mt-8 inline-flex w-fit items-center justify-center rounded-full bg-ink text-ivory uppercase tracking-[0.18em] text-xs px-8 py-4 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all ease-luxury animate-fade-up [animation-delay:240ms]"
            >
              {s(settings, "hero_cta_label")}
            </a>
          </div>
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
