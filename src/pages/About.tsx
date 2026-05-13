import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const About = () => {
  const { data: settings } = useSettings();
  const title = s(settings, "about_title");
  const body = s(settings, "about_body");
  const image = s(settings, "about_image_url");
  const tagline = settings?.tagline || "Adorn Your Story";
  const logo = settings?.logo_url || erayaLogo;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title={`${title} — ${settings?.store_name || "Eraya"}`} description={body.slice(0, 160)} />
      <Header />
      <main className="flex-1">
        {/* Hero with image or warm gradient fallback */}
        <section className="relative w-full aspect-[16/9] md:aspect-[21/8] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--ivory)) 0%, hsl(var(--gold) / 0.35) 60%, hsl(var(--charcoal) / 0.85) 100%)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-transparent to-charcoal/40" />
          <div className="relative h-full flex items-end justify-center pb-8 md:pb-14 px-6">
            <h1 className="font-serif text-3xl md:text-5xl text-white drop-shadow-md text-center">
              {title}
            </h1>
          </div>
        </section>

        {/* Body */}
        <article className="max-w-2xl mx-auto px-6 py-12 md:py-16">
          <div className="text-foreground/85 text-base md:text-lg leading-relaxed whitespace-pre-line text-center md:text-left">
            {body}
          </div>

          <div className="mt-14 flex flex-col items-center gap-3">
            <p className="font-serif italic text-gold text-lg md:text-xl">{tagline}</p>
            <img src={logo} alt={settings?.store_name || "Eraya"} className="h-10 w-auto object-contain opacity-90" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default About;
