import { useEffect, useMemo } from "react";
import { useSettings, useThemePresets } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { hexToHsl, isValidHex } from "@/lib/colors";

/**
 * Applies admin-editable theme tokens (colors, fonts, radius, spacing,
 * favicon, theme-color) to the document at runtime. Reads the active
 * theme preset + per-field overrides from `settings`.
 */
const BrandProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings } = useSettings();
  const { data: presets } = useThemePresets();

  // Resolved palette: active preset → per-field settings override
  const palette = useMemo(() => {
    const preset = presets?.find((p) => p.id === settings?.active_theme_id);
    const base = preset?.tokens || {};
    return {
      background: settings?.color_background || base.background || "#FAF7F2",
      foreground: settings?.color_text || base.foreground || base.ink || "#2C2C2C",
      primary: settings?.color_primary || base.primary || base.champagne || "#C9A84C",
      accent: settings?.color_accent || base.accent || "#F2C4CE",
      ink: base.ink || settings?.color_text || "#2C2C2C",
      ivory: base.ivory || settings?.color_background || "#FAF7F2",
      champagne: base.champagne || settings?.color_primary || "#C9A84C",
      destructive: base.destructive || "#D63B3B",
    };
  }, [presets, settings]);

  // Apply color CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const apply = (token: string, hex: string | null | undefined) => {
      if (isValidHex(hex)) root.style.setProperty(`--${token}`, hexToHsl(hex!));
    };
    apply("background", palette.background);
    apply("ivory", palette.ivory);
    apply("foreground", palette.foreground);
    apply("primary", palette.primary);
    apply("gold", palette.primary);
    apply("champagne", palette.primary);
    apply("primary-foreground", palette.foreground);
    apply("accent", palette.accent);
    apply("accent-foreground", palette.ink);
    apply("brand-accent", palette.accent);
    apply("ink", palette.ink);
    apply("charcoal", palette.ink);
    apply("destructive", palette.destructive);

    // Extended tokens from Theme Studio
    const s2 = settings as any;
    apply("card-border", s2?.card_border_color);
    apply("border", s2?.card_border_color);
    apply("btn-primary", s2?.btn_primary_bg);
    apply("btn-primary-fg", s2?.btn_primary_text);
    apply("btn-secondary-border", s2?.btn_secondary_border);
    apply("btn-secondary-fg", s2?.btn_secondary_text);
    apply("muted-foreground", s2?.color_muted);
    apply("ink-mute", s2?.color_muted);
  }, [palette, settings]);

  // Apply typography, radius, spacing
  useEffect(() => {
    const root = document.documentElement;
    const headingFont = s(settings, "font_heading" as any) || "Cormorant Garamond";
    const bodyFont = s(settings, "font_body" as any) || "Inter";
    const radius = settings?.radius_base ?? 0.875;
    const spacing = settings?.section_spacing ?? 80;
    const baseSize = settings?.font_size_base ?? 16;
    const container = settings?.container_max ?? 1280;
    const s2 = settings as any;

    root.style.setProperty("--font-heading", `'${headingFont}', Georgia, serif`);
    root.style.setProperty("--font-body", `'${bodyFont}', system-ui, sans-serif`);
    root.style.setProperty("--radius", `${radius}rem`);
    root.style.setProperty("--section-spacing", `${spacing}px`);
    root.style.setProperty("--container-max", `${container}px`);
    root.style.setProperty("--font-size-base", `${baseSize}px`);
    root.style.fontSize = `${baseSize}px`;

    // Card + button radius from Theme Studio
    if (s2?.card_border_radius != null) {
      root.style.setProperty("--card-radius", `${s2.card_border_radius}px`);
    }
    if (s2?.btn_border_radius != null) {
      root.style.setProperty("--btn-radius", `${s2.btn_border_radius}px`);
    }
    if (s2?.card_border_width != null) {
      root.style.setProperty("--card-border-width", `${s2.card_border_width}px`);
    }
    if (s2?.line_height_base != null) {
      root.style.setProperty("--line-height-base", String(s2.line_height_base));
    }
  }, [settings]);


  // Inject Google Fonts link for chosen heading + body fonts
  useEffect(() => {
    const headingFont = s(settings, "font_heading" as any) || "Cormorant Garamond";
    const bodyFont = s(settings, "font_body" as any) || "Inter";
    const families = [headingFont, bodyFont]
      .filter((f, i, arr) => arr.indexOf(f) === i)
      .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    let link = document.querySelector<HTMLLinkElement>("link[data-brand-fonts]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-brand-fonts", "true");
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }, [settings]);

  // Inject custom font @font-face if URLs provided
  useEffect(() => {
    const headingUrl = settings?.font_heading_url;
    const bodyUrl = settings?.font_body_url;
    const headingFont = s(settings, "font_heading" as any) || "Cormorant Garamond";
    const bodyFont = s(settings, "font_body" as any) || "Inter";

    let style = document.querySelector<HTMLStyleElement>("style[data-brand-custom-fonts]");
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-brand-custom-fonts", "true");
      document.head.appendChild(style);
    }
    const rules: string[] = [];
    if (headingUrl) rules.push(`@font-face{font-family:'${headingFont}';src:url('${headingUrl}') format('woff2');font-display:swap;}`);
    if (bodyUrl) rules.push(`@font-face{font-family:'${bodyFont}';src:url('${bodyUrl}') format('woff2');font-display:swap;}`);
    style.textContent = rules.join("\n");
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

  // Google Search Console verification + Google Analytics (gtag.js)
  useEffect(() => {
    const s2 = settings as any;
    if (!s2) return;
    const verification: string | null = s2.google_site_verification || null;
    const gaId: string | null = s2.google_analytics_id || null;

    if (verification) {
      let meta = document.querySelector<HTMLMetaElement>("meta[name='google-site-verification']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "google-site-verification");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", verification);
    }

    if (gaId && !document.getElementById("ga-script")) {
      const s1 = document.createElement("script");
      s1.id = "ga-script";
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s1);

      const s2tag = document.createElement("script");
      s2tag.id = "ga-init";
      s2tag.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_title:document.title,page_location:window.location.href});`;
      document.head.appendChild(s2tag);
    }
  }, [(settings as any)?.google_site_verification, (settings as any)?.google_analytics_id]);

  // Google Tag Manager
  useEffect(() => {
    const gtmId: string | null = (settings as any)?.google_tag_manager_id || null;
    if (!gtmId || document.getElementById("gtm-script")) return;
    const script = document.createElement("script");
    script.id = "gtm-script";
    script.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(script);

    // noscript fallback in body
    if (!document.getElementById("gtm-noscript")) {
      const ns = document.createElement("noscript");
      ns.id = "gtm-noscript";
      ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(ns, document.body.firstChild);
    }
  }, [(settings as any)?.google_tag_manager_id]);

  return <>{children}</>;
};

export default BrandProvider;
