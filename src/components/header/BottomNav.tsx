import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { Home, LayoutGrid, Search, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useProducts, useCategories, productImage, withImageParams, formatINR } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { useEnquiryCart } from "@/hooks/useEnquiryCart";
import { useEnquiryCartUI } from "@/components/EnquiryCartProvider";


const itemBase =
  "flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium tracking-wide transition-colors";

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { count: cartCount } = useEnquiryCart();
  const { openCart } = useEnquiryCartUI();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => {
        const tagsStr = (p.tags || []).join(" ").toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term) ||
          (p.categories?.name ?? "").toLowerCase().includes(term) ||
          tagsStr.includes(term)
        );
      })
      .slice(0, 30);
  }, [q, products]);

  // Close on Escape
  useEffect(() => {
    if (!searchOpen) {
      setQ("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/auth/")) return null;
  if (pathname.startsWith("/reset-password")) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${itemBase} ${isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <>
      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          borderTopColor: "#EDE8E1",
          boxShadow: "0 -1px 0 #EDE8E1",
        }}
      >
        <div className="flex items-stretch h-16">
          <NavLink to="/" end className={linkClass}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/catalogue" className={linkClass}>
            <LayoutGrid className="h-5 w-5" />
            <span>Catalogue</span>
          </NavLink>
          <button
            onClick={() => setSearchOpen(true)}
            className={`${itemBase} ${searchOpen ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
          <NavLink
            to="/wishlist"
            className={linkClass}
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            <span>Wishlist</span>
          </NavLink>
        </div>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col ios-fill-screen"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "#EDE8E1" }}>
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jewellery…"
              className="ios-no-zoom flex-1 outline-none bg-transparent text-[18px] placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="p-2 -mr-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {q.trim() && results.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground mb-3">No results for "{q}"</p>
                <Link
                  to="/catalogue"
                  onClick={() => setSearchOpen(false)}
                  className="text-sm text-gold underline"
                >
                  Browse the catalogue
                </Link>
              </div>
            )}
            {results.map((p) => {
              const price = p.discounted_price ?? p.original_price;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSearchOpen(false);
                    navigate(`/jewellery/${p.slug ?? p.id}`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b text-left active:bg-muted/40"
                  style={{ borderColor: "#EDE8E1" }}
                >
                  <img
                    src={withImageParams(productImage(p), 96, 70)}
                    alt={p.name}
                    className="h-12 w-12 rounded-md object-cover bg-muted"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.categories?.name || ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gold shrink-0">
                    {formatINR(price)}
                  </span>
                </button>
              );
            })}
            {!q.trim() && (
              <div className="px-6 py-8">
                <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">
                  Popular categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.filter((c) => c.is_visible).slice(0, 8).map((c) => (
                    <Link
                      key={c.id}
                      to={`/collection/${c.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="px-3 py-1.5 rounded-full border text-xs hover:bg-muted/40"
                      style={{ borderColor: "#EDE8E1" }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
