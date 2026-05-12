import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Menu, User, LogOut, Search, ShoppingBag, MessageCircle, ChevronRight } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings, useCategories, useProducts } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import StatusBar from "@/components/header/StatusBar";

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

  const closeMenu = () => setOpen(false);

  const drawerLinkClass = "flex items-center justify-between py-3 text-base font-medium text-foreground border-b border-border/60 active:bg-muted/40 -mx-6 px-6 transition-colors";

  return (
    <>
      <StatusBar />
      <header className="w-full sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="grid grid-cols-3 items-center h-14 sm:h-16 px-3 sm:px-6 max-w-7xl mx-auto gap-2">
          {/* Left: hamburger (mobile) + desktop nav */}
          <div className="flex items-center justify-start min-w-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden -ml-2 h-10 w-10"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
                <SheetHeader className="px-6 py-5 border-b border-border text-left">
                  <SheetTitle className="font-serif text-xl">
                    {settings?.store_name || "Eraya"}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Search inside drawer */}
                  <button
                    onClick={() => { closeMenu(); setSearchOpen(true); }}
                    className="w-full flex items-center gap-2 mb-5 px-3 py-2.5 rounded-md bg-muted text-muted-foreground text-sm"
                  >
                    <Search className="h-4 w-4" />
                    Search jewellery…
                  </button>

                  <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-1">
                    Shop
                  </p>
                  <Link to="/catalogue" onClick={closeMenu} className={drawerLinkClass}>
                    All jewellery <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  {visibleCategories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      onClick={closeMenu}
                      className={drawerLinkClass}
                    >
                      {c.name} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}

                  <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mt-6 mb-1">
                    More
                  </p>
                  <Link to="/about" onClick={closeMenu} className={drawerLinkClass}>
                    About <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <button
                    onClick={() => { openWhatsApp(); closeMenu(); }}
                    className={`${drawerLinkClass} w-full text-left`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Support
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Auth footer */}
                <div className="border-t border-border px-6 py-4 bg-muted/30">
                  {user ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => { closeMenu(); navigate("/account"); }}
                        >
                          <User className="h-4 w-4 mr-1.5" /> Account
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={async () => { closeMenu(); await supabase.auth.signOut(); navigate("/"); }}
                        >
                          <LogOut className="h-4 w-4 mr-1.5" /> Sign out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1" onClick={closeMenu}>
                        <Link to="/login">Sign in</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1" onClick={closeMenu}>
                        <Link to="/signup">Sign up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

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
          <Link to="/" className="flex justify-center min-w-0">
            <img src={logo} alt={settings?.store_name || "Eraya"} className="h-8 sm:h-10 w-auto max-w-full" />
          </Link>

          {/* Right: action icons */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            {/* Search hidden on mobile (lives inside drawer); shown sm+ */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex h-10 w-10"
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    aria-label={`Account menu for ${user.email}`}
                  >
                    <span className="h-7 w-7 rounded-full bg-gold/20 text-charcoal text-xs font-semibold flex items-center justify-center" aria-hidden="true">
                      {initials}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" aria-label="Account">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/account")}>
                    <User className="h-4 w-4 mr-2" aria-hidden="true" /> My account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      // Let Radix close + restore focus to trigger first, then run async work
                      e.preventDefault();
                      queueMicrotask(async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) { toast.error(error.message); return; }
                        toast.success("Signed out");
                        navigate("/", { replace: true });
                      });
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" aria-hidden="true" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Sign in or create account" className="h-10 w-10">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" aria-label="Sign in options">
                  <DropdownMenuLabel>Welcome to Eraya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={async () => {
                      const result = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: `${window.location.origin}/`,
                      });
                      if (result?.error) toast.error(result.error.message || "Google sign-in failed");
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                    Continue with Google
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/login")}>
                    <User className="h-4 w-4 mr-2" aria-hidden="true" /> Sign in with email
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate("/signup")}>
                    Create account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="ghost" size="icon" aria-label="Cart" onClick={handleCart} className="h-10 w-10 -mr-1 sm:mr-0">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
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
