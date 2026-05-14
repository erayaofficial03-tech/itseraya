import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import {
  type Product,
  formatINR,
  productImage,
  discountPct,
  withImageParams,
} from "@/lib/queries";
import SafeImage from "@/components/ui/SafeImage";

interface Props {
  product: Product;
  showWhatsAppIcon?: boolean;
}

const ProductCard = ({ product }: Props) => {
  const { data: wishlist = [] } = useWishlist();
  const toggle = useToggleWishlist();
  const isSaved = wishlist.some((w) => w.product_id === product.id);
  const pct = discountPct(product);
  const price = product.discounted_price ?? product.original_price;

  return (
    <Link to={`/jewellery/${product.slug ?? product.id}`} className="block group h-full">
      <div className="h-full flex flex-col bg-background">
        <div className="relative aspect-square bg-muted/30 overflow-hidden">
          <SafeImage
            src={withImageParams(productImage(product), 400, 80)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {pct > 0 && (
            <span className="absolute top-2 left-2 bg-charcoal/90 text-white text-[9px] tracking-wider px-1.5 py-0.5 rounded-sm font-light">
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
            className="absolute top-2 right-2 h-7 w-7 md:h-8 md:w-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition active:scale-95 disabled:opacity-60"
          >
            <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-gold text-gold" : "text-charcoal"}`} />
          </button>
        </div>
        <div className="pt-2 md:pt-3 pb-2 flex flex-col gap-0.5">
          <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground truncate">
            {product.categories?.name || "\u00A0"}
          </p>
          <h3 className="font-serif text-[12px] md:text-[14px] leading-snug text-foreground line-clamp-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline flex-wrap gap-x-2 mt-0.5">
            <span className="text-[12px] md:text-[14px] text-gold font-medium whitespace-nowrap">
              {formatINR(price)}
            </span>
            {product.discounted_price && product.original_price > product.discounted_price && (
              <span className="text-[10px] md:text-[11px] text-muted-foreground line-through whitespace-nowrap">
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
