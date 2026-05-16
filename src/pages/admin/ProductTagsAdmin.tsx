import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProductLabels, useProducts, type ProductLabel } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Search, ArrowUp, ArrowDown } from "lucide-react";

const TONE_OPTIONS: Array<{ value: "ink" | "champagne" | "blush"; label: string; preview: string }> = [
  { value: "champagne", label: "Champagne", preview: "bg-champagne text-ink" },
  { value: "ink",       label: "Ink (dark)", preview: "bg-ink text-ivory" },
  { value: "blush",     label: "Blush (soft)", preview: "bg-ivory text-ink border border-border" },
];

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const ProductTagsAdmin = () => {
  const qc = useQueryClient();
  const { data: labels = [], isLoading: labelsLoading } = useProductLabels({ includeInactive: true });
  const { data: products = [], isLoading: productsLoading } = useProducts();

  /* ─── Label creation form ─────────────────────── */
  const [newName, setNewName] = useState("");
  const [newTone, setNewTone] = useState<"ink" | "champagne" | "blush">("champagne");
  const [creating, setCreating] = useState(false);

  const createLabel = async () => {
    const name = newName.trim();
    if (!name) return;
    const slug = slugify(name);
    if (!slug) { toast.error("Invalid name"); return; }
    setCreating(true);
    const nextOrder = (labels[labels.length - 1]?.display_order ?? 0) + 1;
    const { error } = await supabase
      .from("product_labels")
      .insert({ slug, name, tone: newTone, display_order: nextOrder, is_active: true });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    setNewName("");
    qc.invalidateQueries({ queryKey: ["product_labels"] });
    toast.success(`Label "${name}" added`);
  };

  const updateLabel = async (id: string, patch: Partial<ProductLabel>) => {
    const { error } = await supabase.from("product_labels").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["product_labels"] });
  };

  const deleteLabel = async (l: ProductLabel) => {
    const { error } = await supabase.from("product_labels").delete().eq("id", l.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["product_labels"] });
    toast.success(`Removed "${l.name}"`);
  };

  const reorder = async (l: ProductLabel, dir: -1 | 1) => {
    const idx = labels.findIndex((x) => x.id === l.id);
    const swap = labels[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("product_labels").update({ display_order: swap.display_order }).eq("id", l.id),
      supabase.from("product_labels").update({ display_order: l.display_order }).eq("id", swap.id),
    ]);
    qc.invalidateQueries({ queryKey: ["product_labels"] });
  };

  /* ─── Toggle a label on a product ─────────────── */
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const toggleProductLabel = async (
    productId: string,
    slug: string,
    currentTags: string[],
    hasIt: boolean,
  ) => {
    const key = `${productId}:${slug}`;
    setBusyKey(key);
    const nextTags = hasIt
      ? currentTags.filter((t) => t.toLowerCase() !== slug)
      : [...currentTags, slug];
    const { error } = await supabase
      .from("products")
      .update({ tags: nextTags })
      .eq("id", productId);
    setBusyKey(null);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  /* ─── Product search + filter ─────────────────── */
  const [q, setQ] = useState("");
  const [filterSlug, setFilterSlug] = useState<string>("__all__");

  const filteredProducts = useMemo(() => {
    let list = products;
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((p) => p.name.toLowerCase().includes(term));
    if (filterSlug !== "__all__") {
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === filterSlug),
      );
    }
    return list;
  }, [products, q, filterSlug]);

  const activeLabels = labels.filter((l) => l.is_active);

  /* ─── Counts per label (admin overview) ───────── */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of labels) c[l.slug] = 0;
    for (const p of products) {
      for (const t of p.tags || []) {
        const key = t.toLowerCase();
        if (key in c) c[key]++;
      }
    }
    return c;
  }, [labels, products]);

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div>
        <h1 className="font-serif text-3xl">Product Tags</h1>
        <p className="text-sm text-muted-foreground">
          Define the micro-labels that appear on product cards, and pick which products show them.
        </p>
      </div>

      {/* ─── Labels catalog ─────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
          <p className="text-xs text-muted-foreground">
            Active labels appear on product cards when a product is tagged with that label's slug.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create new */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end p-3 rounded-lg bg-muted/40 border">
            <div>
              <Label className="text-xs">Label name</Label>
              <Input
                placeholder="e.g. Limited Edition"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createLabel(); }}
              />
              {newName.trim() && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Slug: <code className="font-mono">{slugify(newName)}</code> — tag products with this slug to show this label.
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs">Tone</Label>
              <Select value={newTone} onValueChange={(v) => setNewTone(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createLabel} disabled={creating || !newName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add label
            </Button>
          </div>

          {/* Existing list */}
          {labelsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : labels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No labels yet.</p>
          ) : (
            <div className="divide-y border rounded-lg">
              {labels.map((l, i) => {
                const tone = TONE_OPTIONS.find((t) => t.value === l.tone)!;
                return (
                  <div key={l.id} className="flex flex-wrap items-center gap-3 p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] tracking-[0.14em] uppercase ${tone.preview}`}>
                      {l.name}
                    </span>
                    <code className="text-xs text-muted-foreground font-mono">{l.slug}</code>
                    <span className="text-xs text-muted-foreground">
                      {counts[l.slug] ?? 0} product{(counts[l.slug] ?? 0) === 1 ? "" : "s"}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => reorder(l, -1)} aria-label="Move up">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={i === labels.length - 1} onClick={() => reorder(l, 1)} aria-label="Move down">
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      <Select value={l.tone} onValueChange={(v) => updateLabel(l.id, { tone: v as any })}>
                        <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2 px-2">
                        <Switch checked={l.is_active} onCheckedChange={(v) => updateLabel(l.id, { is_active: v })} />
                        <span className="text-xs text-muted-foreground">{l.is_active ? "On" : "Off"}</span>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete label">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{l.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The label definition will be removed. Products tagged with{" "}
                              <code className="font-mono">{l.slug}</code> will keep that tag, but the
                              styled chip will no longer appear on their cards.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteLabel(l)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Apply labels to products ───────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Apply labels to products</CardTitle>
          <p className="text-xs text-muted-foreground">
            Tick a box to add the label's tag to a product. The first matching active label is shown on the card.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSlug} onValueChange={setFilterSlug}>
              <SelectTrigger><SelectValue placeholder="Filter by label" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All products</SelectItem>
                {activeLabels.map((l) => (
                  <SelectItem key={l.id} value={l.slug}>Tagged: {l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {productsLoading ? (
            <p className="text-sm text-muted-foreground">Loading products…</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products match.</p>
          ) : (
            <div className="border rounded-lg divide-y">
              {filteredProducts.map((p) => {
                const tagsLower = (p.tags || []).map((t) => t.toLowerCase());
                return (
                  <div key={p.id} className="p-3 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {p.tags?.length ? p.tags.join(", ") : "no tags"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activeLabels.map((l) => {
                        const hasIt = tagsLower.includes(l.slug);
                        const key = `${p.id}:${l.slug}`;
                        return (
                          <button
                            key={l.id}
                            type="button"
                            disabled={busyKey === key}
                            onClick={() => toggleProductLabel(p.id, l.slug, p.tags || [], hasIt)}
                            className={`px-2.5 py-1 rounded-full text-[10px] tracking-[0.14em] uppercase border transition ${
                              hasIt
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-muted-foreground border-border hover:border-foreground"
                            } ${busyKey === key ? "opacity-50" : ""}`}
                            aria-pressed={hasIt}
                            title={hasIt ? `Remove ${l.name}` : `Apply ${l.name}`}
                          >
                            {l.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="p-3 text-[11px] text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
                {activeLabels.length === 0 && (
                  <Badge variant="outline" className="ml-2">No active labels — add one above</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductTagsAdmin;
