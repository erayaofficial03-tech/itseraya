import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import SeoHead from "@/components/providers/SeoHead";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsApp } from "@/lib/whatsapp";

interface Props {
  title: string;
  body: string;
  lastUpdated?: string;
}

const PolicyPage = ({ title, body, lastUpdated }: Props) => {
  const { data: settings } = useSettings();
  const sx = (settings as Record<string, string | undefined> | undefined) ?? {};
  const logo = settings?.logo_url || erayaLogo;

  const fontFamily = sx.policy_font_family || "Inter";
  const fontSize = `${sx.policy_font_size || "16"}px`;
  const textColor = sx.policy_text_color || "#2C2C2C";
  const headingColor = sx.policy_heading_color || "#C9A84C";
  const bgColor = sx.policy_bg_color || "#FAF8F5";
  const storeName = s(settings, "store_name");
  const tagline = s(settings, "tagline");

  const handleWhatsApp = () => {
    const wa = settings?.whatsapp_number?.replace(/\D/g, "");
    if (wa) openWhatsApp(wa, `Hi ${storeName}! I have a question about your ${title}.`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor }}>
      <SeoHead title={`${title} — ${storeName}`} description={body.slice(0, 160)} />
      <header className="relative flex items-center justify-center px-4 py-4">
        <Link
          to="/"
          aria-label="Back to home"
          className="absolute left-3 h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5"
          style={{ color: textColor }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={logo} alt={storeName} className="h-8 w-auto object-contain" />
      </header>

      <div
        className="mx-auto"
        style={{ width: "60%", minWidth: "240px", maxWidth: "720px", height: 1, backgroundColor: headingColor, opacity: 0.6 }}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-8 pb-24">
        <h1
          className="font-serif text-3xl md:text-4xl mb-2"
          style={{ color: headingColor }}
        >
          {title}
        </h1>
        {lastUpdated && (
          <p className="text-xs mb-6 opacity-60" style={{ color: textColor }}>
            Last updated: {lastUpdated}
          </p>
        )}

        <div
          className="leading-relaxed whitespace-pre-line"
          style={{ color: textColor, fontFamily, fontSize }}
        >
          {body}
        </div>

        <div className="mt-12 pt-6 border-t" style={{ borderColor: `${textColor}22` }}>
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: headingColor }}
          >
            <MessageCircle className="h-4 w-4" />
            Questions? Contact us on WhatsApp
          </button>
        </div>
      </main>

      <footer className="text-center pb-10 pt-4">
        <img src={logo} alt={storeName} className="h-7 w-auto object-contain mx-auto mb-2 opacity-80" />
        <p
          className="font-serif italic text-sm"
          style={{ color: headingColor }}
        >
          {tagline}
        </p>
      </footer>
    </div>
  );
};

export default PolicyPage;
