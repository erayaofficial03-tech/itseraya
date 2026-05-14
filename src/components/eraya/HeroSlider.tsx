import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { useIsMobile } from "@/hooks/use-mobile";
import { safeUrl } from "@/lib/safeUrl";

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  overlay_opacity: number | null;
  text_color: string | null;
  is_active: boolean;
  display_order: number;
  starts_at: string | null;
  expires_at: string | null;
};

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80";

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
      return (data || []) as Banner[];
    },
    staleTime: 60_000,
  });

const logBannerClick = (banner_id: string, page_path: string) => {
  void supabase.from("banner_clicks").insert({ banner_id, page_path });
};

const HeroSlider = () => {
  const { data: settings } = useSettings();
  const { data: banners = [] } = useBanners();
  const isMobile = useIsMobile();

  const now = Date.now();
  const visible = useMemo(
    () =>
      banners.filter((b) => {
        if (b.starts_at && new Date(b.starts_at).getTime() > now) return false;
        if (b.expires_at && new Date(b.expires_at).getTime() < now) return false;
        return true;
      }),
    [banners, now],
  );

  const fallbackBanner: Banner | null = useMemo(() => {
    if (visible.length > 0) return null;
    return {
      id: "__fallback__",
      title: s(settings, "hero_headline"),
      subtitle: s(settings, "hero_subtext"),
      cta_text: s(settings, "hero_cta_label"),
      cta_url: s(settings, "hero_cta_url") || "/catalogue",
      image_url: settings?.hero_image_url || HERO_FALLBACK,
      image_mobile_url: null,
      overlay_opacity: s(settings, "hero_overlay_opacity") ?? 40,
      text_color: "#FFFFFF",
      is_active: true,
      display_order: 0,
      starts_at: null,
      expires_at: null,
    };
  }, [visible.length, settings]);

  const slides = visible.length > 0 ? visible : fallbackBanner ? [fallbackBanner] : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [slides.length, paused]);

  const pauseTemporarily = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 8000);
  };

  const goTo = (i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
    pauseTemporarily();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
  };

  if (slides.length === 0) return null;
  const slide = slides[index];
  const overlay = Math.max(0, Math.min(100, slide.overlay_opacity ?? 40)) / 100;
  const img = (isMobile && slide.image_mobile_url) || slide.image_url || HERO_FALLBACK;
  const textColor = slide.text_color || "#FFFFFF";

  return (
    <section className="relative w-full px-4 md:px-6 mb-10 md:mb-16">
      <div
        className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl"
        style={{ aspectRatio: "16 / 7", minHeight: "45vh" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={img}
              alt={slide.title || "Banner"}
              width={1600}
              height={700}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "low"}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent"
              style={{ opacity: overlay }}
            />
            <div
              className="relative z-10 h-full flex flex-col justify-center max-w-2xl px-6 md:px-12"
              style={{ color: textColor }}
            >
              {slide.title && (
                <h1 className="font-serif text-[28px] md:text-6xl font-semibold mb-3 md:mb-4 drop-shadow">
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <p className="text-sm md:text-lg mb-5 md:mb-6 max-w-lg opacity-90">
                  {slide.subtitle}
                </p>
              )}
              {slide.cta_text && slide.cta_url && (
                <Button
                  asChild
                  size="lg"
                  className="w-fit rounded-full text-charcoal"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <Link
                    to={safeUrl(slide.cta_url)}
                    onClick={() => {
                      if (slide.id !== "__fallback__") {
                        logBannerClick(slide.id, window.location.pathname);
                      }
                    }}
                  >
                    {slide.cta_text}
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  background: i === index ? "hsl(var(--gold))" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
