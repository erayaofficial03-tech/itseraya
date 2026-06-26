import { Link, useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/layout/PageTransition";
import { Heart, Loader2, ArrowLeft, Share2 } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistProducts } from "@/hooks/useWishlist";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import ProductCard from "@/components/eraya/ProductCard";
import erayaLogo from "@/assets/eraya-logo.png";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: products = [], isLoading } = useWishlistProducts();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead title={`My Wishlist — ${s(settings, "store_name")}`} />
      <Header />
      <main className="flex-1 px-4 md:px-6 py-6 pb-24 md:pb-16 max-w-6xl mx-auto w-full"><PageTransition>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-full border border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-serif text-[24px] md:text-3xl text-foreground">
            Your Wishlist
          </h1>
          {user && products.length > 0 && (
            <span className="ml-1 text-xs bg-gold/15 text-gold rounded-full px-2 py-0.5 font-medium">
              {products.length}
            </span>
          )}
          {user && products.length > 0 && (
            <button
              onClick={async () => {
                const url = window.location.href;
                try {
                  if (navigator.share) {
                    await navigator.share({ title: "My Eraya Wishlist", url });
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  }
                } catch {
                  /* user cancelled share */
                }
              }}
              className="ml-auto text-sm text-gold flex items-center gap-1 hover:underline"
              aria-label="Share wishlist"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          )}
        </div>

        {authLoading || (user && isLoading) ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : !user ? (
          <div className="text-center py-12 max-w-sm mx-auto">
            <img src={erayaLogo} alt="Eraya" draggable={false} className="brand-logo h-12 mx-auto mb-5 object-contain" />
            <p className="text-foreground font-medium mb-2">Sign in to save your favourite pieces</p>
            <p className="text-sm text-muted-foreground mb-6">
              Your wishlist syncs across devices once you sign in.
            </p>
            <Button onClick={google} variant="outline" className="w-full mb-2">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5.06c1.84 0 3.5.68 4.79 1.79l3.36-3.36C18.06 1.45 15.23 0 12 0 7.31 0 3.26 2.69 1.28 6.6l3.99 3.16Z"/><path fill="#34A853" d="M16.04 18.01A7.06 7.06 0 0 1 12 19c-3.06 0-5.66-2-6.6-4.78l-3.99 3.07A11.99 11.99 0 0 0 12 24c2.93 0 5.74-1.05 7.81-3l-3.77-2.99Z"/><path fill="#4A90E2" d="M19.81 21c2.16-2.01 3.55-5 3.55-9 0-.74-.06-1.45-.16-2.13H12v4.51h6.4a5.49 5.49 0 0 1-2.36 3.62l3.77 2.99Z"/><path fill="#FBBC05" d="M5.4 14.22A7.04 7.04 0 0 1 5 12c0-.78.13-1.52.37-2.22L1.38 6.6A12 12 0 0 0 0 12c0 1.94.46 3.76 1.28 5.39l4.12-3.17Z"/></svg>
              Continue with Google
            </Button>
            <Button onClick={() => navigate("/login")} variant="ghost" className="w-full text-sm">
              More sign-in options
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
              <Heart className="h-7 w-7 text-gold" />
            </div>
            <p className="text-foreground font-medium mb-2">No saved pieces yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Tap the heart on any product to add it here.
            </p>
            <Button asChild>
              <Link to="/catalogue">Explore Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </PageTransition></main>
      <Footer />
    </div>
  );
};

export default Wishlist;
