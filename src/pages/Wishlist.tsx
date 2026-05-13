import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2, LogIn } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistProducts } from "@/hooks/useWishlist";
import ProductCard from "@/components/eraya/ProductCard";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: products = [], isLoading } = useWishlistProducts();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-10 pb-24 lg:pb-16 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-charcoal text-gold flex items-center justify-center">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-foreground">Your Wishlist</h1>
            <p className="text-sm text-muted-foreground">
              {user ? `${products.length} saved ${products.length === 1 ? "piece" : "pieces"}` : "Sign in to view saved pieces"}
            </p>
          </div>
        </div>

        {authLoading || (user && isLoading) ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : !user ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">
              Log in to save pieces and revisit them anytime.
            </p>
            <Button onClick={() => navigate("/login")}>
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">
              No saved pieces yet. Tap the <Heart className="inline h-4 w-4 text-gold" /> on any
              product to add it here.
            </p>
            <Button asChild>
              <Link to="/catalogue">Explore catalogue</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
