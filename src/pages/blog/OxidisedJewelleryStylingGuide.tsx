import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Sparkles } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import SeoHead from "@/components/providers/SeoHead";
import JsonLd from "@/components/providers/JsonLd";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsApp } from "@/lib/whatsapp";

const PUBLISHED = "2026-06-29";
const TITLE = "The Ultimate Guide to Styling Oxidised Jewellery for Every Occasion";
const DESCRIPTION =
  "An editorial guide to styling and caring for oxidised jewellery — outfit pairings, trend notes, and tarnish-proof care tips from Eraya.";

const OxidisedJewelleryStylingGuide = () => {
  const { data: settings } = useSettings();
  const storeName = s(settings, "store_name");
  const logo = settings?.logo_url || erayaLogo;

  const handleWhatsApp = () => {
    const wa = settings?.whatsapp_number?.replace(/\D/g, "");
    if (wa) openWhatsApp(wa, `Hi ${storeName}! I'd love help styling oxidised jewellery.`);
  };

  const canonical = "/blog/oxidised-jewellery-styling-guide";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <SeoHead
        title={`${TITLE} — ${storeName}`}
        description={DESCRIPTION}
        canonical={canonical}
        keywords={[
          "oxidised jewellery",
          "fashion jewellery",
          "oxidised jewellery styling",
          "oxidised silver jewellery care",
          "german silver jewellery",
          "boho jewellery india",
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Organization", name: storeName },
          publisher: {
            "@type": "Organization",
            name: storeName,
            logo: { "@type": "ImageObject", url: logo },
          },
          mainEntityOfPage: canonical,
          keywords:
            "oxidised jewellery, fashion jewellery, oxidised silver care, styling guide",
        }}
      />

      <header className="relative flex items-center justify-center px-4 py-4">
        <Link
          to="/"
          aria-label="Back to home"
          className="absolute left-3 h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img
          src={logo}
          alt={`${storeName} Logo`}
          draggable={false}
          className="brand-logo h-8 w-auto object-contain"
        />
      </header>

      <div className="mx-auto w-3/5 min-w-[240px] max-w-[720px] h-px bg-primary/60" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-10 pb-24">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Eraya Journal · Styling Guide
        </p>
        <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-4 text-primary">
          {TITLE}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Published {new Date(PUBLISHED).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })} · 6 min read
        </p>

        <article className="prose prose-neutral max-w-none leading-relaxed text-[17px] space-y-6">
          <p className="text-lg">
            Oxidised jewellery has quietly become one of the most loved categories
            in modern Indian fashion. With its smoky silver finish, intricate
            tribal motifs, and statement silhouettes, it bridges traditional
            craftsmanship with everyday wearability. Whether you're styling a
            handloom saree, a linen co-ord, or your favourite kurta set, the
            right oxidised piece can transform the entire look.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            What exactly is oxidised jewellery?
          </h2>
          <p>
            Oxidised jewellery is made by treating a base metal — usually German
            silver, brass, or sterling silver — with an oxidising agent that
            darkens the surface. The result is the signature antique-grey finish
            that highlights every engraving and curve. Because the metal base is
            sturdy and the finish is matte, oxidised jewellery feels lightweight
            yet sculptural, making it perfect for everyday wear.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            Why oxidised jewellery is trending in 2026
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Boho-meets-festive aesthetic.</strong> Layered jhumkas and
              chunky chokers pair beautifully with both indo-western and
              traditional outfits.
            </li>
            <li>
              <strong>Affordable luxury.</strong> Oxidised pieces deliver the
              richness of antique silver at fashion-jewellery prices.
            </li>
            <li>
              <strong>Sustainable styling.</strong> One statement piece can
              elevate ten outfits — perfect for capsule wardrobes.
            </li>
            <li>
              <strong>Photography-ready.</strong> The matte grey finish
              photographs gorgeously against bright sarees and pastel kurtas.
            </li>
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            Styling oxidised jewellery for every occasion
          </h2>

          <h3 className="font-serif text-xl mt-6 mb-2">1. Everyday office wear</h3>
          <p>
            Stick to a single delicate piece — a thin oxidised chain or small
            stud earrings. Pair with a kurta, a linen shirt, or a fitted tee.
            Avoid stacking; let the silver finish do the talking.
          </p>

          <h3 className="font-serif text-xl mt-6 mb-2">2. Brunches and casual outings</h3>
          <p>
            This is where oxidised jewellery truly shines. Try a pair of
            mid-sized jhumkas with a relaxed midi dress, or layer two oxidised
            chains of different lengths over a plain top. Add a stack of
            oxidised bangles on one wrist for an effortless boho edge.
          </p>

          <h3 className="font-serif text-xl mt-6 mb-2">3. Festive and traditional wear</h3>
          <p>
            For sarees and lehengas, go bold: a chandbali, a statement haar, or
            a temple-style choker. Oxidised jewellery pairs especially well with
            handloom cottons, Chanderis, ikats, and muted Banarasis where the
            silver finish stands out against earthy tones.
          </p>

          <h3 className="font-serif text-xl mt-6 mb-2">4. Western and indo-fusion looks</h3>
          <p>
            Layer an oxidised pendant over a white shirt and denim, or wear a
            cuff bracelet with a black slip dress. The contrast between modern
            silhouettes and antique-finish metal creates the kind of styling
            that gets noticed.
          </p>

          <h3 className="font-serif text-xl mt-6 mb-2">5. Weddings (as a guest)</h3>
          <p>
            Choose one statement category — earrings, neckpiece, or hand
            jewellery — and keep the rest minimal. Oversized oxidised jhumkas
            with a tied-up hairstyle photograph beautifully and stay comfortable
            through long ceremonies.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            Colour pairing cheat sheet
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Ivory, beige, and pastels</strong> — gentle, photo-friendly contrast.</li>
            <li><strong>Mustard, rust, and olive</strong> — earthy palette that complements antique silver.</li>
            <li><strong>Indigo, maroon, and forest green</strong> — for richer, festive impact.</li>
            <li><strong>Black and white</strong> — clean, editorial styling for western looks.</li>
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            How to care for oxidised jewellery
          </h2>
          <p>
            The oxidised finish is intentional — it's meant to look antique.
            That means harsh polishing or silver-cleaner solutions can actually
            strip the look you love. Follow these simple care rules:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Last on, first off.</strong> Wear your jewellery after
              perfume, makeup, and hairspray — and remove it before bathing or
              swimming.
            </li>
            <li>
              <strong>Keep it dry.</strong> Moisture is the biggest enemy. Store
              in an airtight pouch with a small silica sachet.
            </li>
            <li>
              <strong>Wipe gently after wear.</strong> Use a soft, dry cotton or
              flannel cloth. Avoid tissues — they're abrasive.
            </li>
            <li>
              <strong>Never use silver polish or toothpaste.</strong> These
              strip the oxidised finish and leave the metal patchy.
            </li>
            <li>
              <strong>Store pieces separately.</strong> Tangled chains and
              clashing metals scratch the finish.
            </li>
            <li>
              <strong>Refresh occasionally.</strong> A light buff with a dry
              microfibre cloth brings back the soft sheen between wears.
            </li>
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            Building your oxidised jewellery wardrobe
          </h2>
          <p>
            If you're starting a collection, begin with these five essentials:
            a pair of medium jhumkas, one statement neckpiece, a delicate
            everyday chain, a stack of thin bangles, and one ring you can wear
            daily. With those five pieces, you'll have a versatile rotation
            that works across casual, festive, and indo-western looks.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-3 text-primary">
            Shop the look
          </h2>
          <p>
            Explore Eraya's handpicked oxidised jewellery — designed to feel
            timeless, photograph beautifully, and travel from your morning
            coffee to your evening function.
          </p>
          <p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Browse the full collection →
            </Link>
          </p>
        </article>

        <div className="mt-12 pt-6 border-t border-foreground/10">
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            Need styling help? Chat with us on WhatsApp
          </button>
        </div>
      </main>
    </div>
  );
};

export default OxidisedJewelleryStylingGuide;
