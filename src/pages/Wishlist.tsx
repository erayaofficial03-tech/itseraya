import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-16 pb-24 lg:pb-16 max-w-xl mx-auto w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-charcoal text-gold flex items-center justify-center mb-6">
          <Heart className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-3">Your Wishlist</h1>
        <p className="text-muted-foreground mb-8">
          Saved pieces will appear here soon. In the meantime, browse the catalogue and tap{" "}
          <span className="text-gold font-medium">I Love It</span> to enquire on WhatsApp.
        </p>
        <Button asChild>
          <Link to="/catalogue">Explore catalogue</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
