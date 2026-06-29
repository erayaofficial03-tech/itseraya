import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const QUICK_EDIT_EVENT = "eraya:quick-edit-product";

interface QuickEditDetail { productId: string }

interface FormState {
  name: string;
  original_price: number;
  discounted_price: number | null;
  description: string;
  is_visible: boolean;
  is_featured: boolean;
}

const empty: FormState = {
  name: "",
  original_price: 0,
  discounted_price: null,
  description: "",
  is_visible: true,
  is_featured: false,
};

const QuickEditProductDrawer = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<QuickEditDetail>).detail;
      if (!detail?.productId) return;
      setProductId(detail.productId);
      setOpen(true);
    };
    window.addEventListener(QUICK_EDIT_EVENT, handler);
    return () => window.removeEventListener(QUICK_EDIT_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("name, original_price, discounted_price, description, is_visible, is_featured")
        .eq("id", productId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Could not load product");
        setOpen(false);
        setLoading(false);
        return;
      }
      setForm({
        name: data.name ?? "",
        original_price: Number(data.original_price ?? 0),
        discounted_price: data.discounted_price == null ? null : Number(data.discounted_price),
        description: data.description ?? "",
        is_visible: data.is_visible ?? true,
        is_featured: data.is_featured ?? false,

      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, productId]);

  const handleSave = async () => {
    if (!productId) return;
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        original_price: form.original_price,
        discounted_price: form.discounted_price,
        description: form.description,
        is_visible: form.is_visible,
        is_featured: form.is_featured,
        is_new: form.is_new,
      })
      .eq("id", productId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Product updated");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick edit</SheetTitle>
          <SheetDescription>Update key fields without leaving the storefront.</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="qe-name">Name</Label>
              <Input id="qe-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qe-orig">Original price</Label>
                <Input id="qe-orig" type="number" value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qe-disc">Discounted price</Label>
                <Input id="qe-disc" type="number" value={form.discounted_price ?? ""}
                  onChange={(e) => setForm({ ...form, discounted_price: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qe-desc">Description</Label>
              <Textarea id="qe-desc" rows={5} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-3 rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="qe-vis" className="cursor-pointer">Visible to customers</Label>
                <Switch id="qe-vis" checked={form.is_visible}
                  onCheckedChange={(v) => setForm({ ...form, is_visible: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="qe-feat" className="cursor-pointer">Featured</Label>
                <Switch id="qe-feat" checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="qe-new" className="cursor-pointer">Marked as new</Label>
                <Switch id="qe-new" checked={form.is_new}
                  onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Link
                to="/admin/products"
                className="text-sm text-champagne-deep underline underline-offset-2"
                onClick={() => setOpen(false)}
              >
                Full edit in Admin →
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default QuickEditProductDrawer;
