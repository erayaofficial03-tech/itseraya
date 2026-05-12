import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, type Product } from "@/lib/queries";
import { openWhatsAppEnquiry } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
}

const LoveItButton = ({ product, className, size = "default" }: Props) => {
  const { data: settings } = useSettings();
  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openWhatsAppEnquiry(product, settings);
      }}
      size={size}
      className={cn(
        "bg-gold text-charcoal hover:opacity-90 font-medium shadow-elegant",
        className,
      )}
      style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}
    >
      <Heart className="fill-current" />
      I Love It
    </Button>
  );
};

export default LoveItButton;
