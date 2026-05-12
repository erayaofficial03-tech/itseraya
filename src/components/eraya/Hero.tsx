import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/queries";

const Hero = () => {
  const { data: settings } = useSettings();
  return (
    <section className="relative w-full px-6 mb-16">
      <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16 / 7" }}>
        <img
          src={settings?.hero_image_url || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80"}
          alt="Eraya jewellery collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-charcoal/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center max-w-2xl px-8 md:px-16 text-white">
          <h1 className="font-serif text-4xl md:text-6xl font-semibold mb-4 drop-shadow">
            {settings?.hero_headline || settings?.tagline || "Adorn Your Story"}
          </h1>
          <p className="text-base md:text-lg mb-6 max-w-lg opacity-95">
            {settings?.hero_subtext ||
              "Discover handcrafted artificial jewellery designed to celebrate every woman."}
          </p>
          <Button
            asChild
            size="lg"
            className="w-fit text-charcoal"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Link to="/catalogue">{settings?.hero_cta_label || "Shop the Collection"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
