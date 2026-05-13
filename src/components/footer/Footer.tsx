import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Twitter, MessageCircle, Link as LinkIcon } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings, useSocialLinks } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const platformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return Instagram;
  if (p.includes("facebook")) return Facebook;
  if (p.includes("youtube")) return Youtube;
  if (p.includes("twitter") || p === "x") return Twitter;
  if (p.includes("pinterest")) return LinkIcon;
  return LinkIcon;
};

const Footer = () => {
  const { data: settings } = useSettings();
  const { data: socials = [] } = useSocialLinks();
  const logo = settings?.logo_url || erayaLogo;
  const wa = settings?.whatsapp_number?.replace(/\D/g, "");
  const showLogo = s(settings, "footer_show_logo");
  const showSocial = s(settings, "footer_show_social");
  const showWhatsApp = s(settings, "footer_show_whatsapp");
  const linksVisible = s(settings, "footer_links_visible");
  const whatsappLabel = s(settings, "footer_whatsapp_label");
  const copyright = s(settings, "footer_copyright").replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <footer className="w-full bg-background border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center gap-4">
          {showLogo && (
            <img src={logo} alt={settings?.store_name || "Eraya"} className="h-14 w-auto object-contain" />
          )}
          <p className="font-serif italic text-lg text-gold">{s(settings, "tagline")}</p>

          {(showSocial || showWhatsApp) && (
            <div className="flex items-center gap-3 mt-2">
              {showSocial &&
                socials
                  .filter((l) => l.is_visible)
                  .map((l) => {
                    const Icon = platformIcon(l.platform);
                    return (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={l.platform}
                        className="p-2 rounded-full border border-border hover:border-gold hover:text-gold transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
              {showWhatsApp && wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={whatsappLabel}
                  title={whatsappLabel}
                  className="p-2 rounded-full border border-border hover:border-gold hover:text-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <p>{copyright}</p>
          {linksVisible && (
            <div className="flex gap-4">
              <Link to="/catalogue" className="hover:text-gold">{s(settings, "nav_catalogue_label")}</Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
