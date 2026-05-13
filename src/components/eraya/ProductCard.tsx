import { memo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Heart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { Card, CardContent } from "@/components/ui/card";
import {
  type Product,
  formatINR,
  productImage,
  discountPct,
  withImageParams,
  useSettings,
} from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsAppEnquiry } from "@/lib/whatsapp";

interface Props {
  product: Product;
  showWhatsAppIcon?: boolean;
}

const ProductCard = ({ product, showWhatsAppIcon }: Props) => {
  const { data: settings } = useSettings();
  const pct = discountPct(product);
  const price = product.discounted_price ?? product.original_price;
  const enquiryColor = s(settings, "enquiry_button_color");
  const enquiryLabel = s(settings, "product_enquiry_button_label");

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="aspect-square mb-3 overflow-hidden bg-muted/30 relative rounded-md">
            <img
              src={withImageParams(productImage(product), 400, 80)}
              alt={product.name}
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {pct > 0 && (
              <span
                className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded text-charcoal"
                style={{ background: enquiryColor }}
              >
                {pct}% OFF
              </span>
            )}
            {showWhatsAppIcon && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  openWhatsAppEnquiry(product, settings);
                }}
                aria-label={enquiryLabel}
                title={enquiryLabel}
                className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white"
                style={{ color: enquiryColor }}
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="space-y-1 px-1">
            {product.categories?.name && (
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {product.categories.name}
              </p>
            )}
            <h3 className="font-serif text-base text-foreground group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-medium text-foreground">{formatINR(price)}</span>
              {product.discounted_price && product.original_price > product.discounted_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default memo(ProductCard);
