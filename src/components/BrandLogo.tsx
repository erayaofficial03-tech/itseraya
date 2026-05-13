import { useSettings } from "@/lib/queries";
import erayaLogo from "@/assets/eraya-logo.png";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

/**
 * Renders the store logo. Prefers the admin-uploaded `settings.logo_url`,
 * falls back to the bundled Eraya logo. Use everywhere the brand mark appears.
 */
const BrandLogo = ({ className = "h-10 w-auto", alt }: BrandLogoProps) => {
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
    />
  );
};

export default BrandLogo;
