import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminActivity } from "@/lib/adminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useCategories, type Category } from "@/lib/queries";
import { confirm } from "@/components/ui/confirm-dialog";
import { uploadImage } from "@/lib/upload";
import ImageEditorSheet from "@/components/admin/ImageEditorSheet";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CategoryForm = ({ cat, onClose }: { cat?: Category; onClose: () => void }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: cat?.name || "",
    slug: cat?.slug || "",
    image_url: cat?.image_url || "",
    display_order: cat?.display_order ?? 0,
    is_visible: cat?.is_visible ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (cat) {
        const { error } = await supabase.from("categories").update(payload).eq("id", cat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      void logAdminActivity({
        action: cat ? "category_updated" : "category_created",
        entity: "category",
        entity_id: cat?.id,
        details: { name: payload.name },
      });
      qc.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
      </div>
      <div>
        <Label>Slug</Label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
      </div>
      <div>
        <Label>Image</Label>
        <Input type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) {
            const url = await uploadImage(f, "category-images");
            setForm({ ...form, image_url: url });
          }
        }} />
        {form.image_url && <img src={form.image_url} className="mt-2 w-24 h-24 object-cover rounded" />}
      </div>
      <div>
        <Label>Display order</Label>
        <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_visible} onCheckedChange={(v) => setForm({ ...form, is_visible: v })} />
        <Label>Visible</Label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !form.name}>{busy ? "Saving…" : "Save"}</Button>
      </DialogFooter>
    </div>
  );
};

const CategoriesAdmin = () => {
  const { data: categories = [] } = useCategories();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete this category?", description: "Products will become uncategorised." }))) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      void logAdminActivity({ action: "category_deleted", entity: "category", entity_id: id });
      qc.invalidateQueries({ queryKey: ["categories"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Categories</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
              <Plus /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
            <CategoryForm cat={editing || undefined} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-4 flex items-center gap-3">
            <img src={c.image_url || ""} className="w-16 h-16 object-cover rounded-full" />
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">/{c.slug} • order {c.display_order}{!c.is_visible && " • hidden"}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoriesAdmin;
