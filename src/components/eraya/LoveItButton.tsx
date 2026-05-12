import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, type Product } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsAppEnquiry } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
}

const LoveItButton = ({ product, className, size = "default" }: Props) => {
  const { data: settings } = useSettings();
  const label = s(settings, "product_enquiry_button_label");
  const color = s(settings, "enquiry_button_color");
  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openWhatsAppEnquiry(product, settings);
      }}
      size={size}
      className={cn("text-charcoal hover:opacity-90 font-medium shadow-elegant", className)}
      style={{ backgroundColor: color, color: "hsl(var(--charcoal))" }}
    >
      <Heart className="fill-current" />
      {label}
    </Button>
  );
};

export default LoveItButton;
