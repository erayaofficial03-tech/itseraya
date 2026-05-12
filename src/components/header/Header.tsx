import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Menu, X, User, LogOut, Search, ShoppingBag, MessageCircle } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings, useCategories, useProducts } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Header = () => {
  const { data: settings } = useSettings();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const logo = settings?.logo_url || erayaLogo;

  const visibleCategories = categories.filter((c) => c.is_visible);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, products]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? "text-gold" : "text-foreground hover:text-gold"
    }`;

  const initials = user?.email?.[0]?.toUpperCase() || "U";

  const openWhatsApp = () => {
    const wa = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!wa) {
      toast.info("WhatsApp number not set yet — check back soon.");
      return;
    }
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent("Hi Eraya! I'd love some help.")}`, "_blank");
  };

  const handleCart = () => {
    toast.info("Use the I Love It button on any product to enquire on WhatsApp.");
  };

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="grid grid-cols-3 items-center h-16 px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex items-center justify-start">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <nav className="hidden lg:flex space-x-7">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium tracking-wide hover:text-gold transition-colors">
                  Shop
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/catalogue")}>All jewellery</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {visibleCategories.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => navigate(`/category/${c.slug}`)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={openWhatsApp} className="text-sm font-medium tracking-wide hover:text-gold transition-colors">
                Support
              </button>
              <NavLink to="/about" className={navLinkClass}>About</NavLink>
            </nav>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex justify-center">
            <img src={logo} alt={settings?.store_name || "Eraya"} className="h-9 sm:h-10 w-auto" />
          </Link>

          {/* Right: action icons */}
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account">
                    <span className="h-7 w-7 rounded-full bg-gold/20 text-charcoal text-xs font-semibold flex items-center justify-center">
                      {initials}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" size="icon" aria-label="Sign in">
                <Link to="/login"><User className="h-5 w-5" /></Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" aria-label="Cart" onClick={handleCart}>
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-6 py-4 space-y-2 text-sm">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground pt-2">Shop</p>
              <Link to="/catalogue" onClick={() => setOpen(false)} className="block py-1">All jewellery</Link>
              {visibleCategories.map((c) => (
                <Link key={c.id} to={`/category/${c.slug}`} onClick={() => setOpen(false)} className="block py-1">
                  {c.name}
                </Link>
              ))}
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                <button onClick={() => { openWhatsApp(); setOpen(false); }} className="flex items-center gap-2 py-1">
                  <MessageCircle className="h-4 w-4" /> Support
                </button>
                <Link to="/about" onClick={() => setOpen(false)} className="block py-1">About</Link>
                {!user && (
                  <Link to="/login" onClick={() => setOpen(false)} className="block py-1 text-gold">Sign in</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Search Eraya</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Search rings, earrings, necklaces…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="max-h-72 overflow-auto -mx-2">
            {q && results.length === 0 && (
              <p className="text-sm text-muted-foreground px-2 py-4 text-center">No matches yet.</p>
            )}
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSearchOpen(false); setQ(""); navigate(`/product/${p.id}`); }}
                className="w-full text-left px-2 py-2 rounded hover:bg-muted text-sm"
              >
                {p.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
