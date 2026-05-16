import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useProductRatings } from "@/hooks/useProductRatings";
import {
  type Product,
  productImage,
  withImageParams,
} from "@/lib/queries";
import SafeImage from "@/components/ui/SafeImage";
import StarRating from "@/components/eraya/StarRating";

interface Props {
  product: Product;
  showWhatsAppIcon?: boolean;
}

const ProductCard = ({ product }: Props) => {
  const { data: wishlist = [] } = useWishlist();
  const { data: ratings = {} } = useProductRatings();
  const toggle = useToggleWishlist();
  const isSaved = wishlist.some((w) => w.product_id === product.id);

  const hasDiscount =
    !!product.discounted_price && product.original_price > product.discounted_price;
  const pct = hasDiscount
    ? Math.round(
        ((product.original_price - (product.discounted_price as number)) /
          product.original_price) *
          100
      )
    : 0;
  const current = product.discounted_price ?? product.original_price;
  const rating = ratings[product.id];

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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-[#C9A84C] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
              {pct}% OFF
            </div>
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

        <div className="pt-2 md:pt-3 pb-3 px-1 flex flex-col gap-0.5">
          <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground truncate">
            {product.categories?.name || "\u00A0"}
          </p>
          {rating && (
            <div className="mt-0.5">
              <StarRating rating={rating.avg} count={rating.count} size="sm" />
            </div>
          )}
          <h3 className="font-serif text-[12px] md:text-[14px] leading-snug text-foreground line-clamp-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-[15px] font-bold text-[#C9A84C]">
              ₹{current.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span
                className="text-[12px] text-[#9A8F85] line-through decoration-[#9A8F85]"
                style={{ textDecorationThickness: "1.5px" }}
              >
                ₹{product.original_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(ProductCard);
