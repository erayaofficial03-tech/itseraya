import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Menu, Search, MessageCircle, ChevronRight, User, LogIn, LogOut, Heart, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings, useCategories, useProducts, prefetchCategory, prefetchProduct } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsApp } from "@/lib/whatsapp";
import AnnouncementBar from "@/components/AnnouncementBar";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const { user, profile, isStaff, signOut } = useAuth();
  const { data: wishlistItems = [] } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const qc = useQueryClient();
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

  

  const handleWhatsAppClick = () => {
    const wa = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!wa) {
      toast.info("WhatsApp number not set yet — check back soon.");
      return;
    }
    openWhatsApp(wa, "Hi Eraya! I'd love some help.");
  };

  const handleCart = () => {
    toast.info("Use the I Love It button on any product to enquire on WhatsApp.");
  };

  const closeMenu = () => setOpen(false);

  const drawerLinkClass = "flex items-center justify-between py-3 text-base font-medium text-foreground border-b border-border/60 active:bg-muted/40 -mx-6 px-6 transition-colors";

  return (
    <>
      <AnnouncementBar />
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
              <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col bg-[hsl(var(--background))]">
                <SheetHeader className="px-6 py-5 border-b border-border text-left">
                  <SheetTitle asChild>
                    <Link to="/" onClick={closeMenu} className="inline-flex">
                      <img src={logo} alt={settings?.store_name || "Eraya"} className="h-12 w-auto object-contain" />
                    </Link>
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
                    {s(settings, "nav_catalogue_label")} <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                    Account
                  </p>
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 py-3 border-b border-border/60 -mx-6 px-6">
                        <Avatar className="h-9 w-9 border border-gold">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-charcoal text-ivory text-xs">
                            {(profile?.full_name || user.email || "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{profile?.full_name || "Welcome"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link to="/profile" onClick={closeMenu} className={drawerLinkClass}>
                        <span className="flex items-center gap-2"><User className="h-4 w-4" /> Profile</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link to="/wishlist" onClick={closeMenu} className={drawerLinkClass}>
                        <span className="flex items-center gap-2"><Heart className="h-4 w-4" /> Wishlist</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <button
                        onClick={async () => { await signOut(); closeMenu(); navigate("/"); }}
                        className={`${drawerLinkClass} w-full text-left`}
                      >
                        <span className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Log out</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={closeMenu} className={drawerLinkClass}>
                      <span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> Log in / Sign up</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}

                  <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mt-6 mb-1">
                    More
                  </p>
                  <Link to="/about" onClick={closeMenu} className={drawerLinkClass}>
                    About <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <button
                    onClick={() => { handleWhatsAppClick(); closeMenu(); }}
                    className={`${drawerLinkClass} w-full text-left`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Support
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

              </SheetContent>
            </Sheet>

            <nav className="hidden lg:flex space-x-7">
              <NavLink to="/" className={navLinkClass}>{s(settings, "nav_home_label")}</NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium tracking-wide hover:text-gold transition-colors">
                  {s(settings, "nav_catalogue_label")}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/catalogue")}>{s(settings, "nav_catalogue_label")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {visibleCategories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onMouseEnter={() => prefetchCategory(qc, c.slug)}
                      onClick={() => navigate(`/category/${c.slug}`)}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={handleWhatsAppClick} className="text-sm font-medium tracking-wide hover:text-gold transition-colors">
                Support
              </button>
              <NavLink to="/about" className={navLinkClass}>About</NavLink>
            </nav>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex justify-center min-w-0">
            <img src={logo} alt={settings?.store_name || "Eraya"} className="h-8 sm:h-10 w-auto max-w-full object-contain" />
          </Link>

          {/* Right: action icons */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            {/* Search hidden on mobile (lives inside drawer); shown sm+ */}
            {s(settings, "nav_show_search") && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="hidden sm:inline-flex h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Account: avatar when signed in, login icon otherwise (desktop) */}
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Profile"
                onClick={() => navigate("/profile")}
                className="hidden lg:inline-flex h-10 w-10"
              >
                <Avatar className="h-7 w-7 border border-gold">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-charcoal text-ivory text-[10px]">
                    {(profile?.full_name || user.email || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log in"
                onClick={() => navigate("/login")}
                className="hidden lg:inline-flex h-10 w-10"
              >
                <User className="h-5 w-5" />
              </Button>
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
                onMouseEnter={() => prefetchProduct(qc, p.id)}
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
