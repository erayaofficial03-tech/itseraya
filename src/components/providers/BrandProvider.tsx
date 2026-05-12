import { useEffect } from "react";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { hexToHsl, isValidHex } from "@/lib/colors";

/**
 * Applies admin-editable brand colors, favicon, theme-color and base SEO meta
 * to the document at runtime. Mounted once near the App root.
 */
const BrandProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings } = useSettings();

  // Colors → CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const apply = (token: string, hex: string | null | undefined) => {
      if (isValidHex(hex)) root.style.setProperty(`--${token}`, hexToHsl(hex!));
    };
    const primary = s(settings, "color_primary");
    const bg = s(settings, "color_background");
    const text = s(settings, "color_text");
    const accent = s(settings, "color_accent");

    apply("gold", primary);
    apply("primary", primary);
    apply("accent", primary);
    apply("background", bg);
    apply("ivory", bg);
    apply("foreground", text);
    apply("charcoal", text);
    apply("primary-foreground", text);
    apply("accent-foreground", text);

    // Custom accent (pink) for things that need a third color
    apply("brand-accent", accent);
  }, [settings]);

  // Favicon
  useEffect(() => {
    const url = settings?.favicon_url;
    if (!url) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [settings?.favicon_url]);

  // Theme color (PWA address bar)
  useEffect(() => {
    const color = s(settings, "pwa_theme_color");
    let meta = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [settings]);

  return <>{children}</>;
};

export default BrandProvider;
