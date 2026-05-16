import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useProductRatings } from "@/hooks/useProductRatings";
import {
  type Product,
  productImage,
  withImageParams,
  useProductLabels,
  type ProductLabel,
} from "@/lib/queries";
import SafeImage from "@/components/ui/SafeImage";
import StarRating from "@/components/eraya/StarRating";

interface Props {
  product: Product;
  showWhatsAppIcon?: boolean;
  /** When false, suppress the corner micro-label even if the product is tagged. */
  showLabel?: boolean;
}

/**
 * Pick the first matching admin-defined label for this product.
 * Labels come from public.product_labels (managed in /admin/tags).
 * A product matches a label when its `tags` array includes the label's slug.
 */
const pickLabel = (tags: string[] = [], labels: ProductLabel[] = []) => {
  const normalized = tags.map((t) => t.trim().toLowerCase());
  for (const l of labels) {
    if (normalized.includes(l.slug)) return l;
  }
  return null;
};

const toneClass = (tone: "ink" | "champagne" | "blush") => {
  switch (tone) {
    case "champagne":
      return "bg-champagne/95 text-ink";
    case "blush":
      return "bg-ivory/90 text-ink backdrop-blur-sm";
    case "ink":
    default:
      return "bg-ink/90 text-ivory backdrop-blur-sm";
  }
};

const ProductCard = ({ product, showLabel = true }: Props) => {
  const { data: wishlist = [] } = useWishlist();
  const { data: ratings = {} } = useProductRatings();
  const { data: labels = [] } = useProductLabels();
  const toggle = useToggleWishlist();
  const isSaved = wishlist.some((w) => w.product_id === product.id);

  const hasDiscount =
    !!product.discounted_price && product.original_price > product.discounted_price;
  const current = product.discounted_price ?? product.original_price;
  const rating = ratings[product.id];
  const label = showLabel ? pickLabel(product.tags, labels) : null;

  return (
    <Link
      to={`/jewellery/${product.slug ?? product.id}`}
      className="block group h-full"
    >
      <article className="h-full flex flex-col">
        {/* Image — 4:5 editorial portrait */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-warm">
          <SafeImage
            src={withImageParams(productImage(product), 500, 80)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={500}
            height={625}
            className="img-soft-zoom absolute inset-0 w-full h-full object-cover"
          />

          {/* Micro-label */}
          {label && (
            <span
              className={`absolute top-2.5 left-2.5 md:top-3 md:left-3 px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.14em] uppercase ${toneClass(
                label.tone,
              )}`}
            >
              {label.text}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle.mutate({ productId: product.id, isSaved });
            }}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            disabled={toggle.isPending}
            className="absolute top-2.5 right-2.5 md:top-3 md:right-3 h-8 w-8 md:h-9 md:w-9 rounded-full bg-ivory/85 backdrop-blur-sm flex items-center justify-center hover:bg-ivory transition-all ease-luxury active:scale-95 disabled:opacity-60 shadow-soft"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isSaved ? "fill-champagne text-champagne" : "text-ink-soft"
              }`}
              strokeWidth={1.6}
            />
          </button>
        </div>

        {/* Meta */}
        <div className="pt-3 md:pt-4 pb-2 px-0.5 flex flex-col gap-1">
          <p className="font-body text-[10px] tracking-[0.18em] uppercase text-ink-mute truncate">
            {product.categories?.name || "\u00A0"}
          </p>

          <h3 className="font-display text-[15px] md:text-[17px] leading-snug text-ink line-clamp-2 group-hover:text-champagne-deep transition-colors ease-luxury">
            {product.name}
          </h3>

          {rating && (
            <div className="mt-0.5">
              <StarRating rating={rating.avg} count={rating.count} size="sm" />
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap mt-1.5">
            <span className="price-now text-[15px] md:text-[16px]">
              ₹{current.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="price-was text-[12px] md:text-[13px]">
                ₹{product.original_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default memo(ProductCard);
