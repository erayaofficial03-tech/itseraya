import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import ProductListItem from "@/components/eraya/ProductListItem";
import { useProducts } from "@/lib/queries";

const RECENT_KEY = "eraya:recent-search";
const POPULAR = ["Necklace", "Earrings", "Rings", "Bracelets", "Anklets", "Sets"];

const SearchPage = () => {
  const { data: products = [] } = useProducts();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: string[]) => {
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  const commit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setQ(t);
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    persist(next);
  };

  const removeRecent = (term: string) => persist(recent.filter((r) => r !== term));

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter(
      (p) =>
        p.is_visible &&
        (p.name.toLowerCase().includes(t) ||
          p.categories?.name?.toLowerCase().includes(t) ||
          (p.tags || []).some((tag) => tag.toLowerCase().includes(t))),
    );
  }, [q, products]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title="Search — Eraya" description="Search jewellery across Eraya." />
      <Header />
      <main className="max-w-3xl mx-auto px-5 md:px-6 py-6 pb-24">
        <div className="flex items-center gap-2 border-b border-border pb-2 mb-6">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit(q)}
            placeholder="Search jewellery…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {!q && (
          <>
            {recent.length > 0 && (
              <section className="mb-8">
                <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Recent search
                </p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm"
                    >
                      <button onClick={() => commit(r)}>{r}</button>
                      <button onClick={() => removeRecent(r)} aria-label="Remove">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Popular search terms
              </p>
              <ul className="divide-y divide-border">
                {POPULAR.map((p) => (
                  <li key={p}>
                    <button
                      onClick={() => commit(p)}
                      className="w-full text-left py-3 font-serif text-base hover:text-gold transition-colors"
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {q && (
          <div>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No matches for "{q}".
              </p>
            ) : (
              <div className="divide-y divide-border">
                {results.map((p) => (
                  <ProductListItem key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
