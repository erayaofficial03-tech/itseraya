import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/queries";

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

const ProductRow = ({ title, products, viewAllHref }: Props) => {
  if (!products.length) return null;
  return (
    <section className="w-full mb-10 md:mb-16 px-4 md:px-6">
      <div className="flex justify-between items-end mb-4 md:mb-6">
        <h2 className="font-serif text-[22px] md:text-3xl text-foreground">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-sm text-gold hover:underline">
            View all →
          </Link>
        )}
      </div>

      {/* Mobile: 3-column grid */}
      <div className="md:hidden grid grid-cols-3 gap-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Tablet & desktop: carousel */}
      <div className="hidden md:block">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent className="-ml-4 lg:-ml-5">
            {products.map((p) => (
              <CarouselItem
                key={p.id}
                className="pl-4 lg:pl-5 md:basis-1/4 lg:basis-1/6"
              >
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default ProductRow;
