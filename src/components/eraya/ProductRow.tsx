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

  return (
    <section className="w-full mb-10 md:mb-16">
      <div className="flex justify-between items-end mb-4 md:mb-6 px-4 md:px-6 lg:px-8">
        <h2 className="font-serif text-[22px] md:text-3xl text-foreground">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-sm text-gold hover:underline whitespace-nowrap">
            View all →
          </Link>
        )}
      </div>

      {/* Horizontal swipe scroll — 2 rows, responsive columns per viewport */}
      <div
        className="
          overflow-x-auto overflow-y-hidden scrollbar-hide
          px-4 md:px-6 lg:px-8 pb-3
          scroll-pl-4 md:scroll-pl-6 lg:scroll-pl-8
          scroll-pr-4 md:scroll-pr-6 lg:scroll-pr-8
          [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain]
          snap-x snap-mandatory scroll-smooth
        "
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
