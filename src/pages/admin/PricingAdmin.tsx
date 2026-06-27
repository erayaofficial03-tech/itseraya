import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useAdminSettings } from "@/lib/queries";
import { usePricingComponents, type PricingComponent, type PricingSection } from "@/lib/pricing";
import { logAdminActivity } from "@/lib/adminLog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { invalidateSettings } from "@/lib/invalidateSettings";

const SECTIONS: { key: PricingSection; title: string; unit: string; help: string }[] = [
  { key: "packing_bom", title: "Packing BOM", unit: "₹", help: "Flat add per unit." },
  { key: "buffer_margin", title: "Buffer Margins", unit: "%", help: "Compounded on running total." },
  { key: "shipping_charge", title: "Shipping Charges", unit: "₹", help: "Averaged into MRP formula." },
];

const SectionEditor = ({ section, title, unit, help, rows }: {
  section: PricingSection; title: string; unit: string; help: string; rows: PricingComponent[];
}) => {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<PricingComponent[]>(rows);
  useEffect(() => setDraft(rows), [rows]);

  const addRow = () => {
    setDraft((cur) => [
      ...cur,
      {
        id: `new-${Date.now()}-${cur.length}`,
        section,
        label: "New row",
        amount: 0,
        sort_order: cur.length + 1,
      },
    ]);
  };

  const removeRow = async (r: PricingComponent) => {
    if (!r.id.startsWith("new-")) {
      const { error } = await supabase.from("pricing_components" as any).delete().eq("id", r.id);
      if (error) return toast.error(error.message);
      await logAdminActivity({
        action: "pricing.component.delete",
        entity: "pricing_components",
        entity_id: r.id,
        details: { section, label: r.label, amount: r.amount },
      });
    }
    setDraft((cur) => cur.filter((x) => x.id !== r.id));
    qc.invalidateQueries({ queryKey: ["pricing_components"] });
  };

  const save = async () => {
    try {
      const toInsert = draft.filter((r) => r.id.startsWith("new-")).map((r, i) => ({
        section, label: r.label, amount: Number(r.amount) || 0, sort_order: i + 1,
      }));
      const toUpdate = draft.filter((r) => !r.id.startsWith("new-")).map((r, i) => ({
        id: r.id, section, label: r.label, amount: Number(r.amount) || 0, sort_order: i + 1,
      }));
      if (toInsert.length) {
        const { error } = await supabase.from("pricing_components" as any).insert(toInsert);
        if (error) throw error;
      }
      for (const u of toUpdate) {
        const { error } = await supabase.from("pricing_components" as any)
          .update({ label: u.label, amount: u.amount, sort_order: u.sort_order })
          .eq("id", u.id);
        if (error) throw error;
      }
      toast.success(`${title} saved`);
      await logAdminActivity({
        action: "pricing.section.save",
        entity: "pricing_components",
        details: {
          section,
          inserted: toInsert.length,
          updated: toUpdate.length,
          rows: draft.map((r) => ({ label: r.label, amount: Number(r.amount) || 0 })),
        },
      });
      qc.invalidateQueries({ queryKey: ["pricing_components"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setDraft((cur) => {
      const oldIdx = cur.findIndex((x) => x.id === active.id);
      const newIdx = cur.findIndex((x) => x.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return cur;
      return arrayMove(cur, oldIdx, newIdx).map((x, i) => ({ ...x, sort_order: i + 1 }));
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{help} Drag <GripVertical className="inline h-3 w-3" /> to reorder, then Save.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addRow}><Plus className="h-3 w-3" /> Row</Button>
          <Button size="sm" onClick={save}><Save className="h-3 w-3" /> Save</Button>
        </div>
      </div>
      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={draft.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            {draft.map((r) => (
              <SortableRow
                key={r.id}
                row={r}
                unit={unit}
                onLabel={(v) =>
                  setDraft((cur) => cur.map((x) => (x.id === r.id ? { ...x, label: v } : x)))
                }
                onAmount={(v) =>
                  setDraft((cur) => cur.map((x) => (x.id === r.id ? { ...x, amount: v } : x)))
                }
                onRemove={() => removeRow(r)}
              />
            ))}
          </SortableContext>
        </DndContext>
        {!draft.length && <p className="text-sm text-muted-foreground">No rows yet.</p>}
      </div>
    </Card>
  );
};

const SortableRow = ({
  row, unit, onLabel, onAmount, onRemove,
}: {
  row: PricingComponent;
  unit: string;
  onLabel: (v: string) => void;
  onAmount: (v: number) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : "auto" as const,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_1fr_120px_auto] gap-2 items-center bg-background rounded"
    >
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input value={row.label} onChange={(e) => onLabel(e.target.value)} />
      <div className="relative">
        <Input
          type="number"
          value={row.amount}
          onChange={(e) => onAmount(Number(e.target.value))}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={onRemove}>
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
};

const PricingAdmin = () => {
  const { data: components = [] } = usePricingComponents();
  const { data: settings } = useAdminSettings();
  const qc = useQueryClient();

  const flatShip = components
    .filter((c) => c.section === "shipping_charge")
    .reduce((s, x) => s + Number(x.amount || 0), 0);

  const [mults, setMults] = useState({ sell: 2, mrp: 2, freeMin: 999, packing: 0 });
  useEffect(() => {
    if (settings) {
      setMults({
        sell: Number((settings as any).pricing_sell_multiplier ?? 2),
        mrp: Number((settings as any).pricing_mrp_multiplier ?? 2),
        freeMin: Number((settings as any).shipping_free_above ?? (settings as any).shipping_free_min_order ?? 999),
        packing: Number((settings as any).packing_cost ?? 0),
      });
    }
  }, [settings]);

  const saveMults = async () => {
    const { error } = await supabase.from("settings").update({
      pricing_sell_multiplier: mults.sell,
      pricing_mrp_multiplier: mults.mrp,
      shipping_free_above: mults.freeMin,
      shipping_charge: flatShip,
      packing_cost: mults.packing,
    } as any).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Multipliers, shipping & packing saved");
    await logAdminActivity({
      action: "pricing.rules.save",
      entity: "settings",
      details: {
        pricing_sell_multiplier: mults.sell,
        pricing_mrp_multiplier: mults.mrp,
        shipping_free_above: mults.freeMin,
        shipping_charge: flatShip,
        packing_cost: mults.packing,
      },
    });
    invalidateSettings(qc);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl">Pricing & Shipping</h1>
        <p className="text-sm text-muted-foreground">
          Components that feed the product Auto Price Calculator and the storefront shipping rules.
        </p>
      </div>

      {SECTIONS.map((s) => (
        <SectionEditor
          key={s.key}
          section={s.key}
          title={s.title}
          unit={s.unit}
          help={s.help}
          rows={components.filter((c) => c.section === s.key)}
        />
      ))}

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Multipliers & Shipping Rules</h3>
          <Button size="sm" onClick={saveMults}><Save className="h-3 w-3" /> Save</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Sell-price multiplier</Label>
            <Input type="number" step="0.1" value={mults.sell}
              onChange={(e) => setMults({ ...mults, sell: Number(e.target.value) })} />
            <p className="text-[11px] text-muted-foreground mt-1">Min Sell Price = product cost × this</p>
          </div>
          <div>
            <Label>MRP multiplier</Label>
            <Input type="number" step="0.1" value={mults.mrp}
              onChange={(e) => setMults({ ...mults, mrp: Number(e.target.value) })} />
            <p className="text-[11px] text-muted-foreground mt-1">MRP = (cost + avg shipping) × this</p>
          </div>
          <div>
            <Label>Free shipping minimum order (₹)</Label>
            <Input type="number" value={mults.freeMin}
              onChange={(e) => setMults({ ...mults, freeMin: Number(e.target.value) })} />
            <p className="text-[11px] text-muted-foreground mt-1">Orders ≥ this amount ship free.</p>
          </div>
          <div>
            <Label>Flat shipping cost (₹)</Label>
            <Input type="number" value={flatShip} readOnly disabled />
            <p className="text-[11px] text-muted-foreground mt-1">
              Auto-calculated from the total of all Shipping Charges rows above. Charged when order is below free-ship minimum.
            </p>
          </div>
          <div className="sm:col-span-2 border-t pt-4">
            <Label>Packing Cost (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={mults.packing}
              onChange={(e) => setMults({ ...mults, packing: Number(e.target.value) })}
            />
            <p className="text-[11px] text-amber-600 mt-1">
              ⚠️ Internal only. Never shown to customers. Visible only in Admin → Orders breakdown.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PricingAdmin;
