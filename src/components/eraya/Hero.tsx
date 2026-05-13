import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80";

const Hero = () => {
  const { data: settings } = useSettings();
  const overlay = Math.max(0, Math.min(100, s(settings, "hero_overlay_opacity"))) / 100;
  return (
    <section className="relative w-full px-4 md:px-6 mb-10 md:mb-16">
      <div
        className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl"
        style={{ aspectRatio: "16 / 7", minHeight: "45vh" }}
      >
        <img
          src={settings?.hero_image_url || HERO_FALLBACK}
          alt={s(settings, "hero_headline")}
          width={1600}
          height={700}
          decoding="async"
          {...({ fetchpriority: "high" } as any)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent"
          style={{ opacity: overlay }}
        />
        <div className="relative z-10 h-full flex flex-col justify-center max-w-2xl px-6 md:px-12 text-white">
          <h1 className="font-serif text-[28px] md:text-6xl font-semibold mb-3 md:mb-4 drop-shadow">
            {s(settings, "hero_headline")}
          </h1>
          <p className="text-sm md:text-lg mb-5 md:mb-6 max-w-lg opacity-95">
            {s(settings, "hero_subtext")}
          </p>
          <Button
            asChild
            size="lg"
            className="w-fit rounded-full text-charcoal"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Link to={s(settings, "hero_cta_url")}>{s(settings, "hero_cta_label")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
