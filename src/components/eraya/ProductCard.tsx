import { memo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Heart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
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

const ProductCard = ({ product, showWhatsAppIcon = true }: Props) => {
  const { data: settings } = useSettings();
  const { data: wishlist = [] } = useWishlist();
  const toggle = useToggleWishlist();
  const isSaved = wishlist.some((w) => w.product_id === product.id);
  const pct = discountPct(product);
  const price = product.discounted_price ?? product.original_price;
  const enquiryLabel = s(settings, "product_enquiry_button_label");

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
        style={{ borderColor: "#EDE8E1", borderWidth: 1 }}
      >
        <div className="relative aspect-square bg-muted/30">
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
            <span className="absolute top-2 left-2 bg-charcoal text-white text-[10px] px-2 py-1 rounded-full font-medium">
              {pct}% OFF
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle.mutate({ productId: product.id, isSaved });
            }}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            disabled={toggle.isPending}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white transition-transform hover:scale-110 disabled:opacity-60"
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-gold text-gold" : "text-charcoal"}`} />
          </button>
          {showWhatsAppIcon && (
            <button
              onClick={(e) => {
                e.preventDefault();
                openWhatsAppEnquiry(product, settings);
              }}
              aria-label={enquiryLabel}
              title={enquiryLabel}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white text-gold"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="px-3 pt-2 pb-3">
          {product.categories?.name && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {product.categories.name}
            </p>
          )}
          <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 mt-0.5 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[14px] font-semibold text-gold">{formatINR(price)}</span>
            {product.discounted_price && product.original_price > product.discounted_price && (
              <span className="text-[12px] text-muted-foreground line-through">
                {formatINR(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(ProductCard);
