import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Twitter, MessageCircle, Link as LinkIcon } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings, useSocialLinks } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { safeUrl } from "@/lib/safeUrl";

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
    <>
      {/* Mobile slim copyright bar */}
      <footer className="md:hidden w-full bg-background border-t border-border mt-12 px-4 py-5 pb-24 flex flex-col items-center gap-3 text-center">
        {showLogo && (
          <Link to="/" aria-label="Go to home" className="inline-flex">
            <img src={logo} alt={settings?.store_name || "Eraya"} draggable={false} className="brand-logo h-7 w-auto object-contain" />
          </Link>
        )}
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{copyright}</p>
        {showSocial && socials.filter((l) => l.is_visible).length > 0 && (
          <div className="flex items-center gap-2">
            {socials.filter((l) => l.is_visible).map((l) => {
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
          </div>
        )}
      </footer>

      <footer className="hidden md:block w-full bg-background border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1 — Brand */}
          <div className="flex flex-col items-start gap-3">
            {showLogo && (
              <Link to="/" aria-label="Go to home" className="inline-flex">
                <img src={logo} alt={settings?.store_name || "Eraya"} draggable={false} className="brand-logo h-9 w-auto object-contain" />
              </Link>
            )}
            <p className="font-serif italic text-gold">{s(settings, "tagline")}</p>
            {(showSocial || showWhatsApp) && (
              <div className="flex items-center gap-2 mt-2">
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
              </div>
            )}
          </div>

          {/* Col 2 — Shop */}
          {linksVisible && (
            <div>
              <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">
                Shop
              </p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/?filter=new" className="hover:text-gold">New Arrivals</Link></li>
                <li><Link to="/catalogue" className="hover:text-gold">Catalogue</Link></li>
                <li><Link to="/about" className="hover:text-gold">About</Link></li>
                <li><Link to="/track" className="hover:text-gold">Track Enquiry</Link></li>
              </ul>
            </div>
          )}

          {/* Col 3 — Help */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Help
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
              <li><Link to="/care" className="hover:text-gold">Jewellery Care</Link></li>
            </ul>
          </div>

          {/* Col 4 — Policies */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Policies
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/return-policy" className="hover:text-gold">Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-gold">Cancellation Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-gold">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{copyright}</p>
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
      </div>
      </footer>
    </>
  );
};

export default Footer;
