import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSettings, useThemePresets, type ThemePreset } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";
import { Check } from "lucide-react";

const FONT_OPTIONS = [
  // Display / serif
  "Cormorant Garamond", "Playfair Display", "Libre Baskerville", "Lora", "DM Serif Display",
  "Instrument Serif", "Cormorant Infant", "Abril Fatface", "Bodoni Moda", "Cardo",
  // Modern sans
  "Inter", "DM Sans", "Manrope", "Plus Jakarta Sans", "Space Grotesk", "Outfit",
  "Figtree", "Sora", "Urbanist", "Work Sans", "Karla", "Nunito Sans", "Hind",
  // Mono
  "JetBrains Mono", "Space Mono",
];

const BrandAdmin = () => {
  const { data: settings } = useSettings();
  const { data: presets = [] } = useThemePresets();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    // identity
    logo_url: "",
    favicon_url: "",
    app_icon_url: "",
    store_name: "",
    tagline: "",
    // theme
    active_theme_id: null as string | null,
    color_primary: "#C9A84C",
    color_background: "#FAF7F2",
    color_text: "#2C2C2C",
    color_accent: "#F2C4CE",
    // typography
    font_heading: "Cormorant Garamond",
    font_body: "Inter",
    font_heading_url: "",
    font_body_url: "",
    // sizing
    radius_base: 0.875,
    container_max: 1280,
    section_spacing: 80,
    font_size_base: 16,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      logo_url: settings.logo_url || "",
      favicon_url: (settings as any).favicon_url || "",
      app_icon_url: (settings as any).app_icon_url || "",
      store_name: settings.store_name || "",
      tagline: settings.tagline || "",
      active_theme_id: settings.active_theme_id || null,
      color_primary: settings.color_primary || "#C9A84C",
      color_background: settings.color_background || "#FAF7F2",
      color_text: settings.color_text || "#2C2C2C",
      color_accent: settings.color_accent || "#F2C4CE",
      font_heading: settings.font_heading || "Cormorant Garamond",
      font_body: settings.font_body || "Inter",
      font_heading_url: settings.font_heading_url || "",
      font_body_url: settings.font_body_url || "",
      radius_base: Number(settings.radius_base ?? 0.875),
      container_max: settings.container_max ?? 1280,
      section_spacing: settings.section_spacing ?? 80,
      font_size_base: settings.font_size_base ?? 16,
    });
  }, [settings]);

  const applyPreset = (p: ThemePreset) => {
    setForm((f) => ({
      ...f,
      active_theme_id: p.id,
      color_background: p.tokens.background || f.color_background,
      color_text: p.tokens.foreground || p.tokens.ink || f.color_text,
      color_primary: p.tokens.primary || p.tokens.champagne || f.color_primary,
      color_accent: p.tokens.accent || f.color_accent,
    }));
  };

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Theme saved — applying site-wide");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const upload = async (file: File, key: "logo_url" | "favicon_url" | "app_icon_url") => {
    const url = await uploadImage(file, "branding");
    setForm((f) => ({ ...f, [key]: url }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl">Theme Studio</h1>
        <p className="text-sm text-muted-foreground">
          Pick a preset combo or fine-tune every color, font, and spacing token. Changes apply site-wide on Save.
        </p>
      </div>

      <Tabs defaultValue="presets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="sizing">Sizing & Spacing</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
        </TabsList>

        {/* ─── PRESETS ─── */}
        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Theme combinations</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((p) => {
                  const active = form.active_theme_id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                        active ? "border-primary ring-2 ring-primary/30" : "border-border"
                      }`}
                      style={{ background: p.tokens.background }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm" style={{ color: p.tokens.foreground || p.tokens.ink }}>
                          {p.name}
                        </span>
                        {active && <Check className="h-4 w-4" style={{ color: p.tokens.primary }} />}
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {["background", "primary", "accent", "ink"].map((k) => (
                          <span
                            key={k}
                            className="h-8 w-8 rounded-full border border-black/10"
                            style={{ background: p.tokens[k] }}
                          />
                        ))}
                      </div>
                      <p className="text-xs leading-snug opacity-70" style={{ color: p.tokens.foreground || p.tokens.ink }}>
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── COLORS ─── */}
        <TabsContent value="colors">
          <Card>
            <CardHeader><CardTitle>Brand colors</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["color_background", "Background"],
                  ["color_text", "Text"],
                  ["color_primary", "Primary"],
                  ["color_accent", "Accent"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value, active_theme_id: null })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value, active_theme_id: null })}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TYPOGRAPHY ─── */}
        <TabsContent value="typography">
          <Card>
            <CardHeader><CardTitle>Fonts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Heading font</Label>
                  <Select value={form.font_heading} onValueChange={(v) => setForm({ ...form, font_heading: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Body font</Label>
                  <Select value={form.font_body} onValueChange={(v) => setForm({ ...form, font_body: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Custom heading font URL (.woff2 — optional)</Label>
                  <Input
                    placeholder="https://…/MyFont.woff2"
                    value={form.font_heading_url}
                    onChange={(e) => setForm({ ...form, font_heading_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Custom body font URL (.woff2 — optional)</Label>
                  <Input
                    placeholder="https://…/MyFont.woff2"
                    value={form.font_body_url}
                    onChange={(e) => setForm({ ...form, font_body_url: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Google Fonts are loaded automatically. For custom fonts, also enter the family name above to match the .woff2 file's font-family.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SIZING ─── */}
        <TabsContent value="sizing">
          <Card>
            <CardHeader><CardTitle>Sizing & spacing</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base font size · {form.font_size_base}px</Label>
                <Slider value={[form.font_size_base]} min={13} max={20} step={1}
                  onValueChange={([v]) => setForm({ ...form, font_size_base: v })} className="mt-2" />
              </div>
              <div>
                <Label>Corner radius · {form.radius_base}rem</Label>
                <Slider value={[form.radius_base]} min={0} max={2} step={0.0625}
                  onValueChange={([v]) => setForm({ ...form, radius_base: v })} className="mt-2" />
              </div>
              <div>
                <Label>Section spacing · {form.section_spacing}px</Label>
                <Slider value={[form.section_spacing]} min={24} max={160} step={4}
                  onValueChange={([v]) => setForm({ ...form, section_spacing: v })} className="mt-2" />
              </div>
              <div>
                <Label>Container max width · {form.container_max}px</Label>
                <Slider value={[form.container_max]} min={960} max={1600} step={20}
                  onValueChange={([v]) => setForm({ ...form, container_max: v })} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── IDENTITY ─── */}
        <TabsContent value="identity">
          <Card>
            <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Store name</Label>
                  <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Logo</Label>
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo_url")} />
                  {form.logo_url && <img src={form.logo_url} className="mt-2 h-12" alt="Logo" />}
                </div>
                <div>
                  <Label>Favicon</Label>
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "favicon_url")} />
                  {form.favicon_url && <img src={form.favicon_url} className="mt-2 h-8 w-8" alt="Favicon" />}
                </div>
                <div>
                  <Label>App icon</Label>
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "app_icon_url")} />
                  {form.app_icon_url && <img src={form.app_icon_url} className="mt-2 h-12 w-12 rounded" alt="App icon" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live preview pane */}
      <Card>
        <CardHeader><CardTitle>Live preview</CardTitle></CardHeader>
        <CardContent>
          <div
            className="rounded-xl p-8 border"
            style={{
              background: form.color_background,
              color: form.color_text,
              fontFamily: `'${form.font_body}', system-ui, sans-serif`,
              borderRadius: `${form.radius_base}rem`,
            }}
          >
            <h2
              style={{
                fontFamily: `'${form.font_heading}', Georgia, serif`,
                color: form.color_text,
                fontSize: "2rem",
                marginBottom: "0.5rem",
              }}
            >
              {form.store_name || "Your store"}
            </h2>
            <p style={{ opacity: 0.7, marginBottom: "1.25rem" }}>{form.tagline || "Your tagline"}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                style={{
                  background: form.color_primary,
                  color: form.color_background,
                  padding: "0.6rem 1.4rem",
                  borderRadius: `${form.radius_base}rem`,
                  fontWeight: 600,
                  border: "none",
                }}
              >
                Shop now
              </button>
              <button
                type="button"
                style={{
                  background: "transparent",
                  color: form.color_text,
                  padding: "0.6rem 1.4rem",
                  borderRadius: `${form.radius_base}rem`,
                  border: `1px solid ${form.color_text}`,
                  fontWeight: 500,
                }}
              >
                Learn more
              </button>
              <span className="ml-2 inline-block h-9 w-9 rounded-full" style={{ background: form.color_accent }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={save}
          disabled={busy}
          size="lg"
          style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}
          className="shadow-lg"
        >
          {busy ? "Saving…" : "Save theme"}
        </Button>
      </div>
    </div>
  );
};

export default BrandAdmin;
