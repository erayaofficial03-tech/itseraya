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
  }, [palette]);

  // Apply typography, radius, spacing
  useEffect(() => {
    const root = document.documentElement;
    const headingFont = s(settings, "font_heading" as any) || "Cormorant Garamond";
    const bodyFont = s(settings, "font_body" as any) || "Inter";
    const radius = settings?.radius_base ?? 0.875;
    const spacing = settings?.section_spacing ?? 80;
    const baseSize = settings?.font_size_base ?? 16;
    const container = settings?.container_max ?? 1280;

    root.style.setProperty("--font-heading", `'${headingFont}', Georgia, serif`);
    root.style.setProperty("--font-body", `'${bodyFont}', system-ui, sans-serif`);
    root.style.setProperty("--radius", `${radius}rem`);
    root.style.setProperty("--section-spacing", `${spacing}px`);
    root.style.setProperty("--container-max", `${container}px`);
    root.style.fontSize = `${baseSize}px`;
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

  return <>{children}</>;
};

export default BrandProvider;
