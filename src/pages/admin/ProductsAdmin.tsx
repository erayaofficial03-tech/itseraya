import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useCategories, useProducts, formatINR, productImage, type Product } from "@/lib/queries";
import { confirm } from "@/components/ui/confirm-dialog";
import { uploadImage, uploadProductImage } from "@/lib/upload";
import PriceCalculator from "@/components/admin/PriceCalculator";
import { logAdminActivity } from "@/lib/adminLog";
import { useAuth } from "@/hooks/useAuth";

const empty = {
  name: "", slug: "", category_id: "", description: "", original_price: 0,
  discounted_price: null as number | null, tags: [] as string[],
  is_featured: false, is_visible: true, slugManuallyEdited: false,
};

// Admin-only SKU generation via edge function, with a client-side fallback
// if the function is unreachable. The DB trigger remains as a final safety net.
const generateProductSku = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("generate-product-sku");
    if (!error && data?.sku) return data.sku as string;
  } catch {}

  // Fallback: derive next ERY/YY/NNN from existing products
  try {
    const yy = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "2-digit",
    }).format(new Date());
    const prefix = `ERY/${yy}/`;
    const { data } = await supabase
      .from("products")
      .select("sku")
      .like("sku", `${prefix}%`)
      .order("sku", { ascending: false })
      .limit(1);
    const last = data?.[0]?.sku as string | undefined;
    const lastN = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0;
    return `${prefix}${String(lastN + 1).padStart(3, "0")}`;
  } catch {
    return null; // Let the DB trigger assign one
  }
};

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ProductForm = ({ product, onClose }: { product?: Product; onClose: () => void }) => {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [form, setForm] = useState<any>(
    product
      ? {
          name: product.name,
          slug: product.slug || "",
          category_id: product.category_id || "",
          description: product.description || "",
          original_price: Number(product.original_price),
          discounted_price: product.discounted_price ? Number(product.discounted_price) : null,
          tags: product.tags || [],
          is_featured: product.is_featured,
          is_visible: product.is_visible,
          slugManuallyEdited: !!product.slug,
        }
      : empty,
  );
  const [images, setImages] = useState<{ id?: string; url: string }[]>(
    product?.product_images?.map((i) => ({ id: i.id, url: i.image_url })) || [],
  );
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [useCalc, setUseCalc] = useState(false);

  const pct = form.discounted_price && form.original_price > form.discounted_price
    ? Math.round(((form.original_price - form.discounted_price) / form.original_price) * 100)
    : 0;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const id = toast.loading(`Processing ${files.length} image${files.length > 1 ? "s" : ""}…`);
    let ok = 0;
    for (const f of Array.from(files)) {
      try {
        const url = await uploadProductImage(f);
        setImages((cur) => [...cur, { url }]);
        ok += 1;
      } catch {
        // uploadProductImage already toasts the specific reason (low-res, etc.)
      }
    }
    toast.dismiss(id);
    if (ok > 0) toast.success(`${ok} image${ok > 1 ? "s" : ""} ready (4:5, WEBP)`);
  };

  const moveImg = (i: number, dir: -1 | 1) => {
    setImages((cur) => {
      const next = [...cur];
      const j = i + dir;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const submit = async () => {
    setBusy(true);
    try {
      // Section limit checks (max 10 each)
      const wantsFeatured = !!form.is_featured && !product?.is_featured;
      const wantsBestseller =
        form.tags.includes("bestseller") && !(product?.tags || []).includes("bestseller");

      if (wantsFeatured) {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("is_featured", true)
          .eq("is_visible", true);
        if ((count ?? 0) >= 10) {
          toast.error("Hot Selling is full (max 10). Unfeature another product first.");
          setBusy(false);
          return;
        }
      }
      if (wantsBestseller) {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .contains("tags", ["bestseller"])
          .eq("is_visible", true);
        if ((count ?? 0) >= 10) {
          toast.error("Trending Now is full (max 10). Remove the bestseller tag from another product first.");
          setBusy(false);
          return;
        }
      }

      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        category_id: form.category_id || null,
        description: form.description || null,
        original_price: Number(form.original_price),
        discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
        tags: form.tags,
        is_featured: form.is_featured,
        is_visible: form.is_visible,
      };
      let productId = product?.id;
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const sku = await generateProductSku();
        const insertPayload = sku ? { ...payload, sku } : payload;
        const { data, error } = await supabase.from("products").insert(insertPayload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }
      // Replace images: delete existing, insert new
      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (images.length) {
          const rows = images.map((img, idx) => ({
            product_id: productId, image_url: img.url, sort_order: idx,
          }));
          const { error } = await supabase.from("product_images").insert(rows);
          if (error) throw error;
        }
      }
      toast.success(product ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm({
                ...form,
                name,
                slug: form.slugManuallyEdited ? form.slug : generateSlug(name),
              });
            }}
          />
        </div>
        <div className="col-span-2">
          <Label>URL Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) =>
              setForm({ ...form, slug: generateSlug(e.target.value), slugManuallyEdited: true })
            }
            placeholder="auto-generated-from-name"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Preview: <span className="font-mono">/jewellery/{form.slug || "your-product-name"}</span>
          </p>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <PriceCalculator
          enabled={useCalc}
          onToggle={setUseCalc}
          onApply={({ mrp, sell }) => {
            setForm({ ...form, original_price: mrp, discounted_price: sell });
            logAdminActivity({
              action: "pricing.calculator.apply",
              entity: "product",
              entity_id: product?.id ?? null,
              details: { product_name: form.name || product?.name, mrp, sell },
            });
          }}
        />
        <div>
          <Label>
            MRP / Original Price (₹){" "}
            {useCalc && <span className="text-xs text-muted-foreground">(locked by calculator)</span>}
          </Label>
          <Input type="number" min={0} value={form.original_price}
            readOnly={useCalc}
            onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Discounted Price (₹) <span className="text-xs text-muted-foreground">optional</span></Label>
          <Input type="number" min={0} value={form.discounted_price ?? ""}
            onChange={(e) => setForm({ ...form, discounted_price: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div className="flex items-center pt-7">
          {pct > 0 && <span className="text-sm text-gold font-medium">{pct}% OFF auto</span>}
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. new, bestseller, sale"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  e.preventDefault();
                  setForm({ ...form, tags: [...form.tags, tagInput.trim().toLowerCase()] });
                  setTagInput("");
                }
              }}
            />
            <Button type="button" onClick={() => {
              if (tagInput.trim()) {
                setForm({ ...form, tags: [...form.tags, tagInput.trim().toLowerCase()] });
                setTagInput("");
              }
            }}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tags.map((t: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 bg-muted rounded flex items-center gap-1">
                {t} <button onClick={() => setForm({ ...form, tags: form.tags.filter((_: any, idx: number) => idx !== i) })}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Images</Label>
          <p className="text-xs text-muted-foreground -mt-1">
            Auto cropped to 4:5 and saved as WEBP (thumb/medium/full). Recommended source: 1600×2000+.
          </p>
          <Input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} className="w-full aspect-[4/5] object-cover rounded bg-ivory-warm" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1">
                  <Button size="sm" variant="secondary" onClick={() => moveImg(i, -1)}><ArrowUp className="h-3 w-3" /></Button>
                  <Button size="sm" variant="secondary" onClick={() => moveImg(i, 1)}><ArrowDown className="h-3 w-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => setImages((cur) => cur.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_visible} onCheckedChange={(v) => setForm({ ...form, is_visible: v })} />
          <Label>Visible</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !form.name}>{busy ? "Saving…" : "Save"}</Button>
      </DialogFooter>
    </div>
  );
};

const ProductsAdmin = () => {
  const { data: products = [] } = useProducts();
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete this product?", description: "This action cannot be undone." }))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} items</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
              <Plus /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
            <ProductForm product={editing || undefined} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="p-4 flex gap-3">
            <img src={productImage(p)} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-[10px] font-mono tracking-wider text-muted-foreground">{p.sku}</p>
                  <p className="text-xs text-muted-foreground">{p.categories?.name}</p>
                  <p className="text-sm text-gold mt-1">
                    {formatINR(p.discounted_price ?? p.original_price)}
                    {!p.is_visible && <span className="ml-2 text-xs text-muted-foreground">(hidden)</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsAdmin;
