import { useSettings } from "@/lib/queries";
import erayaLogo from "@/assets/eraya-logo.png";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  /** Apply dark-background variant (warm gold glow). Defaults to light variant. */
  onDark?: boolean;
}

/**
 * Renders the store logo with adaptive premium metallic finish.
 * Prefers `settings.logo_url`, falls back to bundled gold-transparent PNG.
 * Uses `.brand-logo` / `.brand-logo-dark` utility classes (see index.css)
 * for layered drop-shadows simulating bevel + ambient depth + hover polish.
 */
const BrandLogo = ({ className = "h-10 w-auto", alt, onDark = false }: BrandLogoProps) => {
  const { data: settings } = useSettings();
  const src = settings?.logo_url || erayaLogo;
  const label = alt ?? settings?.store_name ?? "Eraya";
  const variant = onDark ? "brand-logo brand-logo-dark" : "brand-logo";
  return (
    <img
      src={src}
      alt={label}
      className={`${variant} ${className}`}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
};

export default BrandLogo;
