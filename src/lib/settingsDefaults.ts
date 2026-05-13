import type { Settings } from "./queries";

export const SETTINGS_DEFAULTS = {
  store_name: "Eraya",
  tagline: "Adorn Your Story",
  color_primary: "#C9A84C",
  color_background: "#FAF7F2",
  color_text: "#2C2C2C",
  color_accent: "#F2C4CE",

  hero_headline: "Adorn Your Story",
  hero_subtext: "Discover handcrafted artificial jewellery designed to celebrate every woman.",
  hero_cta_label: "Shop the Collection",
  hero_cta_url: "/catalogue",
  hero_overlay_opacity: 40,

  section_categories_title: "Shop by Category",
  section_categories_visible: true,
  section_new_arrivals_title: "New Arrivals",
  section_new_arrivals_visible: true,
  section_trending_title: "Trending Now",
  section_trending_visible: true,
  section_sale_title: "On Sale",
  section_sale_visible: true,
  section_featured_title: "Featured",
  section_featured_visible: true,

  nav_home_label: "Home",
  nav_catalogue_label: "Catalogue",
  nav_show_search: true,

  product_enquiry_button_label: "I Love It",
  product_share_button_label: "Share",
  product_pdf_button_label: "Save as PDF",
  product_description_label: "About this piece",
  product_related_title: "You may also like",
  product_tag_visible: true,

  catalogue_heading: "Our Catalogue",
  catalogue_subtext: "Browse the full Eraya collection.",
  catalogue_download_label: "Download Full Catalogue as PDF",
  category_empty_message: "No products in this category yet.",
  category_pieces_label: "pieces",

  whatsapp_message_template:
    "Hi Eraya! I love this product and would like to know more 😍\n\n*{product_name}*\nPrice: {price}\n\nProduct Link: {url}",
  catalogue_whatsapp_message_template:
    "Hi! Here is the latest *{store_name}* catalogue ✨\n\nBrowse the full collection: {url}\n\nThe catalogue PDF has been downloaded — please attach it from your files.",
  enquiry_button_color: "#C9A84C",

  footer_tagline: "Adorn Your Story",
  footer_copyright: "© {year} Eraya. All rights reserved.",
  footer_show_logo: true,
  footer_show_social: true,
  footer_show_whatsapp: true,
  footer_whatsapp_label: "Chat with us",
  footer_links_visible: true,

  announcement_visible: false,
  announcement_text: "🎉 Free delivery on orders above ₹999!",
  announcement_bg_color: "#C9A84C",
  announcement_text_color: "#2C2C2C",
  announcement_dismissible: true,

  pdf_store_name: "Eraya",
  pdf_tagline: "Adorn Your Story",
  pdf_footer_text: "For enquiries, WhatsApp us at +{whatsapp}",
  pdf_primary_color: "#C9A84C",

  seo_title: "Eraya — Adorn Your Story | Artificial Jewellery for Women",
  seo_description:
    "Eraya offers handcrafted artificial jewellery for women — rings, earrings, necklaces, bangles and more.",

  store_city: "India",

  pwa_name: "Eraya",
  pwa_short_name: "Eraya",
  pwa_description: "Adorn Your Story — Artificial Jewellery for Women",
  pwa_theme_color: "#C9A84C",
  pwa_background_color: "#FAF7F2",

  install_prompt_visible: true,
  install_prompt_text: "Add Eraya to your home screen",
  install_prompt_button_label: "Install App",

  admin_panel_title: "Eraya Admin",
  admin_welcome_message: "Welcome back to Eraya admin.",
  admin_brand_color: "#C9A84C",
} as const;

type Defaults = typeof SETTINGS_DEFAULTS;

/** Read a setting field with its baseline default fallback. */
export const s = <K extends keyof Defaults>(
  settings: Settings | undefined | null,
  key: K,
): Defaults[K] => {
  const raw = settings ? (settings as unknown as Record<string, unknown>)[key as string] : undefined;
  if (raw === null || raw === undefined || raw === "") return SETTINGS_DEFAULTS[key];
  return raw as Defaults[K];
};
