import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Menu, Search, MessageCircle, ChevronRight, ChevronDown, User, Heart, Shield, ShoppingBag, Sparkles, Crown, Tag, Flame, MapPin, Download, Settings as Cog, LogOut, LayoutGrid, FileText } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { logInstallEvent } from "@/lib/installAnalytics";
import IOSInstallGuide from "@/components/IOSInstallGuide";
import InstallTroubleshootSheet from "@/components/InstallTroubleshootSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

import { useEnquiryCart } from "@/hooks/useEnquiryCart";
import { useEnquiryCartUI } from "@/components/EnquiryCartProvider";
import BrandLogo from "@/components/BrandLogo";
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
  DialogDescription,
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
  const { user, profile, isStaff, signOut, switchMode } = useAuth();
  const { data: wishlistItems = [] } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const { count: cartCount } = useEnquiryCart();
  const { openCart } = useEnquiryCartUI();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const { isIOS, isInstalled, isInstallable, triggerInstall } = useInstallPrompt();
  const [q, setQ] = useState("");

  const visibleCategories = categories.filter((c) => c.is_visible);

  const shopShortcuts = [
    { label: "New Arrivals", to: "/catalogue?filter=new", icon: Sparkles },
    { label: "Trending Now", to: "/catalogue?filter=bestseller", icon: Crown },
    { label: "Hot Selling", to: "/catalogue?filter=featured", icon: Flame },
    { label: "On Sale", to: "/catalogue?filter=sale", icon: Tag },
  ];

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, products]);

  const focusRing =
    "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors px-1 py-1 ${focusRing} ${
      isActive ? "text-[hsl(var(--champagne))]" : "text-ivory hover:text-[hsl(var(--champagne))]"
    }`;

  

  const handleWhatsAppClick = () => {
    const wa = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!wa) {
      toast.info("WhatsApp number not set yet — check back soon.");
      return;
    }
    openWhatsApp(wa, "Hi Eraya! I'd love some help.");
  };



  const closeMenu = () => setOpen(false);

  const handleInstall = async () => {
    logInstallEvent("prompt_shown", isIOS ? "ios" : undefined);
    // iOS has no native prompt — show the Safari guide immediately,
    // don't await a hook call that just resolves to "ios".
    if (isIOS) {
      logInstallEvent("ios_guide_opened", "ios");
      setShowIOSGuide(true);
      return;
    }
    const result = await triggerInstall();
    if (result === "accepted") {
      logInstallEvent("accepted");
      logInstallEvent("installed");
      toast.success("Eraya installed! Find it on your home screen 💛");
      closeMenu();
    } else if (result === "dismissed") {
      logInstallEvent("dismissed");
      toast("Installation cancelled");
    } else if (result === "installed") {
      toast("Eraya is already on your home screen ✓");
    } else if (result === "unavailable") {
      logInstallEvent("unavailable");
      setShowTroubleshoot(true);
    }
  };

  // Show install button only when there is something actionable:
  // iOS (always — guided flow) OR Android/Desktop with a captured native prompt.
  const showInstallButton = !isInstalled && (isIOS || isInstallable);

  const drawerLinkClass = "flex items-center justify-between py-3 text-base font-medium text-ivory border-b border-ivory/10 active:bg-ivory/5 -mx-6 px-6 transition-colors hover:text-[hsl(var(--champagne))]";

  return (
    <>
      <AnnouncementBar />
      <StatusBar />
      <header className="w-full sticky top-0 z-50 bg-[hsl(var(--ink))] lg:bg-[hsl(var(--ink))]/95 lg:backdrop-blur border-b border-[hsl(var(--ink-soft))]/40 text-ivory">
        <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center h-14 sm:h-16 px-2 sm:px-4 lg:px-6 max-w-7xl mx-auto gap-1 sm:gap-2">
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
              <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col h-[100dvh] bg-[hsl(var(--ink))] text-ivory border-r border-ivory/10">
                <SheetHeader className="px-6 py-5 border-b border-ivory/10 items-center">
                  <SheetTitle asChild>
                    <Link to="/" onClick={closeMenu} className="inline-flex justify-center">
                      <BrandLogo onDark className="h-12 w-auto object-contain" />
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Search inside drawer */}
                  <button
                    onClick={() => { closeMenu(); setSearchOpen(true); }}
                    className="w-full flex items-center gap-2 mb-5 px-3 py-2.5 rounded-md bg-ivory/10 text-ivory/70 text-sm hover:bg-ivory/15 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Search jewellery…
                  </button>

                  {/* ACCOUNT (moved to top) */}
                  <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[hsl(var(--champagne))] mb-1">
                    Account
                  </p>
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 py-3 -mx-6 px-6 border-b border-ivory/10">
                        <Avatar className="h-10 w-10 border border-gold">
                          <AvatarImage src={profile?.avatar_url || (user.user_metadata as any)?.avatar_url || undefined} />
                          <AvatarFallback className="bg-charcoal text-ivory text-xs">
                            {(profile?.full_name || user.email || "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {profile?.full_name || (user.user_metadata as any)?.full_name || "Welcome"}
                          </p>
                          <p className="text-xs text-ivory/60 truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link to="/profile" onClick={closeMenu} className={drawerLinkClass}>
                        <span className="flex items-center gap-2"><User className="h-4 w-4" /> My Profile</span>
                      </Link>
                      <Link to="/wishlist" onClick={closeMenu} className={drawerLinkClass}>
                        <span className="flex items-center gap-2"><Heart className="h-4 w-4" /> My Wishlist</span>
                      </Link>
                      <Link to="/track" onClick={closeMenu} className={drawerLinkClass}>
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Track Enquiry</span>
                      </Link>
                      {isStaff && (
                        <button
                          onClick={() => {
                            void switchMode("admin").catch(() => {});
                            closeMenu();
                            navigate("/admin");
                          }}
                          className={`${drawerLinkClass} w-full text-left`}
                        >
                          <span className="flex items-center gap-2"><Cog className="h-4 w-4" /> Switch to Admin Panel</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          void signOut().catch(() => {});
                          closeMenu();
                          navigate("/");
                        }}
                        className={`${drawerLinkClass} w-full text-left`}
                      >
                        <span className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <div className="my-3 rounded-xl border border-[hsl(var(--champagne))]/40 bg-[hsl(var(--champagne))]/10 p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-[hsl(var(--champagne))]/15 border border-[hsl(var(--champagne))]/40 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-gold" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ivory">Sign In to Your Account</p>
                          <p className="text-xs text-ivory/60 mt-0.5">Save wishlist & track your enquiries</p>
                        </div>
                      </div>
                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-charcoal text-ivory text-sm font-medium hover:opacity-90 transition"
                      >
                        Sign In <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[hsl(var(--champagne))] mt-6 mb-1">
                    Shop
                  </p>
                  {shopShortcuts.map((sc) => {
                    const Icon = sc.icon;
                    return (
                      <Link key={sc.label} to={sc.to} onClick={closeMenu} className={drawerLinkClass}>
                        <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {sc.label}</span>
                      </Link>
                    );
                  })}

                  {/* Catalogue (collapsible with categories) */}
                  <Collapsible>
                    <CollapsibleTrigger className={`${drawerLinkClass} w-full text-left group`}>
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" /> {s(settings, "nav_catalogue_label")}
                      </span>
                      <ChevronDown className="h-4 w-4 text-ivory/60 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Link to="/catalogue" onClick={closeMenu} className={`${drawerLinkClass} pl-10 text-sm text-ivory/60`}>
                        View all
                      </Link>
                      {visibleCategories.map((c) => (
                        <Link
                          key={c.id}
                          to={`/collection/${c.slug}`}
                          onClick={closeMenu}
                          className={`${drawerLinkClass} pl-10 text-sm`}
                        >
                          {c.name}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[hsl(var(--champagne))] mt-6 mb-1">
                    Info
                  </p>
                  {showInstallButton && (
                    <button
                      onClick={handleInstall}
                      className={`${drawerLinkClass} w-full text-left`}
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-gold" />
                        Install Eraya App
                      </span>
                      <span
                        className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          isIOS
                            ? "bg-[#F0F0F0] text-[#555]"
                            : "bg-[#E8F5E9] text-[#2E7D32]"
                        }`}
                      >
                        {isIOS ? "iPhone" : "Android"}
                      </span>
                    </button>
                  )}
                  <Link to="/about" onClick={closeMenu} className={drawerLinkClass}>
                    <span>About Eraya</span>
                  </Link>
                  <Link to="/faq" onClick={closeMenu} className={drawerLinkClass}>
                    <span>FAQ</span>
                  </Link>
                  <Link to="/care" onClick={closeMenu} className={drawerLinkClass}>
                    <span>Jewellery Care</span>
                  </Link>

                  {/* Policies (collapsible) */}
                  <Collapsible>
                    <CollapsibleTrigger className={`${drawerLinkClass} w-full text-left group`}>
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Policies
                      </span>
                      <ChevronDown className="h-4 w-4 text-ivory/60 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Link to="/return-policy" onClick={closeMenu} className={`${drawerLinkClass} pl-10 text-sm`}>
                        Return Policy
                      </Link>
                      <Link to="/shipping-policy" onClick={closeMenu} className={`${drawerLinkClass} pl-10 text-sm`}>
                        Shipping Policy
                      </Link>
                      <Link to="/cancellation-policy" onClick={closeMenu} className={`${drawerLinkClass} pl-10 text-sm`}>
                        Cancellation Policy
                      </Link>
                      <Link to="/privacy-policy" onClick={closeMenu} className={`${drawerLinkClass} pl-10 text-sm`}>
                        Privacy Policy
                      </Link>
                      <Link to="/terms-of-service" onClick={closeMenu} className={`${drawerLinkClass} pl-10 text-sm`}>
                        Terms of Service
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  <button
                    onClick={() => { handleWhatsAppClick(); closeMenu(); }}
                    className={`${drawerLinkClass} w-full text-left`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Support
                    </span>
                  </button>
                </div>

              </SheetContent>
            </Sheet>
            <IOSInstallGuide open={showIOSGuide} onClose={() => setShowIOSGuide(false)} />
            <InstallTroubleshootSheet open={showTroubleshoot} onClose={() => setShowTroubleshoot(false)} />

            {/* Mobile/tablet primary dropdown — quick access to Shop, Support, About */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Quick navigation: Shop, Support, About"
                  className={`hidden md:inline-flex lg:hidden items-center gap-1 px-2 h-9 rounded-md text-sm font-medium text-ivory hover:text-[hsl(var(--champagne))] transition-colors ${focusRing}`}
                >
                  Menu
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/catalogue")}>
                  <Sparkles className="h-4 w-4 mr-2 text-gold" />
                  {s(settings, "nav_catalogue_label")}
                </DropdownMenuItem>
                {visibleCategories.length > 0 && <DropdownMenuSeparator />}
                {visibleCategories.slice(0, 6).map((c) => {
                  const prefetch = () => prefetchCategory(qc, c.slug);
                  return (
                    <DropdownMenuItem
                      key={c.id}
                      onMouseEnter={prefetch}
                      onPointerEnter={prefetch}
                      onTouchStart={prefetch}
                      onFocus={prefetch}
                      onClick={() => navigate(`/collection/${c.slug}`)}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/contact")}>
                  <MessageCircle className="h-4 w-4 mr-2 text-gold" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/about")}>
                  <Shield className="h-4 w-4 mr-2 text-gold" />
                  About
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <nav className="hidden lg:flex space-x-7" aria-label="Primary">
              <NavLink to="/" className={navLinkClass} aria-label={`${s(settings, "nav_home_label")} – go to home page`}>
                {s(settings, "nav_home_label")}
              </NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Shop menu – browse catalogue and categories"
                  className={`text-sm font-medium tracking-wide text-ivory hover:text-[hsl(var(--champagne))] transition-colors px-1 py-1 ${focusRing}`}
                >
                  {s(settings, "nav_catalogue_label")}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/catalogue")}>{s(settings, "nav_catalogue_label")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {visibleCategories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onMouseEnter={() => prefetchCategory(qc, c.slug)}
                      onClick={() => navigate(`/collection/${c.slug}`)}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <NavLink to="/contact" className={navLinkClass} aria-label="Support – contact us">
                Support
              </NavLink>
              <NavLink to="/about" className={navLinkClass} aria-label="About Eraya – our story">
                About
              </NavLink>
            </nav>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex justify-center min-w-0 items-center px-1">
            <BrandLogo onDark className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[140px] lg:max-w-[180px]" />
          </Link>

          {/* Right: action icons */}
          <div className="flex items-center justify-end gap-0 sm:gap-0.5 lg:gap-1">
            {s(settings, "nav_show_search") && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="hidden md:inline-flex h-9 w-9 sm:h-10 sm:w-10"
              >
                <Search className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </Button>
            )}

            {/* Account: avatar when signed in, login icon otherwise (hidden on mobile — lives in bottom nav) */}
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Profile"
                onClick={() => navigate("/profile")}
                className="hidden md:inline-flex h-9 w-9 sm:h-10 sm:w-10"
              >
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border border-gold">
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
                className="hidden md:inline-flex h-9 w-9 sm:h-10 sm:w-10"
              >
                <User className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Enquiry cart"
              onClick={openCart}
              className="relative h-9 w-9 sm:h-10 sm:w-10 -mr-1 sm:mr-0"
            >
              <ShoppingBag className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-gold text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby="search-dialog-desc">
          <DialogHeader>
            <DialogTitle className="font-serif">Search Eraya</DialogTitle>
            <DialogDescription id="search-dialog-desc">
              Search for products by name
            </DialogDescription>
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
                onClick={() => { setSearchOpen(false); setQ(""); navigate(`/jewellery/${p.slug ?? p.id}`); }}
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
