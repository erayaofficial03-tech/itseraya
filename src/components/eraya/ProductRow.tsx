import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/queries";

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

const ProductRow = ({ title, products, viewAllHref }: Props) => {
  if (!products.length) return null;

  // Cap every section at 12 products (6×2 desktop / 4×2 tablet / 3×2 mobile)
  const items = products.slice(0, 12);

  // iOS safe-area insets are folded into each breakpoint's base padding via
  // max(...), so cards never get clipped by a notch / rounded corner AND the
  // desktop padding is preserved.
  const padX =
    "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] " +
    "md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] " +
    "lg:pl-[max(2rem,env(safe-area-inset-left))] lg:pr-[max(2rem,env(safe-area-inset-right))]";

  const scrollPadX =
    "[scroll-padding-left:max(1rem,env(safe-area-inset-left))] [scroll-padding-right:max(1rem,env(safe-area-inset-right))] " +
    "md:[scroll-padding-left:max(1.5rem,env(safe-area-inset-left))] md:[scroll-padding-right:max(1.5rem,env(safe-area-inset-right))] " +
    "lg:[scroll-padding-left:max(2rem,env(safe-area-inset-left))] lg:[scroll-padding-right:max(2rem,env(safe-area-inset-right))]";

  return (
    <section className="w-full mb-10 md:mb-16">
      <div className={`flex justify-between items-end mb-4 md:mb-6 ${padX}`}>
        <h2 className="font-serif text-[22px] md:text-3xl text-foreground">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-sm text-gold hover:underline whitespace-nowrap">
            View all →
          </Link>
        )}
      </div>

      {/* Horizontal swipe scroll — 2 rows, responsive columns per viewport */}
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
            auto-cols-[31%]
            md:auto-cols-[23%]
            lg:auto-cols-[15.5%]
            gap-4 md:gap-4 lg:gap-5
          "
        >
          {items.map((p) => (
            <div key={p.id} className="snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRow;
