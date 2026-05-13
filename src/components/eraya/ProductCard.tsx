import { memo } from "react";
import { Link } from "react-router-dom";
import { Plus, Heart } from "lucide-react";
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
import { useEnquiryCart } from "@/hooks/useEnquiryCart";
import { useEnquiryCartUI } from "@/components/EnquiryCartProvider";
import { toast } from "sonner";

interface Props {
  product: Product;
  showWhatsAppIcon?: boolean;
}

const ProductCard = ({ product, showWhatsAppIcon = true }: Props) => {
  const { data: settings } = useSettings();
  const { data: wishlist = [] } = useWishlist();
  const toggle = useToggleWishlist();
  const { addToCart } = useEnquiryCart();
  const { openCart } = useEnquiryCartUI();
  const isSaved = wishlist.some((w) => w.product_id === product.id);
  const pct = discountPct(product);
  const price = product.discounted_price ?? product.original_price;
  const enquiryMode = (settings?.enquiry_mode || "cart") as "cart" | "direct";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enquiryMode === "direct") {
      openWhatsAppEnquiry(product, settings, "product_card");
      return;
    }
    addToCart({
      product_id: product.id,
      product_name: product.name,
      product_image: productImage(product),
      price,
      quantity: 1,
    });
    toast.success("Added to enquiry", {
      action: { label: "View", onClick: () => openCart() },
    });
  };

  return (
    <Link to={`/product/${product.id}`} className="block group h-full">
      <div
        className="h-full flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
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
            className="absolute top-1.5 right-1.5 h-7 w-7 md:h-9 md:w-9 rounded-full bg-white/60 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition active:scale-95 disabled:opacity-60"
          >
            <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isSaved ? "fill-gold text-gold" : "text-charcoal"}`} />
          </button>
          {showWhatsAppIcon && (
            <button
              onClick={handleAdd}
              aria-label="Add to enquiry"
              title="Add to enquiry"
              className="absolute bottom-1.5 right-1.5 h-7 w-7 md:h-9 md:w-9 rounded-full bg-gold/80 backdrop-blur-sm text-white flex items-center justify-center shadow-sm active:scale-95 transition hover:bg-gold"
            >
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={3} />
            </button>
          )}
        </div>
        <div className="px-2 md:px-3 pt-1.5 pb-2 md:pb-3 flex flex-col flex-1">
          <p className="text-[8px] md:text-[10px] uppercase tracking-wider md:tracking-widest text-muted-foreground truncate min-h-[12px] md:min-h-[14px]">
            {product.categories?.name || "\u00A0"}
          </p>
          <h3 className="font-serif text-[11px] md:text-[13px] font-medium md:font-semibold leading-snug text-foreground line-clamp-2 mt-0.5 min-h-[28px] md:min-h-[34px] group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0 mt-auto pt-1 min-w-0">
            <span className="text-[12px] md:text-[14px] font-semibold text-gold whitespace-nowrap">{formatINR(price)}</span>
            {product.discounted_price && product.original_price > product.discounted_price && (
              <span className="text-[10px] md:text-[12px] text-muted-foreground line-through whitespace-nowrap">
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
