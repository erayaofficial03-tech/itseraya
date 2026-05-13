import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { GripVertical, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import type { Banner } from "@/components/eraya/HeroSlider";

const blank = (order = 0): Partial<Banner> => ({
  title: "",
  subtitle: "",
  cta_text: "Shop Now",
  cta_url: "/catalogue",
  image_url: "",
  image_mobile_url: "",
  overlay_opacity: 40,
  text_color: "#FFFFFF",
  is_active: true,
  display_order: order,
  starts_at: null,
  expires_at: null,
});

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

const useAllBanners = () =>
  useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Banner[];
    },
  });

const SortableRow = ({ b, onEdit, onDelete }: { b: Banner; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 border border-border rounded-md bg-card">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground p-1">
        <GripVertical className="h-4 w-4" />
      </button>
      {b.image_url ? (
        <img src={b.image_url} alt="" className="h-12 w-20 rounded object-cover bg-muted shrink-0" />
      ) : (
        <div className="h-12 w-20 rounded bg-muted shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{b.title || "Untitled banner"}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {!b.is_active && <Badge variant="outline">Inactive</Badge>}
          {b.starts_at && <Badge variant="outline" className="text-[10px]">From {new Date(b.starts_at).toLocaleDateString()}</Badge>}
          {b.expires_at && <Badge variant="outline" className="text-[10px]">Until {new Date(b.expires_at).toLocaleDateString()}</Badge>}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
    </div>
  );
};

const BannersAdmin = () => {
  const { data: list = [], refetch } = useAllBanners();
  const qc = useQueryClient();
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setItems(list); }, [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await Promise.all(next.map((it, idx) =>
      supabase.from("banners").update({ display_order: idx }).eq("id", it.id),
    ));
    qc.invalidateQueries({ queryKey: ["banners-active"] });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  const openNew = () => { setEditing(blank(items.length)); setOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const payload = {
      title: editing.title || null,
      subtitle: editing.subtitle || null,
      cta_text: editing.cta_text || null,
      cta_url: editing.cta_url || "/catalogue",
      image_url: editing.image_url || null,
      image_mobile_url: editing.image_mobile_url || null,
      overlay_opacity: editing.overlay_opacity ?? 40,
      text_color: editing.text_color || "#FFFFFF",
      is_active: editing.is_active ?? true,
      display_order: editing.display_order ?? 0,
      starts_at: editing.starts_at || null,
      expires_at: editing.expires_at || null,
    };
    const { error } = editing.id
      ? await supabase.from("banners").update(payload).eq("id", editing.id)
      : await supabase.from("banners").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(null);
    refetch();
    qc.invalidateQueries({ queryKey: ["banners-active"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
    qc.invalidateQueries({ queryKey: ["banners-active"] });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Banner Slider</h1>
          <p className="text-sm text-muted-foreground">Hero slider banners. Drag to reorder.</p>
        </div>
        <Button onClick={openNew} className="bg-gold text-charcoal hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-1" /> Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Banners</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No banners yet — your homepage will show the fallback hero.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((b) => (
                    <SortableRow key={b.id} b={b} onEdit={() => openEdit(b)} onDelete={() => remove(b.id)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit banner" : "New banner"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Adorn Your Story" />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Handcrafted jewellery…" />
                </div>
              </div>
              <div>
                <Label>Desktop image</Label>
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) { const url = await uploadImage(f, "banners"); setEditing({ ...editing, image_url: url }); }
                }} />
                {editing.image_url && <img src={editing.image_url} className="mt-2 w-full max-w-md aspect-[16/7] object-cover rounded" />}
              </div>
              <div>
                <Label>Mobile image (optional)</Label>
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) { const url = await uploadImage(f, "banners", "mobile"); setEditing({ ...editing, image_mobile_url: url }); }
                }} />
                {editing.image_mobile_url && <img src={editing.image_mobile_url} className="mt-2 w-40 aspect-[3/4] object-cover rounded" />}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>CTA text</Label>
                  <Input value={editing.cta_text || ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} placeholder="Shop Now" />
                </div>
                <div>
                  <Label>CTA URL</Label>
                  <Input value={editing.cta_url || ""} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} placeholder="/catalogue" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Overlay opacity</Label>
                  <span className="text-xs text-muted-foreground">{editing.overlay_opacity}%</span>
                </div>
                <Slider min={0} max={70} step={1} value={[editing.overlay_opacity ?? 40]} onValueChange={(v) => setEditing({ ...editing, overlay_opacity: v[0] })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Text color</Label>
                  <Input type="color" value={editing.text_color || "#FFFFFF"} onChange={(e) => setEditing({ ...editing, text_color: e.target.value })} />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <Label>Active</Label>
                  <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Starts at</Label>
                  <Input type="datetime-local" value={toLocalInput((editing.starts_at as string) ?? null)} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div>
                  <Label>Expires at</Label>
                  <Input type="datetime-local" value={toLocalInput((editing.expires_at as string) ?? null)} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
              <div>
                <Label>Preview</Label>
                <div className="mt-1 relative rounded-lg overflow-hidden aspect-[16/7] bg-muted">
                  {editing.image_url && <img src={editing.image_url} className="absolute inset-0 w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent" style={{ opacity: (editing.overlay_opacity ?? 40) / 100 }} />
                  <div className="relative h-full flex flex-col justify-center px-6" style={{ color: editing.text_color || "#FFFFFF" }}>
                    {editing.title && <p className="font-serif text-xl">{editing.title}</p>}
                    {editing.subtitle && <p className="text-xs opacity-90">{editing.subtitle}</p>}
                    {editing.cta_text && (
                      <span className="mt-2 inline-block w-fit text-xs px-3 py-1 rounded-full bg-gold text-charcoal">{editing.cta_text}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={busy} className="bg-gold text-charcoal hover:bg-gold/90">
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannersAdmin;
