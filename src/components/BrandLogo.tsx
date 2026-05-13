import { useSettings } from "@/lib/queries";
import erayaLogoPng from "@/assets/eraya-logo.png";
import erayaLogoWebp from "@/assets/eraya-logo.webp";
import erayaLogo80 from "@/assets/eraya-logo-80.webp";
import erayaLogo160 from "@/assets/eraya-logo-160.webp";
import erayaLogo240 from "@/assets/eraya-logo-240.webp";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  /** Apply dark-background variant (warm gold glow). Defaults to light variant. */
  onDark?: boolean;
}

/**
 * Renders the store logo with adaptive premium metallic finish.
 *
 * - Prefers admin-uploaded `settings.logo_url`; otherwise serves the bundled
 *   wordmark via `<picture>` with WebP + responsive `srcset` (1×/2×/3×) for
 *   crisp high-DPI rendering and minimal payload (~10–35 KB vs 86 KB PNG).
 * - Style is applied via the `.brand-logo` / `.brand-logo-dark` utilities in
 *   `index.css` (layered drop-shadows: bevel, ambient depth, adaptive glow).
 */
const BrandLogo = ({ className = "h-10 w-auto", alt, onDark = false }: BrandLogoProps) => {
  const { data: settings } = useSettings();
  const customSrc = settings?.logo_url;
  const label = alt ?? settings?.store_name ?? "Eraya";
  const variant = onDark ? "brand-logo brand-logo-dark" : "brand-logo";
  const cls = `${variant} ${className}`;

  // Admin-uploaded logo: render plain <img> (unknown dimensions/format).
  if (customSrc) {
    return (
      <img
        src={customSrc}
        alt={label}
        className={cls}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    );
  }

  // Bundled wordmark: serve modern WebP with density-aware srcset, PNG fallback.
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${erayaLogo80} 1x, ${erayaLogo160} 2x, ${erayaLogo240} 3x`}
      />
      <img
        src={erayaLogoPng}
        srcSet={`${erayaLogoWebp} 1x`}
        alt={label}
        className={cls}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </picture>
  );
};

export default BrandLogo;
