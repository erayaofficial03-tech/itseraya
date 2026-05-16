import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/queries";

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
  eyebrow?: string;
}

const ProductRow = ({ title, products, viewAllHref, eyebrow }: Props) => {
  if (!products.length) return null;

  // Cap every section at 12 products (6×2 desktop / 4×2 tablet / 3×2 mobile)
  const items = products.slice(0, 12);

  const padX =
    "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] " +
    "md:pl-[max(2rem,env(safe-area-inset-left))] md:pr-[max(2rem,env(safe-area-inset-right))] " +
    "lg:pl-[max(2.5rem,env(safe-area-inset-left))] lg:pr-[max(2.5rem,env(safe-area-inset-right))]";

  const scrollPadX =
    "[scroll-padding-left:max(1rem,env(safe-area-inset-left))] [scroll-padding-right:max(1rem,env(safe-area-inset-right))] " +
    "md:[scroll-padding-left:max(2rem,env(safe-area-inset-left))] md:[scroll-padding-right:max(2rem,env(safe-area-inset-right))] " +
    "lg:[scroll-padding-left:max(2.5rem,env(safe-area-inset-left))] lg:[scroll-padding-right:max(2.5rem,env(safe-area-inset-right))]";

  return (
    <section className="w-full section-y">
      {/* Section header */}
      <div className={`flex justify-between items-end mb-6 md:mb-10 ${padX}`}>
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className="font-display text-[28px] md:text-4xl lg:text-5xl text-ink mt-1">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="font-display italic text-base md:text-lg text-ink hover:text-champagne-deep transition-colors ease-luxury underline-offset-[6px] decoration-champagne/60 hover:underline whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </div>

      {/* Horizontal swipe scroll — 2 rows */}
      <div
        className={`
          overflow-x-auto overflow-y-hidden scrollbar-hide pb-3
          ${padX} ${scrollPadX}
          [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain]
          snap-x snap-mandatory scroll-smooth
        `}
      >
        <div
          className="
            grid grid-rows-2 grid-flow-col
            auto-cols-[44%]
            md:auto-cols-[26%]
            lg:auto-cols-[17%]
            gap-4 md:gap-5 lg:gap-6
          "
        >
          {items.map((p, i) => (
            <div key={p.id} className="snap-start">
              {/* Only the first 3 cards per row show a micro-label to keep the grid calm */}
              <ProductCard product={p} showLabel={i < 3} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRow;
