import { useEffect } from "react";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

interface Props {
  /** Override the default site title. */
  title?: string;
  /** Override the default meta description. */
  description?: string;
  /** Override the og:image. */
  ogImage?: string;
}

const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

/**
 * Drop into any page to set the document title, meta description, and Open
 * Graph tags. Falls back to admin-configured site-wide SEO defaults.
 */
const SeoHead = ({ title, description, ogImage }: Props) => {
  const { data: settings } = useSettings();

  useEffect(() => {
    const finalTitle = title || s(settings, "seo_title");
    const finalDesc = description || s(settings, "seo_description");
    const finalOg = ogImage || settings?.seo_og_image_url || settings?.hero_image_url || "";
    const url = typeof window !== "undefined" ? window.location.href : "";

    document.title = finalTitle;
    setMeta("meta[name='description']", "name", "description", finalDesc);
    setMeta("meta[property='og:title']", "property", "og:title", finalTitle);
    setMeta("meta[property='og:description']", "property", "og:description", finalDesc);
    setMeta("meta[property='og:url']", "property", "og:url", url);
    setMeta("meta[property='og:type']", "property", "og:type", "website");
    if (finalOg) setMeta("meta[property='og:image']", "property", "og:image", finalOg);
    setMeta("meta[name='twitter:card']", "name", "twitter:card", "summary_large_image");
    setMeta("meta[name='twitter:title']", "name", "twitter:title", finalTitle);
    setMeta("meta[name='twitter:description']", "name", "twitter:description", finalDesc);
    if (finalOg) setMeta("meta[name='twitter:image']", "name", "twitter:image", finalOg);
  }, [title, description, ogImage, settings]);

  return null;
};

export default SeoHead;
