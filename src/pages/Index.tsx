import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import Hero from "@/components/eraya/Hero";
import CategoryRow from "@/components/eraya/CategoryRow";
import ProductRow from "@/components/eraya/ProductRow";
import { useProducts } from "@/lib/queries";
import { ProductGridSkeleton } from "@/components/ui/skeletons";

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const visible = products.filter((p) => p.is_visible);
  const newArrivals = visible.filter((p) => p.tags.includes("new"));
  const trending = visible.filter((p) => p.tags.includes("bestseller"));
  const onSale = visible.filter((p) => p.discounted_price && p.original_price > p.discounted_price);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-6">
        <Hero />
        <CategoryRow />
        {isLoading ? (
          <section className="w-full mb-16 px-6">
            <ProductGridSkeleton count={6} />
          </section>
        ) : (
          <>
            <ProductRow title="New Arrivals" products={newArrivals} viewAllHref="/catalogue" />
            <ProductRow title="Trending Now" products={trending} viewAllHref="/catalogue" />
            <ProductRow title="On Sale" products={onSale} viewAllHref="/catalogue" />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
