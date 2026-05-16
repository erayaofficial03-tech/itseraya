export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  text_color: string | null;
  is_active: boolean;
  display_order: number;
  starts_at: string | null;
  expires_at: string | null;

  // Heading
  heading_text: string | null;
  heading_font_family: string | null;
  heading_font_size_mobile: number | null;
  heading_font_size_desktop: number | null;
  heading_font_weight: string | null;
  heading_italic: boolean | null;
  heading_uppercase: boolean | null;
  heading_letter_spacing: number | null;
  heading_line_height: number | null;
  heading_color: string | null;
  heading_opacity: number | null;

  // Subheading
  subheading_text: string | null;
  subheading_font_family: string | null;
  subheading_font_size_mobile: number | null;
  subheading_font_size_desktop: number | null;
  subheading_font_weight: string | null;
  subheading_italic: boolean | null;
  subheading_uppercase: boolean | null;
  subheading_letter_spacing: number | null;
  subheading_color: string | null;
  subheading_opacity: number | null;

  // Layout
  content_h_align: string | null;
  content_v_align: string | null;
  content_padding_x: number | null;
  content_padding_y: number | null;
  content_max_width: number | null;

  // Button
  btn_visible: boolean | null;
  btn_text: string | null;
  btn_url: string | null;
  btn_bg_color: string | null;
  btn_text_color: string | null;
  btn_border_color: string | null;
  btn_border_width: number | null;
  btn_border_radius: number | null;
  btn_font_size: number | null;
  btn_font_weight: string | null;
  btn_italic: boolean | null;
  btn_letter_spacing: number | null;
  btn_padding_x: number | null;
  btn_padding_y: number | null;
  btn_shadow: boolean | null;
  btn_align: string | null;
  btn_full_width_mobile: boolean | null;

  // Overlay & background
  overlay_color: string | null;
  overlay_opacity: number | null;
  overlay_gradient: boolean | null;
  bg_focal_x: number | null;
  bg_focal_y: number | null;

  // Dimensions & timing
  height_mobile: number | null;
  height_desktop: number | null;
  autoplay_duration: number | null;
  transition: string | null;
};

export const hexWithAlpha = (hex: string, opacityPct: number) => {
  const clean = (hex || "#000000").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const a = Math.max(0, Math.min(100, opacityPct));
  const alpha = Math.round((a / 100) * 255).toString(16).padStart(2, "0");
  return `#${full}${alpha}`;
};
