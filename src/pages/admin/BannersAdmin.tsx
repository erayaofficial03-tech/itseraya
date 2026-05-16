import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GripVertical, Plus, Trash2, Smartphone, Tablet, Monitor, Loader2, Upload, X, ImageIcon, Calendar as CalendarIcon, Clock, CircleDot, CircleDashed } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { type Banner } from "@/components/eraya/banner-types";
import { BannerRenderer } from "@/components/eraya/BannerRenderer";
import { RangeSlider } from "@/components/admin/controls/RangeSlider";
import { ColorPicker } from "@/components/admin/controls/ColorPicker";
import { FontWeightPicker } from "@/components/admin/controls/FontWeightPicker";
import { AlignPicker } from "@/components/admin/controls/AlignPicker";
import { FontFamilySelect } from "@/components/admin/controls/FontFamilySelect";

type Viewport = "mobile" | "tablet" | "desktop";

const VIEWPORTS: Record<Viewport, { width: number; label: string; Icon: typeof Smartphone }> = {
  mobile: { width: 390, label: "Mobile", Icon: Smartphone },
  tablet: { width: 768, label: "Tablet", Icon: Tablet },
  desktop: { width: 1280, label: "Desktop", Icon: Monitor },
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
      return (data || []) as unknown as Banner[];
    },
  });


const SortableRow = ({
  b, selected, onSelect, onToggleActive, onDelete,
}: {
  b: Banner; selected: boolean;
  onSelect: () => void; onToggleActive: (v: boolean) => void; onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 border rounded-lg bg-card transition-colors",
        selected ? "border-[#C9A84C] ring-1 ring-[#C9A84C]" : "border-border hover:border-muted-foreground/40",
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground p-1">
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onSelect} className="flex items-center gap-2 flex-1 min-w-0 text-left">
        {b.image_url ? (
          <img src={b.image_url} className="h-10 w-14 rounded object-cover bg-muted shrink-0" alt="" />
        ) : (
          <div className="h-10 w-14 rounded bg-muted shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{b.heading_text || b.title || "Untitled"}</p>
          <div className="flex gap-1 mt-0.5">
            {b.is_active ? (
              <Badge className="text-[9px] py-0 h-4 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-0">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-[9px] py-0 h-4">Off</Badge>
            )}
          </div>
        </div>
      </button>
      <Switch checked={!!b.is_active} onCheckedChange={onToggleActive} />
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
};

const ImageField = ({
  label, url, aspect, previewWidth, onUpload, onRemove,
}: {
  label: string;
  url: string | null;
  aspect: string;
  previewWidth: string;
  onUpload: (f: File) => Promise<void> | void;
  onRemove: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const handle = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    try { await onUpload(f); } finally { setBusy(false); }
  };
  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ""; }}
      />
      {url ? (
        <div className="flex items-start gap-3">
          <img src={url} className={cn("object-cover rounded border border-border", previewWidth, aspect)} alt="" />
          <div className="flex flex-col gap-1.5">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
              Replace
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onRemove}>
              <X className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center justify-center gap-1 w-full max-w-sm aspect-[16/7] border-2 border-dashed border-border rounded-md hover:border-[#C9A84C] hover:bg-muted/50 transition-colors text-muted-foreground"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          <span className="text-xs">{busy ? "Uploading…" : "Click to upload image"}</span>
        </button>
      )}
    </div>
  );
};

