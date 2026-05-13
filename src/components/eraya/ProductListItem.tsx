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

interface Props {
  product: Product;
}

const ProductListItem = ({ product }: Props) => {
  const { data: wishlist = [] } = useWishlist();
  const toggle = useToggleWishlist();
  const isSaved = wishlist.some((w) => w.product_id === product.id);
  const pct = discountPct(product);
  const price = product.discounted_price ?? product.original_price;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex items-center gap-4 py-3 px-1 active:bg-muted/40 transition-colors"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
        <img
          src={withImageParams(productImage(product), 200, 80)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {pct > 0 && (
          <span className="absolute top-1 left-1 bg-charcoal/90 text-white text-[9px] tracking-wider px-1.5 py-0.5 rounded-sm">
            {pct}%
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground truncate">
          {product.categories?.name || "\u00A0"}
        </p>
        <h3 className="font-serif text-[14px] leading-snug text-foreground line-clamp-2 group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline flex-wrap gap-x-2 mt-1">
          <span className="text-[14px] text-gold font-medium">{formatINR(price)}</span>
          {product.discounted_price && product.original_price > product.discounted_price && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatINR(product.original_price)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle.mutate({ productId: product.id, isSaved });
        }}
        aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        disabled={toggle.isPending}
        className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-muted/60 active:scale-95 disabled:opacity-60"
      >
        <Heart className={`h-4 w-4 ${isSaved ? "fill-gold text-gold" : "text-charcoal"}`} />
      </button>
    </Link>
  );
};

export default memo(ProductListItem);
