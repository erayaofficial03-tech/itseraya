import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeUrl } from "@/lib/safeUrl";
import { type Banner, hexWithAlpha } from "./banner-types";

interface Props {
  banner: Banner;
  viewport: "mobile" | "tablet" | "desktop";
  height: number;
  /** If false, use anchor tag (for previews); default true uses Router Link */
  useRouter?: boolean;
  /** Track click in banner_clicks */
  trackClicks?: boolean;
  /** Track impression in banner_impressions (default true when trackClicks is true) */
  trackImpressions?: boolean;
  /** Key for animation transitions */
  animKey?: string;
}

export const BannerRenderer = ({
  banner,
  viewport,
  height,
  useRouter = true,
  trackClicks = true,
  trackImpressions,
  animKey,
}: Props) => {
  const shouldTrackImpressions = trackImpressions ?? trackClicks;

  useEffect(() => {
    if (!shouldTrackImpressions) return;
    if (!banner.id || banner.id === "__fallback__") return;
    const path = window.location.pathname;
    const key = `banner_imp_${banner.id}_${path}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* ignore */ }
    void supabase.from("banner_impressions").insert({ banner_id: banner.id, page_path: path });
  }, [banner.id, shouldTrackImpressions]);

  const isDesktop = viewport === "desktop";
  const isTablet = viewport === "tablet";

  // Pick mobile image on mobile viewport when available, fall back across fields
  const resolvedImage =
    (viewport === "mobile" && banner.image_mobile_url) ||
    banner.image_url ||
    banner.image_mobile_url ||
    "";

  const headingSize = isDesktop
    ? banner.heading_font_size_desktop ?? 48
    : isTablet
    ? Math.round(((banner.heading_font_size_mobile ?? 28) + (banner.heading_font_size_desktop ?? 48)) / 2)
    : banner.heading_font_size_mobile ?? 28;

  const subheadingSize = isDesktop
    ? banner.subheading_font_size_desktop ?? 18
    : isTablet
    ? Math.round(((banner.subheading_font_size_mobile ?? 14) + (banner.subheading_font_size_desktop ?? 18)) / 2)
    : banner.subheading_font_size_mobile ?? 14;

  const hAlign = banner.content_h_align || "left";
  const vAlign = banner.content_v_align || "center";

  const alignClass =
    hAlign === "center" ? "items-center text-center" :
    hAlign === "right" ? "items-end text-right" :
    "items-start text-left";

  const justifyClass =
    vAlign === "top" ? "justify-start" :
    vAlign === "bottom" ? "justify-end" :
    "justify-center";

  const overlayColor = banner.overlay_color || "#000000";
  const overlayOpacity = banner.overlay_opacity ?? 40;
  const overlayBg = banner.overlay_gradient
    ? `linear-gradient(to right, ${hexWithAlpha(overlayColor, overlayOpacity)} 0%, ${hexWithAlpha(overlayColor, Math.max(0, overlayOpacity - 30))} 60%, ${hexWithAlpha(overlayColor, 0)} 100%)`
    : hexWithAlpha(overlayColor, overlayOpacity);

  const btnStyle: React.CSSProperties = {
    display: banner.btn_full_width_mobile && viewport === "mobile" ? "block" : "inline-block",
    backgroundColor: banner.btn_bg_color || "#C9A84C",
    color: banner.btn_text_color || "#FFFFFF",
    borderRadius: `${banner.btn_border_radius ?? 50}px`,
    border: `${banner.btn_border_width ?? 0}px solid ${banner.btn_border_color || "transparent"}`,
    fontSize: `${banner.btn_font_size ?? 14}px`,
    fontWeight: banner.btn_font_weight || "600",
    fontStyle: banner.btn_italic ? "italic" : "normal",
    letterSpacing: `${banner.btn_letter_spacing ?? 0}px`,
    padding: `${banner.btn_padding_y ?? 14}px ${banner.btn_padding_x ?? 28}px`,
    boxShadow: banner.btn_shadow ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
    textDecoration: "none",
    cursor: "pointer",
  };

  const onCtaClick = () => {
    if (trackClicks && banner.id && banner.id !== "__fallback__") {
      void supabase.from("banner_clicks").insert({ banner_id: banner.id, page_path: window.location.pathname });
    }
  };

  const ButtonEl = banner.btn_visible !== false && banner.btn_text && (
    <div style={{ textAlign: (banner.btn_align as React.CSSProperties["textAlign"]) || "left", width: "100%" }}>
      {useRouter ? (
        <Link to={safeUrl(banner.btn_url || "/catalogue")} onClick={onCtaClick} style={btnStyle}>
          {banner.btn_text}
        </Link>
      ) : (
        <a href={banner.btn_url || "/catalogue"} onClick={(e) => { e.preventDefault(); onCtaClick(); }} style={btnStyle}>
          {banner.btn_text}
        </a>
      )}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={animKey || banner.id}
          src={banner.image_url || ""}
          alt={banner.heading_text || banner.title || "Banner"}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: `${banner.bg_focal_x ?? 50}% ${banner.bg_focal_y ?? 50}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none" style={{ background: overlayBg }} />

      <div
        className={`relative z-10 h-full flex flex-col ${justifyClass} ${alignClass}`}
        style={{
          padding: `${banner.content_padding_y ?? 32}px ${banner.content_padding_x ?? 24}px`,
        }}
      >
        <div style={{ maxWidth: banner.content_max_width ?? 560, width: "100%" }}>
          {banner.heading_text && (
            <h1
              style={{
                fontFamily: banner.heading_font_family || "Playfair Display",
                fontSize: headingSize,
                fontWeight: banner.heading_font_weight || "bold",
                fontStyle: banner.heading_italic ? "italic" : "normal",
                textTransform: banner.heading_uppercase ? "uppercase" : "none",
                letterSpacing: `${banner.heading_letter_spacing ?? 0}px`,
                lineHeight: banner.heading_line_height ?? 1.2,
                color: banner.heading_color || "#FFFFFF",
                opacity: (banner.heading_opacity ?? 100) / 100,
                marginBottom: 8,
              }}
            >
              {banner.heading_text}
            </h1>
          )}

          {banner.subheading_text && (
            <p
              style={{
                fontFamily: banner.subheading_font_family || "Inter",
                fontSize: subheadingSize,
                fontWeight: banner.subheading_font_weight || "normal",
                fontStyle: banner.subheading_italic ? "italic" : "normal",
                textTransform: banner.subheading_uppercase ? "uppercase" : "none",
                letterSpacing: `${banner.subheading_letter_spacing ?? 0}px`,
                color: banner.subheading_color || "#FFFFFF",
                opacity: (banner.subheading_opacity ?? 85) / 100,
                marginBottom: 20,
              }}
            >
              {banner.subheading_text}
            </p>
          )}

          {ButtonEl}
        </div>
      </div>
    </div>
  );
};
