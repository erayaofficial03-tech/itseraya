import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";

const SECTIONS = [
  { titleKey: "section_categories_title", visKey: "section_categories_visible", label: "Categories" },
  { titleKey: "section_new_arrivals_title", visKey: "section_new_arrivals_visible", label: "New Arrivals" },
  { titleKey: "section_trending_title", visKey: "section_trending_visible", label: "Trending Now" },
  { titleKey: "section_sale_title", visKey: "section_sale_visible", label: "On Sale" },
  { titleKey: "section_featured_title", visKey: "section_featured_visible", label: "Featured" },
] as const;

const BannerAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!settings) return;
    const next: Record<string, unknown> = {};
    SECTIONS.forEach((s) => {
      next[s.titleKey] = (settings as Record<string, unknown>)[s.titleKey] || "";
      next[s.visKey] = (settings as Record<string, unknown>)[s.visKey] ?? true;
    });
    setForm(next);
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">Homepage Sections</h1>
        <p className="text-sm text-muted-foreground">Manage hero banners in the new <strong>Banners</strong> page. Below: section visibility &amp; titles.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Section visibility &amp; headings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {SECTIONS.map((s) => (
            <div key={s.titleKey} className="flex items-center gap-3">
              <Switch checked={!!form[s.visKey]} onCheckedChange={(v) => setForm({ ...form, [s.visKey]: v })} />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{s.label}</Label>
                <Input value={(form[s.titleKey] as string) || ""} onChange={(e) => setForm({ ...form, [s.titleKey]: e.target.value })} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
        {busy ? "Saving…" : "Save"}
      </Button>
    </div>
  );
};

export default BannerAdmin;
