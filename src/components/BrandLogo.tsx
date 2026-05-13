import { useSettings } from "@/lib/queries";
import erayaLogo from "@/assets/eraya-logo.png";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  /** Apply a subtle drop shadow for use on dark backgrounds (e.g. admin sidebar). */
  onDark?: boolean;
}

/**
 * Renders the store logo. Prefers the admin-uploaded `settings.logo_url`,
 * falls back to the bundled gold-transparent Eraya logo. Use everywhere the
 * brand mark appears. Never rendered as text.
 */
const BrandLogo = ({ className = "h-10 w-auto", alt, onDark = false }: BrandLogoProps) => {
  const { data: settings } = useSettings();
  const src = settings?.logo_url || erayaLogo;
  const label = alt ?? settings?.store_name ?? "Eraya";
  return (
    <img
      src={src}
      alt={label}
      className={className}
      loading="eager"
      decoding="async"
      style={onDark ? { filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" } : { filter: "none" }}
    />
  );
};

export default BrandLogo;
