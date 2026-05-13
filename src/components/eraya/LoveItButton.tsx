import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, type Product, productImage } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsAppEnquiry } from "@/lib/whatsapp";
import { useEnquiryCart } from "@/hooks/useEnquiryCart";
import { useEnquiryCartUI } from "@/components/EnquiryCartProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
}

const LoveItButton = ({ product, className, size = "default" }: Props) => {
  const { data: settings } = useSettings();
  const { addToCart } = useEnquiryCart();
  const { openCart } = useEnquiryCartUI();
  const label = s(settings, "product_enquiry_button_label");
  const color = s(settings, "enquiry_button_color");
  const enquiryMode = (settings?.enquiry_mode || "cart") as "cart" | "direct";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enquiryMode === "direct") {
      openWhatsAppEnquiry(product, settings);
      return;
    }
    addToCart({
      product_id: product.id,
      product_name: product.name,
      product_image: productImage(product),
      price: product.discounted_price ?? product.original_price,
      quantity: 1,
    });
    toast.success("Added to enquiry");
    openCart();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
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
