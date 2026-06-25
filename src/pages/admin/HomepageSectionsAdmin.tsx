import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Eye, EyeOff, Trash2, Plus, Smartphone, Monitor, Settings as SettingsIcon,
  Layers, Image, Tag, ShoppingBag, Sparkles, Star, Heart, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirm } from "@/components/ui/confirm-dialog";
import { useHomepageSections, useSettings, type HomepageSection, type HomepageSectionType } from "@/lib/queries";


// ─── Catalog of section types ────────────────────────────────────────────
const SECTION_CATALOG: {
  type: HomepageSectionType;
  label: string;
  description: string;
  icon: any;
  defaultProps: HomepageSection["props"];
}[] = [
  { type: "hero_slider",     label: "Hero Slider",      description: "Top banner slideshow",         icon: Image,        defaultProps: {} },
  { type: "trust_strip",     label: "Trust Strip",      description: "USP rotator (handcrafted, free shipping…)", icon: Sparkles, defaultProps: {} },
  { type: "category_row",    label: "Category Row",     description: "Horizontal scroll of categories", icon: Tag,        defaultProps: {} },
  { type: "product_row",     label: "Product Row",      description: "Horizontal product grid (filterable)", icon: ShoppingBag, defaultProps: { title: "New Section", source: "new", eyebrow: "Just in", view_all: "/catalogue" } },
  { type: "emotional_strip", label: "Emotional Strip",  description: "Quote/tagline banner",         icon: Heart,        defaultProps: { text: "Jewellery that feels like you." } },
  { type: "eraya_girls",     label: "Eraya Girls",      description: "Lifestyle / community block",  icon: Star,         defaultProps: {} },
  { type: "reviews",         label: "Reviews",          description: "Customer reviews carousel",    icon: MessageSquare, defaultProps: {} },
];

const catalogFor = (t: HomepageSectionType) => SECTION_CATALOG.find((c) => c.type === t);

