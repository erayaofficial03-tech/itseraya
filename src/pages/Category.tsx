import { useParams, Link } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ProductCard from "@/components/eraya/ProductCard";
import { useCategories, useProducts } from "@/lib/queries";

const Category = () => {
  const { category: slug } = useParams();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const cat = categories.find((c) => c.slug === slug);
  const filtered = products.filter(
    (p) => p.is_visible && (cat ? p.category_id === cat.id : true),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-6 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">
            {cat?.name || "All Products"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{filtered.length} pieces</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No products in this category yet.</p>
            <Link to="/" className="text-gold underline">Back to home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Category;
