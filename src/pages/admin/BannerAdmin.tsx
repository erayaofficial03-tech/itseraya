import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";

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
  const [form, setForm] = useState<Record<string, any>>({
    hero_image_url: "", hero_headline: "", hero_subtext: "", hero_cta_label: "",
    hero_cta_url: "/catalogue", hero_overlay_opacity: 40,
  });

  useEffect(() => {
    if (!settings) return;
    const next: Record<string, any> = {
      hero_image_url: settings.hero_image_url || "",
      hero_headline: settings.hero_headline || "",
      hero_subtext: settings.hero_subtext || "",
      hero_cta_label: settings.hero_cta_label || "",
      hero_cta_url: (settings as any).hero_cta_url || "/catalogue",
      hero_overlay_opacity: (settings as any).hero_overlay_opacity ?? 40,
    };
    SECTIONS.forEach((s) => {
      next[s.titleKey] = (settings as any)[s.titleKey] || "";
      next[s.visKey] = (settings as any)[s.visKey] ?? true;
    });
    setForm(next);
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form as any).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">Homepage & Banner</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Hero banner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero image</Label>
            <Input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) { const url = await uploadImage(f, "branding"); setForm({ ...form, hero_image_url: url }); }
            }} />
            {form.hero_image_url && <img src={form.hero_image_url} className="mt-2 w-full max-w-md aspect-[16/7] object-cover rounded" />}
          </div>
          <div>
            <Label>Headline</Label>
            <Input value={form.hero_headline} onChange={(e) => setForm({ ...form, hero_headline: e.target.value })} />
          </div>
          <div>
            <Label>Subtext</Label>
            <Textarea value={form.hero_subtext} onChange={(e) => setForm({ ...form, hero_subtext: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CTA button label</Label>
              <Input value={form.hero_cta_label} onChange={(e) => setForm({ ...form, hero_cta_label: e.target.value })} />
            </div>
            <div>
              <Label>CTA URL</Label>
              <Input value={form.hero_cta_url} onChange={(e) => setForm({ ...form, hero_cta_url: e.target.value })} placeholder="/catalogue" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Hero overlay opacity</Label>
              <span className="text-xs text-muted-foreground">{form.hero_overlay_opacity}%</span>
            </div>
            <Slider min={0} max={80} step={1} value={[form.hero_overlay_opacity]} onValueChange={(v) => setForm({ ...form, hero_overlay_opacity: v[0] })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Section visibility & headings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {SECTIONS.map((s) => (
            <div key={s.titleKey} className="flex items-center gap-3">
              <Switch checked={!!form[s.visKey]} onCheckedChange={(v) => setForm({ ...form, [s.visKey]: v })} />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{s.label}</Label>
                <Input value={form[s.titleKey] || ""} onChange={(e) => setForm({ ...form, [s.titleKey]: e.target.value })} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
        {busy ? "Saving…" : "Save all"}
      </Button>
    </div>
  );
};

export default BannerAdmin;
