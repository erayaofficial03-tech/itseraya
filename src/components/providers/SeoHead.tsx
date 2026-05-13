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
  /** og:type — "website" | "product" | "article" */
  ogType?: string;
  /** Canonical URL for this page. */
  canonical?: string;
  /** Comma-separated keywords. */
  keywords?: string;
  /** Image alt text for og:image:alt. */
  ogImageAlt?: string;
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

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.href = href;
};

/**
 * Drop into any page to set the document title, meta description, canonical,
 * keywords, and Open Graph tags. Falls back to admin-configured site-wide SEO.
 */
const SeoHead = ({ title, description, ogImage, ogType, canonical, keywords, ogImageAlt }: Props) => {
  const { data: settings } = useSettings();

  useEffect(() => {
    const finalTitle = title || s(settings, "seo_title");
    const finalDesc = description || s(settings, "seo_description");
    const finalOg = ogImage || settings?.seo_og_image_url || settings?.hero_image_url || "";
    const url = canonical || (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");
    const finalType = ogType || "website";

    document.title = finalTitle;
    setMeta("meta[name='description']", "name", "description", finalDesc);
    if (keywords) setMeta("meta[name='keywords']", "name", "keywords", keywords);

    setMeta("meta[property='og:title']", "property", "og:title", finalTitle);
    setMeta("meta[property='og:description']", "property", "og:description", finalDesc);
    setMeta("meta[property='og:url']", "property", "og:url", url);
    setMeta("meta[property='og:type']", "property", "og:type", finalType);
    if (finalOg) {
      setMeta("meta[property='og:image']", "property", "og:image", finalOg);
      setMeta("meta[property='og:image:width']", "property", "og:image:width", "1200");
      setMeta("meta[property='og:image:height']", "property", "og:image:height", "630");
      if (ogImageAlt) setMeta("meta[property='og:image:alt']", "property", "og:image:alt", ogImageAlt);
    }

    setMeta("meta[name='twitter:card']", "name", "twitter:card", "summary_large_image");
    setMeta("meta[name='twitter:title']", "name", "twitter:title", finalTitle);
    setMeta("meta[name='twitter:description']", "name", "twitter:description", finalDesc);
    if (finalOg) setMeta("meta[name='twitter:image']", "name", "twitter:image", finalOg);

    if (url) setLink("canonical", url);
  }, [title, description, ogImage, ogType, canonical, keywords, ogImageAlt, settings]);

  return null;
};

export default SeoHead;