const combineDateTime = (date: Date | undefined, time: string): string | null => {
  if (!date) return null;
  const [h, m] = (time || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const DateTimePicker = ({
  label, value, onChange, placeholder, minDate,
}: {
  label: string;
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder: string;
  minDate?: Date;
}) => {
  const date = value ? new Date(value) : undefined;
  const time = date ? format(date, "HH:mm") : "09:00";
  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center justify-between">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-0.5"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn("flex-1 justify-start text-left font-normal h-9", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {date ? format(date, "MMM d, yyyy") : <span className="text-xs">{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => onChange(combineDateTime(d ?? undefined, time))}
              disabled={minDate ? (d) => d < new Date(minDate.toDateString()) : undefined}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <div className="relative">
          <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="time"
            value={time}
            onChange={(e) => onChange(combineDateTime(date || new Date(), e.target.value))}
            className="w-[110px] h-9 pl-7 text-xs"
          />
        </div>
      </div>
    </div>
  );
};

const ScheduleEditor = ({
  startsAt, expiresAt, isActive, onChange,
}: {
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  onChange: (starts: string | null, expires: string | null) => void;
}) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const startsDate = startsAt ? new Date(startsAt) : null;
  const expiresDate = expiresAt ? new Date(expiresAt) : null;
  const invalidRange = startsDate && expiresDate && expiresDate <= startsDate;

  let state: "off" | "live" | "scheduled" | "expired" | "invalid" = isActive ? "live" : "off";
  let detail = "";
  if (!isActive) {
    state = "off";
    detail = "Inactive — toggle the banner on to enable scheduling.";
  } else if (invalidRange) {
    state = "invalid";
    detail = "End date must be after start date.";
  } else if (startsDate && now < startsDate) {
    state = "scheduled";
    detail = `Goes live ${format(startsDate, "MMM d, yyyy 'at' h:mm a")}`;
  } else if (expiresDate && now >= expiresDate) {
    state = "expired";
    detail = `Expired ${format(expiresDate, "MMM d, yyyy 'at' h:mm a")}`;
  } else {
    state = "live";
    detail = expiresDate
      ? `Showing now until ${format(expiresDate, "MMM d, yyyy 'at' h:mm a")}`
      : "Showing now — no end date set.";
  }

  const palette = {
    live:      { dot: "bg-emerald-500", ring: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", label: "Currently active" },
    scheduled: { dot: "bg-amber-500",   ring: "bg-amber-500/15 text-amber-700 border-amber-500/30",       label: "Scheduled" },
    expired:   { dot: "bg-muted-foreground", ring: "bg-muted text-muted-foreground border-border",        label: "Expired" },
    off:       { dot: "bg-muted-foreground", ring: "bg-muted text-muted-foreground border-border",        label: "Inactive" },
    invalid:   { dot: "bg-destructive", ring: "bg-destructive/10 text-destructive border-destructive/30", label: "Invalid range" },
  }[state];

  return (
    <div className="space-y-4">
      <div className={cn("flex items-start gap-3 p-3 rounded-lg border", palette.ring)}>
        <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
          {state === "live" && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
          )}
          <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", palette.dot)} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight">{palette.label}</p>
          <p className="text-[11px] opacity-80 mt-0.5">{detail}</p>
        </div>
        {state === "live" ? <CircleDot className="h-4 w-4 opacity-70" /> : <CircleDashed className="h-4 w-4 opacity-70" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DateTimePicker
          label="Starts at"
          value={startsAt}
          placeholder="Anytime (no start)"
          onChange={(v) => onChange(v, expiresAt)}
        />
        <DateTimePicker
          label="Ends at"
          value={expiresAt}
          placeholder="Never expires"
          minDate={startsDate || undefined}
          onChange={(v) => onChange(startsAt, v)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "Start now", fn: () => onChange(new Date().toISOString(), expiresAt) },
          { label: "+1 day", fn: () => onChange(startsAt, new Date(Date.now() + 86400000).toISOString()) },
          { label: "+7 days", fn: () => onChange(startsAt, new Date(Date.now() + 7 * 86400000).toISOString()) },
          { label: "+30 days", fn: () => onChange(startsAt, new Date(Date.now() + 30 * 86400000).toISOString()) },
          { label: "Always on", fn: () => onChange(null, null) },
        ].map((p) => (
          <Button key={p.label} type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={p.fn}>
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

const FocalPointOverlay = ({
  x, y, onChange,
}: {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromEvent = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.round(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
    const ny = Math.round(Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100)));
    onChange(nx, ny);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => updateFromEvent(e.clientX, e.clientY);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 z-20 select-none",
        dragging ? "cursor-grabbing" : "cursor-crosshair",
      )}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setDragging(true);
        updateFromEvent(e.clientX, e.clientY);
      }}
    >
      {/* crosshair guides */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none"
        style={{ left: `${x}%` }}
      />
      <div
        className="absolute left-0 right-0 h-px bg-white/30 pointer-events-none"
        style={{ top: `${y}%` }}
      />
      {/* handle */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform",
          dragging && "scale-110",
        )}
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <div className="relative h-6 w-6 rounded-full bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.4)] ring-2 ring-[#C9A84C] flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono whitespace-nowrap">
          {x}% · {y}%
        </div>
      </div>
    </div>
  );
};

const defaultsForNew = (order: number): Partial<Banner> => ({
  title: null,
  subtitle: null,
  is_active: true,
  display_order: order,
  starts_at: null,
  expires_at: null,
  text_color: "#FFFFFF",
  image_url: null,
  image_mobile_url: null,
  heading_text: "Adorn Your Story",
  heading_font_family: "Playfair Display",
  heading_font_size_mobile: 28,
  heading_font_size_desktop: 48,
  heading_font_weight: "bold",
  heading_italic: false,
  heading_uppercase: false,
  heading_letter_spacing: 0,
  heading_line_height: 1.2,
  heading_color: "#FFFFFF",
  heading_opacity: 100,
  subheading_text: "Handcrafted artificial jewellery",
  subheading_font_family: "Inter",
  subheading_font_size_mobile: 14,
  subheading_font_size_desktop: 18,
  subheading_font_weight: "normal",
  subheading_italic: false,
  subheading_uppercase: false,
  subheading_letter_spacing: 0,
  subheading_color: "#FFFFFF",
  subheading_opacity: 85,
  content_h_align: "left",
  content_v_align: "center",
  content_padding_x: 24,
  content_padding_y: 32,
  content_max_width: 560,
  btn_visible: true,
  btn_text: "Shop Now",
  btn_url: "/catalogue",
  btn_bg_color: "#C9A84C",
  btn_text_color: "#FFFFFF",
  btn_border_color: "transparent",
  btn_border_width: 0,
  btn_border_radius: 50,
  btn_font_size: 14,
  btn_font_weight: "semibold",
  btn_italic: false,
  btn_letter_spacing: 0,
  btn_padding_x: 28,
  btn_padding_y: 14,
  btn_shadow: true,
  btn_align: "left",
  btn_full_width_mobile: false,
  overlay_color: "#000000",
  overlay_opacity: 40,
  overlay_gradient: true,
  bg_focal_x: 50,
  bg_focal_y: 50,
  height_mobile: 420,
  height_desktop: 580,
  autoplay_duration: 5000,
  transition: "fade",
});

const BannersAdmin = () => {
  const { data: list = [], refetch } = useAllBanners();
  const qc = useQueryClient();
  const [items, setItems] = useState<Banner[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Banner | null>(null);
  const [viewport, setViewport] = useState<Viewport>("mobile");
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    setItems(list);
    if (!selectedId && list.length > 0) setSelectedId(list[0].id);
  }, [list, selectedId]);

  useEffect(() => {
    const found = items.find((i) => i.id === selectedId) || null;
    setDraft(found ? { ...found } : null);
  }, [selectedId, items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["banners-active"] });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

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
    invalidate();
  };

  const addNew = async () => {
    const payload = defaultsForNew(items.length);
    const { data, error } = await supabase
      .from("banners")
      .insert(payload as never)
      .select()
      .single();
    if (error) return toast.error(error.message);
    toast.success("Banner created");
    await refetch();
    invalidate();
    setSelectedId((data as { id: string }).id);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selectedId === id) setSelectedId(null);
    toast.success("Deleted");
    await refetch();
    invalidate();
  };

  const toggleActive = async (id: string, v: boolean) => {
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: v } : b)));
    await supabase.from("banners").update({ is_active: v }).eq("id", id);
    invalidate();
  };

  // Debounced auto-save
  const updateDraft = <K extends keyof Banner>(key: K, value: Banner[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  useEffect(() => {
    if (!draft) return;
    const original = items.find((i) => i.id === draft.id);
    if (!original) return;
    const changed = JSON.stringify(original) !== JSON.stringify(draft);
    if (!changed) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      setSaving(true);
      const { id, ...payload } = draft;
      const { error } = await supabase.from("banners").update(payload as never).eq("id", id);
      setSaving(false);
      if (error) {
        toast.error(error.message);
      } else {
        setItems((prev) => prev.map((b) => (b.id === id ? draft : b)));
        invalidate();
      }
    }, 800);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const uploadFor = async (field: "image_url" | "image_mobile_url", file: File) => {
    const url = await uploadImage(file, "banners", field === "image_mobile_url" ? "mobile" : "");
    updateDraft(field, url);
  };

  const previewHeight = useMemo(() => {
    if (!draft) return 420;
    if (viewport === "desktop") return draft.height_desktop ?? 580;
    if (viewport === "tablet") return Math.round(((draft.height_mobile ?? 420) + (draft.height_desktop ?? 580)) / 2);
    return draft.height_mobile ?? 420;
  }, [draft, viewport]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Banners</h1>
          <p className="text-sm text-muted-foreground">Visual editor with live preview · changes auto-save</p>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
          <Button onClick={addNew} className="bg-[#C9A84C] text-white hover:bg-[#b3934a]">
            <Plus className="h-4 w-4 mr-1" /> Add Banner
          </Button>
        </div>
      </div>

      <BannerAnalytics banners={items} />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* LEFT: list */}
        <Card>
          <CardContent className="p-3">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">No banners yet. Click "Add Banner".</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {items.map((b) => (
                      <SortableRow
                        key={b.id}
                        b={b}
                        selected={b.id === selectedId}
                        onSelect={() => setSelectedId(b.id)}
                        onToggleActive={(v) => toggleActive(b.id, v)}
                        onDelete={() => remove(b.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: preview + controls */}
        {draft ? (
          <div className="space-y-4">
            {/* Preview */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</Label>
                  <div className="inline-flex rounded-md border border-border overflow-hidden">
                    {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => {
                      const { Icon, label } = VIEWPORTS[v];
                      return (
                        <button
                          key={v}
                          onClick={() => setViewport(v)}
                          className={cn(
                            "px-3 py-1.5 text-xs flex items-center gap-1.5",
                            viewport === v ? "bg-[#C9A84C] text-white" : "bg-background hover:bg-muted",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" /> {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 overflow-x-auto">
                  <div
                    className="mx-auto rounded-lg overflow-hidden shadow-sm bg-black relative"
                    style={{ width: "100%", maxWidth: VIEWPORTS[viewport].width }}
                  >
                    <BannerRenderer
                      banner={draft}
                      viewport={viewport}
                      height={previewHeight}
                      useRouter={false}
                      trackClicks={false}
                      animKey={`${draft.id}-${viewport}`}
                    />
                    {draft.image_url && (
                      <FocalPointOverlay
                        x={draft.bg_focal_x ?? 50}
                        y={draft.bg_focal_y ?? 50}
                        onChange={(x, y) => {
                          updateDraft("bg_focal_x", x);
                          updateDraft("bg_focal_y", y);
                        }}
                      />
                    )}
                  </div>
                </div>
                {draft.image_url && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Drag the dot on the preview to reposition the background image.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="bg">
                  <TabsList className="flex flex-wrap h-auto">
                    <TabsTrigger value="bg">Background</TabsTrigger>
                    <TabsTrigger value="heading">Heading</TabsTrigger>
                    <TabsTrigger value="sub">Subheading</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                    <TabsTrigger value="button">Button</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  {/* BACKGROUND */}
                  <TabsContent value="bg" className="space-y-4 pt-4">
                    <ImageField
                      label="Background image"
                      url={draft.image_url}
                      aspect="aspect-[16/7]"
                      previewWidth="w-full max-w-sm"
                      onUpload={(f) => uploadFor("image_url", f)}
                      onRemove={() => updateDraft("image_url", null)}
                    />
                    <ImageField
                      label="Mobile image (optional)"
                      url={draft.image_mobile_url}
                      aspect="aspect-[3/4]"
                      previewWidth="w-32"
                      onUpload={(f) => uploadFor("image_mobile_url", f)}
                      onRemove={() => updateDraft("image_mobile_url", null)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <RangeSlider label="Focal point X" value={draft.bg_focal_x ?? 50} onChange={(v) => updateDraft("bg_focal_x", v)} min={0} max={100} unit="%" />
                      <RangeSlider label="Focal point Y" value={draft.bg_focal_y ?? 50} onChange={(v) => updateDraft("bg_focal_y", v)} min={0} max={100} unit="%" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <RangeSlider label="Height (mobile)" value={draft.height_mobile ?? 420} onChange={(v) => updateDraft("height_mobile", v)} min={240} max={800} unit="px" />
                      <RangeSlider label="Height (desktop)" value={draft.height_desktop ?? 580} onChange={(v) => updateDraft("height_desktop", v)} min={300} max={900} unit="px" />
                    </div>
                    <ColorPicker
                      label="Overlay color"
                      value={draft.overlay_color || "#000000"}
                      onChange={(v) => updateDraft("overlay_color", v)}
                      opacity={draft.overlay_opacity ?? 40}
                      onOpacityChange={(v) => updateDraft("overlay_opacity", v)}
                    />
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Gradient overlay</Label>
                      <Switch checked={!!draft.overlay_gradient} onCheckedChange={(v) => updateDraft("overlay_gradient", v)} />
                    </div>
                  </TabsContent>

                  {/* HEADING */}
                  <TabsContent value="heading" className="space-y-4 pt-4">
                    <div>
                      <Label className="text-xs">Text</Label>
                      <Input value={draft.heading_text || ""} onChange={(e) => updateDraft("heading_text", e.target.value)} />
                    </div>
                    <FontFamilySelect label="Font family" value={draft.heading_font_family || "Playfair Display"} onChange={(v) => updateDraft("heading_font_family", v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <RangeSlider label="Size (mobile)" value={draft.heading_font_size_mobile ?? 28} onChange={(v) => updateDraft("heading_font_size_mobile", v)} min={16} max={60} unit="px" />
                      <RangeSlider label="Size (desktop)" value={draft.heading_font_size_desktop ?? 48} onChange={(v) => updateDraft("heading_font_size_desktop", v)} min={20} max={80} unit="px" />
                    </div>
                    <FontWeightPicker value={draft.heading_font_weight || "bold"} onChange={(v) => updateDraft("heading_font_weight", v)} />
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={!!draft.heading_italic} onCheckedChange={(v) => updateDraft("heading_italic", v)} /> Italic
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={!!draft.heading_uppercase} onCheckedChange={(v) => updateDraft("heading_uppercase", v)} /> Uppercase
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <RangeSlider label="Letter spacing" value={Number(draft.heading_letter_spacing ?? 0)} onChange={(v) => updateDraft("heading_letter_spacing", v)} min={-2} max={10} step={0.5} unit="px" />
                      <RangeSlider label="Line height" value={Number(draft.heading_line_height ?? 1.2)} onChange={(v) => updateDraft("heading_line_height", v)} min={0.8} max={2} step={0.1} />
                    </div>
                    <ColorPicker
                      label="Color"
                      value={draft.heading_color || "#FFFFFF"}
                      onChange={(v) => updateDraft("heading_color", v)}
                      opacity={draft.heading_opacity ?? 100}
                      onOpacityChange={(v) => updateDraft("heading_opacity", v)}
                    />
                  </TabsContent>

                  {/* SUBHEADING */}
                  <TabsContent value="sub" className="space-y-4 pt-4">
                    <div>
                      <Label className="text-xs">Text</Label>
                      <Input value={draft.subheading_text || ""} onChange={(e) => updateDraft("subheading_text", e.target.value)} placeholder="Optional subtitle" />
                    </div>
                    <FontFamilySelect label="Font family" value={draft.subheading_font_family || "Inter"} onChange={(v) => updateDraft("subheading_font_family", v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <RangeSlider label="Size (mobile)" value={draft.subheading_font_size_mobile ?? 14} onChange={(v) => updateDraft("subheading_font_size_mobile", v)} min={10} max={32} unit="px" />
                      <RangeSlider label="Size (desktop)" value={draft.subheading_font_size_desktop ?? 18} onChange={(v) => updateDraft("subheading_font_size_desktop", v)} min={12} max={48} unit="px" />
                    </div>
                    <FontWeightPicker value={draft.subheading_font_weight || "normal"} onChange={(v) => updateDraft("subheading_font_weight", v)} />
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={!!draft.subheading_italic} onCheckedChange={(v) => updateDraft("subheading_italic", v)} /> Italic
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={!!draft.subheading_uppercase} onCheckedChange={(v) => updateDraft("subheading_uppercase", v)} /> Uppercase
                      </label>
                    </div>
                    <RangeSlider label="Letter spacing" value={Number(draft.subheading_letter_spacing ?? 0)} onChange={(v) => updateDraft("subheading_letter_spacing", v)} min={-2} max={10} step={0.5} unit="px" />
                    <ColorPicker
                      label="Color"
                      value={draft.subheading_color || "#FFFFFF"}
                      onChange={(v) => updateDraft("subheading_color", v)}
                      opacity={draft.subheading_opacity ?? 85}
                      onOpacityChange={(v) => updateDraft("subheading_opacity", v)}
                    />
                  </TabsContent>

                  {/* LAYOUT */}
                  <TabsContent value="layout" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <AlignPicker label="Horizontal align" value={draft.content_h_align || "left"} onChange={(v) => updateDraft("content_h_align", v)} axis="h" />
                      <AlignPicker label="Vertical align" value={draft.content_v_align || "center"} onChange={(v) => updateDraft("content_v_align", v)} axis="v" />
                    </div>
                    <RangeSlider label="Max content width" value={draft.content_max_width ?? 560} onChange={(v) => updateDraft("content_max_width", v)} min={200} max={800} unit="px" />
                    <div className="grid grid-cols-2 gap-4">
                      <RangeSlider label="Padding X" value={draft.content_padding_x ?? 24} onChange={(v) => updateDraft("content_padding_x", v)} min={0} max={80} unit="px" />
                      <RangeSlider label="Padding Y" value={draft.content_padding_y ?? 32} onChange={(v) => updateDraft("content_padding_y", v)} min={0} max={80} unit="px" />
                    </div>
                  </TabsContent>

                  {/* BUTTON */}
                  <TabsContent value="button" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show button</Label>
                      <Switch checked={!!draft.btn_visible} onCheckedChange={(v) => updateDraft("btn_visible", v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Text</Label>
                        <Input value={draft.btn_text || ""} onChange={(e) => updateDraft("btn_text", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">URL</Label>
                        <Input value={draft.btn_url || ""} onChange={(e) => updateDraft("btn_url", e.target.value)} placeholder="/catalogue" />
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-3">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Style</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <ColorPicker label="Background" value={draft.btn_bg_color || "#C9A84C"} onChange={(v) => updateDraft("btn_bg_color", v)} />
                        <ColorPicker label="Text color" value={draft.btn_text_color || "#FFFFFF"} onChange={(v) => updateDraft("btn_text_color", v)} />
                      </div>
                      <RangeSlider label="Border radius" value={draft.btn_border_radius ?? 50} onChange={(v) => updateDraft("btn_border_radius", v)} min={0} max={50} unit="px" />
                      <div className="grid grid-cols-2 gap-4">
                        <RangeSlider label="Border width" value={draft.btn_border_width ?? 0} onChange={(v) => updateDraft("btn_border_width", v)} min={0} max={4} unit="px" />
                        <ColorPicker label="Border color" value={draft.btn_border_color || "#000000"} onChange={(v) => updateDraft("btn_border_color", v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Shadow</Label>
                        <Switch checked={!!draft.btn_shadow} onCheckedChange={(v) => updateDraft("btn_shadow", v)} />
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-3">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Typography</Label>
                      <RangeSlider label="Font size" value={draft.btn_font_size ?? 14} onChange={(v) => updateDraft("btn_font_size", v)} min={10} max={24} unit="px" />
                      <FontWeightPicker value={draft.btn_font_weight || "semibold"} onChange={(v) => updateDraft("btn_font_weight", v)} />
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-xs">
                          <Switch checked={!!draft.btn_italic} onCheckedChange={(v) => updateDraft("btn_italic", v)} /> Italic
                        </label>
                      </div>
                      <RangeSlider label="Letter spacing" value={Number(draft.btn_letter_spacing ?? 0)} onChange={(v) => updateDraft("btn_letter_spacing", v)} min={-1} max={8} step={0.5} unit="px" />
                    </div>

                    <div className="border-t pt-3 space-y-3">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Size & Alignment</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <RangeSlider label="Padding X" value={draft.btn_padding_x ?? 28} onChange={(v) => updateDraft("btn_padding_x", v)} min={8} max={60} unit="px" />
                        <RangeSlider label="Padding Y" value={draft.btn_padding_y ?? 14} onChange={(v) => updateDraft("btn_padding_y", v)} min={6} max={30} unit="px" />
                      </div>
                      <AlignPicker label="Button align" value={draft.btn_align || "left"} onChange={(v) => updateDraft("btn_align", v)} />
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Full width on mobile</Label>
                        <Switch checked={!!draft.btn_full_width_mobile} onCheckedChange={(v) => updateDraft("btn_full_width_mobile", v)} />
                      </div>
                    </div>
                  </TabsContent>

                  {/* SCHEDULE */}
                  <TabsContent value="schedule" className="space-y-4 pt-4">
                    <ScheduleEditor
                      startsAt={draft.starts_at}
                      expiresAt={draft.expires_at}
                      isActive={!!draft.is_active}
                      onChange={(starts, expires) => {
                        updateDraft("starts_at", starts);
                        updateDraft("expires_at", expires);
                      }}
                    />
                    <div className="border-t pt-3 space-y-3">
                      <RangeSlider label="Autoplay duration" value={draft.autoplay_duration ?? 5000} onChange={(v) => updateDraft("autoplay_duration", v)} min={2000} max={10000} step={500} unit="ms" />
                      <div>
                        <Label className="text-xs mb-1.5 block">Transition</Label>
                        <div className="inline-flex rounded-md border border-border overflow-hidden">
                          {["fade", "slide"].map((t) => (
                            <button
                              key={t}
                              onClick={() => updateDraft("transition", t)}
                              className={cn(
                                "px-4 py-1.5 text-xs capitalize",
                                (draft.transition || "fade") === t ? "bg-[#C9A84C] text-white" : "bg-background hover:bg-muted",
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Select a banner from the list, or click "Add Banner" to create one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BannersAdmin;
