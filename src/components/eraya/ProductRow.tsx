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
    <section className="w-full mb-16 px-6">
      <div className="flex justify-between items-end mb-6">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-sm text-gold hover:underline">
            View all →
          </Link>
        )}
      </div>
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent>
          {products.map((p) => (
            <CarouselItem key={p.id} className="basis-1/3 md:basis-1/4 lg:basis-1/6 pr-2 md:pr-3">
              <ProductCard product={p} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default ProductRow;
