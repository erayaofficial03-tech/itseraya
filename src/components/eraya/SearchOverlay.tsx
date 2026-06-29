import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCategories, useProducts, productImage, withImageParams, formatINR } from "@/lib/queries";

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

const SearchOverlay = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mobile, setMobile] = useState(false);
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => {
        const tags = (p.tags || []).join(" ").toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term) ||
          (p.categories?.name ?? "").toLowerCase().includes(term) ||
          tags.includes(term)
        );
      })
      .slice(0, 30);
  }, [q, products]);

  useEffect(() => {
    const handler = () => {
      setMobile(isMobile());
      setOpen(true);
    };
    window.addEventListener("eraya:open-search", handler);
    return () => window.removeEventListener("eraya:open-search", handler);
  }, []);

  useEffect(() => {
    if (!open) { setQ(""); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const initial = mobile ? { y: "100%" } : { opacity: 0, y: -12 };
  const animate = mobile ? { y: 0 } : { opacity: 1, y: 0 };
  const exit = mobile ? { y: "100%" } : { opacity: 0, y: -12 };

  return (
    <AnimatePresence>
      {open && (
        <>
          {!mobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[59] bg-black/40"
            />
          )}
          <motion.div
            initial={initial}
            animate={animate}
            exit={exit}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={
              mobile
                ? "fixed inset-0 z-[60] bg-white flex flex-col"
                : "fixed top-0 inset-x-0 z-[60] bg-white shadow-xl flex flex-col max-h-[80vh] md:rounded-b-2xl"
            }
            style={mobile ? { paddingBottom: "env(safe-area-inset-bottom)" } : undefined}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EDE8E1]">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jewellery…"
                aria-label="Search products"
                className="flex-1 outline-none bg-transparent text-[18px] placeholder:text-muted-foreground"
                style={{ fontSize: "16px" }}
              />
              <button onClick={() => setOpen(false)} aria-label="Close search" className="p-2 -mr-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {q.trim() && results.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No results for "{q}"</p>
                  <Link to="/catalogue" onClick={() => setOpen(false)} className="text-sm text-[#C9A84C] underline">
                    Browse catalogue
                  </Link>
                </div>
              )}
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setOpen(false); navigate(`/jewellery/${p.slug ?? p.id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#EDE8E1] text-left hover:bg-muted/40"
                >
                  <img src={withImageParams(productImage(p), 96, 70)} alt={p.name} className="h-12 w-12 rounded-md object-cover bg-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.categories?.name || ""}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#C9A84C] shrink-0">
                    {formatINR(p.discounted_price ?? p.original_price)}
                  </span>
                </button>
              ))}
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
                        onClick={() => setOpen(false)}
                        className="px-3 py-1.5 rounded-full border border-[#EDE8E1] text-xs hover:bg-muted/40"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
