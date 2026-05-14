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

  const tabletProducts = products.slice(0, 8);
  const desktopProducts = products.slice(0, 12);

  return (
    <section className="w-full mb-10 md:mb-16">
      <div className="flex justify-between items-end mb-4 md:mb-6 px-4 md:px-6">
        <h2 className="font-serif text-[22px] md:text-3xl text-foreground">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-sm text-gold hover:underline">
            View all →
          </Link>
        )}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex overflow-x-auto gap-3 px-4 pb-3 snap-x snap-mandatory scrollbar-hide">
        {products.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-44 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Tablet: 4 columns × 2 rows = 8 */}
      <div className="hidden md:grid lg:hidden grid-cols-4 gap-4 px-6">
        {tabletProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Desktop: 6 columns × 2 rows = 12 */}
      <div className="hidden lg:grid grid-cols-6 gap-5 px-6">
        {desktopProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default ProductRow;