// ─── Sortable row ─────────────────────────────────────────────────────────
const SortableRow = ({
  section, onEdit, onDelete, onToggle, onToggleDevice,
}: {
  section: HomepageSection;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onToggleDevice: (device: "mobile" | "desktop") => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const meta = catalogFor(section.type);
  const Icon = meta?.icon || Layers;

  return (
    <Card ref={setNodeRef} style={style} className="p-3 flex items-center gap-3 bg-card">
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {section.props?.title || meta?.label || section.type}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {meta?.label}{section.props?.source && ` · ${section.props.source}`}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-1">
        <Button
          type="button" variant="ghost" size="sm"
          className={section.visible_mobile ? "" : "opacity-40"}
          onClick={() => onToggleDevice("mobile")}
          title={section.visible_mobile ? "Hide on mobile" : "Show on mobile"}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          className={section.visible_desktop ? "" : "opacity-40"}
          onClick={() => onToggleDevice("desktop")}
          title={section.visible_desktop ? "Hide on desktop" : "Show on desktop"}
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={onToggle} title={section.is_visible ? "Hide" : "Show"}>
        {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
        <SettingsIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </Card>
  );
};

// ─── Edit drawer ──────────────────────────────────────────────────────────
const EditDialog = ({
  section, open, onOpenChange, onSaved,
}: {
  section: HomepageSection | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) => {
  const [props, setProps] = useState<HomepageSection["props"]>({});
  useEffect(() => { if (section) setProps(section.props || {}); }, [section]);
  if (!section) return null;
  const meta = catalogFor(section.type);

  const save = async () => {
    const { error } = await supabase
      .from("homepage_sections" as any)
      .update({ props })
      .eq("id", section.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Section updated");
    onSaved();
    onOpenChange(false);
  };

  const isProductRow = section.type === "product_row";
  const isEmotional = section.type === "emotional_strip";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit · {meta?.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isProductRow && (
            <>
              <div>
                <Label>Eyebrow</Label>
                <Input value={props.eyebrow || ""} onChange={(e) => setProps({ ...props, eyebrow: e.target.value })} placeholder="Just in" />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={props.title || ""} onChange={(e) => setProps({ ...props, title: e.target.value })} placeholder="New Arrivals" />
              </div>
              <div>
                <Label>Product source</Label>
                <Select value={props.source || "new"} onValueChange={(v: any) => setProps({ ...props, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Newest first</SelectItem>
                    <SelectItem value="bestseller">Bestsellers (tag: bestseller)</SelectItem>
                    <SelectItem value="sale">On sale</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="all">All visible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>View-all link</Label>
                <Input value={props.view_all || ""} onChange={(e) => setProps({ ...props, view_all: e.target.value })} placeholder="/catalogue?filter=new" />
              </div>
              <div>
                <Label>Max products · {props.limit ?? 12}</Label>
                <Input type="number" min={4} max={24} value={props.limit ?? 12} onChange={(e) => setProps({ ...props, limit: Number(e.target.value) })} />
              </div>
            </>
          )}
          {isEmotional && (
            <div>
              <Label>Text</Label>
              <Input value={props.text || ""} onChange={(e) => setProps({ ...props, text: e.target.value })} />
            </div>
          )}
          {!isProductRow && !isEmotional && (
            <p className="text-sm text-muted-foreground">
              This section type has no editable fields. Its content is managed elsewhere
              (e.g. Banners admin for the hero slider, USPs admin for the trust strip).
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Add picker ───────────────────────────────────────────────────────────
const AddDialog = ({ onAdd }: { onAdd: (type: HomepageSectionType) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
          <Plus className="h-4 w-4 mr-1" /> Add section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add a section</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTION_CATALOG.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => { onAdd(c.type); setOpen(false); }}
              className="text-left p-4 rounded-lg border hover:border-primary hover:bg-muted/40 transition-colors flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                <c.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{c.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────
const HomepageSectionsAdmin = () => {
  const { data: sections = [] } = useHomepageSections();
  const qc = useQueryClient();
  const [items, setItems] = useState<HomepageSection[]>([]);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { setItems(sections); }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ["homepage_sections"] });

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    // Renumber & persist
    const updates = next.map((s, i) => ({ id: s.id, display_order: (i + 1) * 10 }));
    for (const u of updates) {
      await supabase.from("homepage_sections" as any).update({ display_order: u.display_order }).eq("id", u.id);
    }
    refresh();
  };

  const toggleVisible = async (s: HomepageSection) => {
    await supabase.from("homepage_sections" as any).update({ is_visible: !s.is_visible }).eq("id", s.id);
    refresh();
  };
  const toggleDevice = async (s: HomepageSection, device: "mobile" | "desktop") => {
    const key = device === "mobile" ? "visible_mobile" : "visible_desktop";
    await supabase.from("homepage_sections" as any).update({ [key]: !(s as any)[key] }).eq("id", s.id);
    refresh();
  };
  const removeSection = async (s: HomepageSection) => {
    if (!(await confirm({ title: "Delete this section?", description: "It will be removed from the homepage." }))) return;
    const { error } = await supabase.from("homepage_sections" as any).delete().eq("id", s.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };
  const addSection = async (type: HomepageSectionType) => {
    const meta = catalogFor(type);
    const nextOrder = (items[items.length - 1]?.display_order ?? 0) + 10;
    const { error } = await supabase.from("homepage_sections" as any).insert({
      type, display_order: nextOrder, props: meta?.defaultProps || {},
    });
    if (error) toast.error(error.message);
    else { toast.success(`${meta?.label} added`); refresh(); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl">Homepage Sections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag to reorder · toggle visibility · edit each block. Changes go live instantly.
          </p>
        </div>
        <AddDialog onAdd={addSection} />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((s) => (
              <SortableRow
                key={s.id}
                section={s}
                onEdit={() => { setEditing(s); setEditOpen(true); }}
                onDelete={() => removeSection(s)}
                onToggle={() => toggleVisible(s)}
                onToggleDevice={(d) => toggleDevice(s, d)}
              />
            ))}
            {items.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                No sections yet. Click <strong>Add section</strong> to start building the homepage.
              </Card>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <EditDialog section={editing} open={editOpen} onOpenChange={setEditOpen} onSaved={refresh} />

      <p className="text-xs text-muted-foreground">
        Tip: Hero Slider content is managed under <strong>Banners</strong> · USPs under <strong>USPs & Reviews</strong> · category content under <strong>Categories</strong>.
      </p>
    </div>
  );
};

export default HomepageSectionsAdmin;
