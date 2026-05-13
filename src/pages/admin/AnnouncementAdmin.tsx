import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { GripVertical, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Announcement } from "@/lib/queries";

const useAllAnnouncements = () =>
  useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Announcement[];
    },
  });

const blank = (): Partial<Announcement> => ({
  title: "",
  message: "",
  cta_text: "",
  cta_url: "",
  bg_color: "#1C1C1C",
  text_color: "#C9A84C",
  is_active: true,
  is_marquee: false,
  display_order: 0,
  starts_at: null,
  expires_at: null,
});

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

const SortableRow = ({ a, onEdit, onDelete }: { a: Announcement; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: a.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border border-border rounded-md bg-card"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground p-1">
        <GripVertical className="h-4 w-4" />
      </button>
      <div
        className="px-2 py-1 rounded text-xs font-medium min-w-[120px] truncate"
        style={{ background: a.bg_color || "#1C1C1C", color: a.text_color || "#C9A84C" }}
      >
        {a.title ? `${a.title}: ` : ""}{a.message}
      </div>
      <div className="flex-1 flex flex-wrap gap-1.5">
        {!a.is_active && <Badge variant="outline">Inactive</Badge>}
        {a.is_marquee && <Badge variant="outline">Marquee</Badge>}
        {a.starts_at && <Badge variant="outline" className="text-[10px]">From {new Date(a.starts_at).toLocaleDateString()}</Badge>}
        {a.expires_at && <Badge variant="outline" className="text-[10px]">Until {new Date(a.expires_at).toLocaleDateString()}</Badge>}
        {a.cta_text && <Badge variant="outline" className="text-[10px]">CTA: {a.cta_text}</Badge>}
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
    </div>
  );
};

const AnnouncementAdmin = () => {
  const { data: list = [], refetch } = useAllAnnouncements();
  const qc = useQueryClient();
  const [items, setItems] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { setItems(list); }, [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    const updates = next.map((it, idx) => supabase.from("announcements").update({ display_order: idx }).eq("id", it.id));
    await Promise.all(updates);
    qc.invalidateQueries({ queryKey: ["announcements"] });
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  const openNew = () => { setEditing({ ...blank(), display_order: items.length }); setOpen(true); };
  const openEdit = (a: Announcement) => { setEditing(a); setOpen(true); };

  const save = async () => {
    if (!editing?.message?.trim()) { toast.error("Message is required"); return; }
    const payload = {
      title: editing.title || null,
      message: editing.message,
      cta_text: editing.cta_text || null,
      cta_url: editing.cta_url || null,
      bg_color: editing.bg_color || "#1C1C1C",
      text_color: editing.text_color || "#C9A84C",
      is_active: editing.is_active ?? true,
      is_marquee: editing.is_marquee ?? false,
      display_order: editing.display_order ?? 0,
      starts_at: editing.starts_at || null,
      expires_at: editing.expires_at || null,
    };
    if (editing.id) {
      const { error } = await supabase.from("announcements").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("announcements").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setOpen(false);
    setEditing(null);
    refetch();
    qc.invalidateQueries({ queryKey: ["announcements"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
    qc.invalidateQueries({ queryKey: ["announcements"] });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Announcement bar</h1>
          <p className="text-sm text-muted-foreground">Site-wide rotating banners. Drag to reorder.</p>
        </div>
        <Button onClick={openNew} className="bg-gold text-charcoal hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-1" /> Add announcement
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Active announcements</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No announcements yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((a) => (
                    <SortableRow key={a.id} a={a} onEdit={() => openEdit(a)} onDelete={() => remove(a.id)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit announcement" : "New announcement"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Title (optional)</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Festive Sale" />
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea value={editing.message || ""} onChange={(e) => setEditing({ ...editing, message: e.target.value })} rows={2} placeholder="🎉 Free shipping on orders above ₹999" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>CTA text</Label>
                  <Input value={editing.cta_text || ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} placeholder="Shop now" />
                </div>
                <div>
                  <Label>CTA link</Label>
                  <Input value={editing.cta_url || ""} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} placeholder="/catalogue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Background</Label>
                  <Input type="color" value={editing.bg_color || "#1C1C1C"} onChange={(e) => setEditing({ ...editing, bg_color: e.target.value })} />
                </div>
                <div>
                  <Label>Text color</Label>
                  <Input type="color" value={editing.text_color || "#C9A84C"} onChange={(e) => setEditing({ ...editing, text_color: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Starts at</Label>
                  <Input type="datetime-local" value={toLocalInput(editing.starts_at as string | null)} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div>
                  <Label>Expires at</Label>
                  <Input type="datetime-local" value={toLocalInput(editing.expires_at as string | null)} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Marquee scroll</Label>
                <Switch checked={editing.is_marquee ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_marquee: v })} />
              </div>
              <div>
                <Label>Preview</Label>
                <div className="mt-1 rounded text-center text-sm py-2" style={{ background: editing.bg_color || "#1C1C1C", color: editing.text_color || "#C9A84C" }}>
                  {editing.title ? <strong>{editing.title}: </strong> : null}
                  {editing.message || "Your announcement here"}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gold text-charcoal hover:bg-gold/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementAdmin;
