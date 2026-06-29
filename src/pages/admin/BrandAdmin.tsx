import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminActivity } from "@/lib/adminLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAdminSettings } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";
import { RotateCcw } from "lucide-react";
import HomepageSectionsAdmin from "./HomepageSectionsAdmin";
import { invalidateSettings } from "@/lib/invalidateSettings";
import ImageEditorSheet from "@/components/admin/ImageEditorSheet";

// ─── Font catalogues ──────────────────────────────────────────────────────
const HEADING_FONTS = [
  "Playfair Display", "Cormorant Garamond", "Lora", "Merriweather",
  "EB Garamond", "Libre Baskerville", "Crimson Text", "DM Serif Display",
  "Instrument Serif", "Bodoni Moda", "Cardo", "Abril Fatface",
];
const BODY_FONTS = [
  "Inter", "Lato", "Nunito", "Raleway", "Poppins",
  "DM Sans", "Outfit", "Manrope", "Work Sans", "Plus Jakarta Sans", "Figtree",
];

const SHADOW_PRESETS: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)",
  lg: "0 10px 20px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.12)",
};

// ─── Eraya defaults ───────────────────────────────────────────────────────
const ERAYA_DEFAULTS = {
  color_primary: "#C9A84C",
  color_background: "#FAF8F5",
  color_text: "#2C2C2C",
  color_accent: "#F2C4CE",
  color_muted: "#9A8F85",
  card_border_color: "#EDE8E1",
  card_border_radius: 16,
  card_border_width: 1,
  card_shadow: "sm",
  card_layout: "grid",
  btn_primary_bg: "#C9A84C",
  btn_primary_text: "#FFFFFF",
  btn_secondary_bg: "transparent",
  btn_secondary_text: "#C9A84C",
  btn_secondary_border: "#C9A84C",
  btn_border_radius: 50,
  btn_font_weight: "600",
  btn_letter_spacing: 0,
  font_heading: "Playfair Display",
  font_body: "Inter",
  font_size_base: 16,
  line_height_base: 1.6,
  section_spacing: 48,
  container_max: 1280,
  product_grid_cols_mobile: 2,
  product_grid_cols_tablet: 3,
  product_grid_cols_desktop: 4,
};

// ─── Colour control ───────────────────────────────────────────────────────
const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label className="text-xs">{label}</Label>
    <div className="flex items-center gap-2 mt-1">
      <Input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="w-14 h-10 p-1 cursor-pointer" />
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="flex-1 font-mono text-sm" />
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────
const BrandAdmin = () => {
  const { data: settings } = useAdminSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  type BrandImgKey = "logo_url" | "favicon_url" | "app_icon_url";
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingKey, setPendingKey] = useState<BrandImgKey | null>(null);

  const [form, setForm] = useState<any>({
    // identity
    logo_url: "", favicon_url: "", app_icon_url: "",
    store_name: "", tagline: "",
    // colors
    ...ERAYA_DEFAULTS,
    // typography urls
    font_heading_url: "", font_body_url: "",
  });

  useEffect(() => {
    if (!settings) return;
    const s = settings as any;
    setForm((prev: any) => ({
      ...prev,
      logo_url: s.logo_url || "",
      favicon_url: s.favicon_url || "",
      app_icon_url: s.app_icon_url || "",
      store_name: s.store_name || "",
      tagline: s.tagline || "",
      color_primary: s.color_primary || ERAYA_DEFAULTS.color_primary,
      color_background: s.color_background || ERAYA_DEFAULTS.color_background,
      color_text: s.color_text || ERAYA_DEFAULTS.color_text,
      color_accent: s.color_accent || ERAYA_DEFAULTS.color_accent,
      color_muted: s.color_muted || ERAYA_DEFAULTS.color_muted,
      card_border_color: s.card_border_color || ERAYA_DEFAULTS.card_border_color,
      card_border_radius: s.card_border_radius ?? ERAYA_DEFAULTS.card_border_radius,
      card_border_width: s.card_border_width ?? ERAYA_DEFAULTS.card_border_width,
      card_shadow: s.card_shadow || ERAYA_DEFAULTS.card_shadow,
      card_layout: s.card_layout || ERAYA_DEFAULTS.card_layout,
      btn_primary_bg: s.btn_primary_bg || ERAYA_DEFAULTS.btn_primary_bg,
      btn_primary_text: s.btn_primary_text || ERAYA_DEFAULTS.btn_primary_text,
      btn_secondary_bg: s.btn_secondary_bg || ERAYA_DEFAULTS.btn_secondary_bg,
      btn_secondary_text: s.btn_secondary_text || ERAYA_DEFAULTS.btn_secondary_text,
      btn_secondary_border: s.btn_secondary_border || ERAYA_DEFAULTS.btn_secondary_border,
      btn_border_radius: s.btn_border_radius ?? ERAYA_DEFAULTS.btn_border_radius,
      btn_font_weight: s.btn_font_weight || ERAYA_DEFAULTS.btn_font_weight,
      btn_letter_spacing: Number(s.btn_letter_spacing ?? ERAYA_DEFAULTS.btn_letter_spacing),
      font_heading: s.font_heading || ERAYA_DEFAULTS.font_heading,
      font_body: s.font_body || ERAYA_DEFAULTS.font_body,
      font_heading_url: s.font_heading_url || "",
      font_body_url: s.font_body_url || "",
      font_size_base: s.font_size_base ?? ERAYA_DEFAULTS.font_size_base,
      line_height_base: Number(s.line_height_base ?? ERAYA_DEFAULTS.line_height_base),
      section_spacing: s.section_spacing ?? ERAYA_DEFAULTS.section_spacing,
      container_max: s.container_max ?? ERAYA_DEFAULTS.container_max,
      product_grid_cols_mobile: s.product_grid_cols_mobile ?? ERAYA_DEFAULTS.product_grid_cols_mobile,
      product_grid_cols_tablet: s.product_grid_cols_tablet ?? ERAYA_DEFAULTS.product_grid_cols_tablet,
      product_grid_cols_desktop: s.product_grid_cols_desktop ?? ERAYA_DEFAULTS.product_grid_cols_desktop,
    }));
  }, [settings]);

  const set = (patch: Partial<typeof form>) => setForm((f: any) => ({ ...f, ...patch }));

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Theme saved — applied site-wide");
    void logAdminActivity({ action: "brand_updated", entity: "settings" });
    invalidateSettings(qc);
  };

  const upload = async (file: File, key: "logo_url" | "favicon_url" | "app_icon_url") => {
    const url = await uploadImage(file, "branding");
    set({ [key]: url } as any);
  };

  const resetColors = () => set({
    color_primary: ERAYA_DEFAULTS.color_primary,
    color_background: ERAYA_DEFAULTS.color_background,
    color_text: ERAYA_DEFAULTS.color_text,
    color_accent: ERAYA_DEFAULTS.color_accent,
    color_muted: ERAYA_DEFAULTS.color_muted,
    card_border_color: ERAYA_DEFAULTS.card_border_color,
    btn_primary_bg: ERAYA_DEFAULTS.btn_primary_bg,
    btn_primary_text: ERAYA_DEFAULTS.btn_primary_text,
    btn_secondary_text: ERAYA_DEFAULTS.btn_secondary_text,
    btn_secondary_border: ERAYA_DEFAULTS.btn_secondary_border,
  });

  // Inject preview fonts on demand
  useEffect(() => {
    const fams = [form.font_heading, form.font_body].filter(Boolean).filter((f, i, a) => a.indexOf(f) === i);
    const href = `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`).join("&")}&display=swap`;
    let link = document.querySelector<HTMLLinkElement>("link[data-theme-studio-fonts]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-theme-studio-fonts", "true");
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }, [form.font_heading, form.font_body]);

  // ─── Live preview pieces ────────────────────────────────────────────────
  const previewCard = useMemo(() => (
    <div
      style={{
        background: "#fff",
        border: `${form.card_border_width}px solid ${form.card_border_color}`,
        borderRadius: form.card_border_radius,
        boxShadow: SHADOW_PRESETS[form.card_shadow] || SHADOW_PRESETS.sm,
        overflow: "hidden",
        width: 180,
      }}
    >
      <div style={{ aspectRatio: "4/5", background: form.color_accent }} />
      <div style={{ padding: 12 }}>
        <p style={{ fontFamily: `'${form.font_heading}', serif`, color: form.color_text, fontSize: 15, margin: 0 }}>
          Pearl Drop Ring
        </p>
        <p style={{ fontFamily: `'${form.font_body}', sans-serif`, color: form.color_muted, fontSize: 12, margin: "2px 0 0" }}>
          ₹ 1,299
        </p>
      </div>
    </div>
  ), [form]);

  const previewButtons = (
    <div className="flex gap-3 items-center">
      <button
        type="button"
        style={{
          background: form.btn_primary_bg,
          color: form.btn_primary_text,
          borderRadius: form.btn_border_radius,
          fontWeight: Number(form.btn_font_weight) || 600,
          letterSpacing: form.btn_letter_spacing,
          padding: "10px 22px",
          border: "none",
          fontFamily: `'${form.font_body}', sans-serif`,
          fontSize: 14,
        }}
      >
        Shop Now
      </button>
      <button
        type="button"
        style={{
          background: form.btn_secondary_bg,
          color: form.btn_secondary_text,
          borderRadius: form.btn_border_radius,
          fontWeight: Number(form.btn_font_weight) || 600,
          letterSpacing: form.btn_letter_spacing,
          padding: "10px 22px",
          border: `1.5px solid ${form.btn_secondary_border}`,
          fontFamily: `'${form.font_body}', sans-serif`,
          fontSize: 14,
        }}
      >
        Learn More
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-serif text-3xl">Theme Studio</h1>
        <p className="text-sm text-muted-foreground">
          Full visual control — colors, fonts, cards, buttons, layout, and homepage sections.
        </p>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="identity">Brand Identity</TabsTrigger>
          <TabsTrigger value="colors">Color Palette</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Cards & Layout</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Sections</TabsTrigger>
        </TabsList>

        {/* ── TAB 1 · IDENTITY ─────────────────────────────────────────── */}
        <TabsContent value="identity">
          <Card>
            <CardHeader><CardTitle>Brand identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Store name</Label>
                  <Input value={form.store_name} onChange={(e) => set({ store_name: e.target.value })} />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Logo</Label>
                  <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPendingFile(f); setPendingKey("logo_url"); } e.target.value = ""; }} />
                  {form.logo_url && <img src={form.logo_url} className="mt-2 h-12 object-contain" alt="Logo" />}
                </div>
                <div>
                  <Label>Favicon</Label>
                  <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPendingFile(f); setPendingKey("favicon_url"); } e.target.value = ""; }} />
                  {form.favicon_url && <img src={form.favicon_url} className="mt-2 h-8 w-8" alt="Favicon" />}
                </div>
                <div>
                  <Label>App icon</Label>
                  <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPendingFile(f); setPendingKey("app_icon_url"); } e.target.value = ""; }} />
                  {form.app_icon_url && <img src={form.app_icon_url} className="mt-2 h-12 w-12 rounded" alt="App icon" />}
                </div>
              </div>
              <ImageEditorSheet
                file={pendingFile}
                open={!!pendingFile && !!pendingKey}
                onConfirm={async (blob, filename) => {
                  const key = pendingKey;
                  setPendingFile(null);
                  setPendingKey(null);
                  if (!key) return;
                  const wrapped = new File([blob], filename, { type: "image/webp" });
                  await upload(wrapped, key);
                }}
                onCancel={() => { setPendingFile(null); setPendingKey(null); }}
              />

            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2 · COLORS ───────────────────────────────────────────── */}
        <TabsContent value="colors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Color palette</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetColors}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorRow label="Primary Gold" value={form.color_primary} onChange={(v) => set({ color_primary: v })} />
                <ColorRow label="Background" value={form.color_background} onChange={(v) => set({ color_background: v })} />
                <ColorRow label="Text Color" value={form.color_text} onChange={(v) => set({ color_text: v })} />
                <ColorRow label="Accent Pink" value={form.color_accent} onChange={(v) => set({ color_accent: v })} />
                <ColorRow label="Muted Text" value={form.color_muted} onChange={(v) => set({ color_muted: v })} />
                <ColorRow label="Card Border" value={form.card_border_color} onChange={(v) => set({ card_border_color: v })} />
                <ColorRow label="Button Primary BG" value={form.btn_primary_bg} onChange={(v) => set({ btn_primary_bg: v })} />
                <ColorRow label="Button Primary Text" value={form.btn_primary_text} onChange={(v) => set({ btn_primary_text: v })} />
                <ColorRow label="Button Secondary Text" value={form.btn_secondary_text} onChange={(v) => set({ btn_secondary_text: v, btn_secondary_border: v })} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Live preview</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="rounded-xl p-6 space-y-5"
                  style={{ background: form.color_background, color: form.color_text, fontFamily: `'${form.font_body}', sans-serif` }}
                >
                  <div>
                    <h3 style={{ fontFamily: `'${form.font_heading}', serif`, fontSize: 28, margin: 0 }}>
                      {form.store_name || "Eraya"}
                    </h3>
                    <p style={{ color: form.color_muted, margin: "4px 0 0", fontSize: 14 }}>
                      {form.tagline || "Adorn Your Story"}
                    </p>
                  </div>
                  {previewButtons}
                  <div className="flex items-end gap-4">
                    {previewCard}
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-16 w-16 rounded-full" style={{ background: form.color_accent }} />
                      <span style={{ fontSize: 11, color: form.color_muted }}>Category</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 3 · TYPOGRAPHY ───────────────────────────────────────── */}
        <TabsContent value="typography">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Fonts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Heading font</Label>
                  <Select value={form.font_heading} onValueChange={(v) => set({ font_heading: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HEADING_FONTS.map((f) => (
                        <SelectItem key={f} value={f}>
                          <span style={{ fontFamily: `'${f}', serif` }}>{f}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Body font</Label>
                  <Select value={form.font_body} onValueChange={(v) => set({ font_body: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BODY_FONTS.map((f) => (
                        <SelectItem key={f} value={f}>
                          <span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base font size · {form.font_size_base}px</Label>
                  <Slider value={[form.font_size_base]} min={14} max={20} step={1}
                    onValueChange={([v]) => set({ font_size_base: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Line height · {form.line_height_base.toFixed(2)}</Label>
                  <Slider value={[form.line_height_base]} min={1.4} max={2.0} step={0.05}
                    onValueChange={([v]) => set({ line_height_base: v })} className="mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label className="text-xs">Custom heading .woff2 URL</Label>
                    <Input value={form.font_heading_url} onChange={(e) => set({ font_heading_url: e.target.value })} placeholder="https://…" />
                  </div>
                  <div>
                    <Label className="text-xs">Custom body .woff2 URL</Label>
                    <Input value={form.font_body_url} onChange={(e) => set({ font_body_url: e.target.value })} placeholder="https://…" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="p-6 rounded-xl border" style={{ background: form.color_background, color: form.color_text }}>
                  <h2 style={{ fontFamily: `'${form.font_heading}', serif`, fontSize: 40, margin: 0, lineHeight: 1.15 }}>
                    Adorn Your Story
                  </h2>
                  <p style={{
                    fontFamily: `'${form.font_body}', sans-serif`,
                    fontSize: form.font_size_base,
                    lineHeight: form.line_height_base,
                    marginTop: 16,
                    color: form.color_muted,
                  }}>
                    Discover handcrafted artificial jewellery designed to celebrate every woman.
                    Each piece is curated with care — built to last, made to be loved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 4 · LAYOUT ───────────────────────────────────────────── */}
        <TabsContent value="layout">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Cards</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Card border radius · {form.card_border_radius}px</Label>
                  <Slider value={[form.card_border_radius]} min={0} max={32} step={1}
                    onValueChange={([v]) => set({ card_border_radius: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Card border width · {form.card_border_width}px</Label>
                  <Slider value={[form.card_border_width]} min={0} max={3} step={1}
                    onValueChange={([v]) => set({ card_border_width: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Card shadow</Label>
                  <Select value={form.card_shadow} onValueChange={(v) => set({ card_shadow: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Soft</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Card layout</Label>
                  <Select value={form.card_layout} onValueChange={(v) => set({ card_layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Grid & spacing</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Product columns — mobile · {form.product_grid_cols_mobile}</Label>
                  <Slider value={[form.product_grid_cols_mobile]} min={1} max={3} step={1}
                    onValueChange={([v]) => set({ product_grid_cols_mobile: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Product columns — tablet · {form.product_grid_cols_tablet}</Label>
                  <Slider value={[form.product_grid_cols_tablet]} min={2} max={4} step={1}
                    onValueChange={([v]) => set({ product_grid_cols_tablet: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Product columns — desktop · {form.product_grid_cols_desktop}</Label>
                  <Slider value={[form.product_grid_cols_desktop]} min={3} max={6} step={1}
                    onValueChange={([v]) => set({ product_grid_cols_desktop: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Section spacing · {form.section_spacing}px</Label>
                  <Slider value={[form.section_spacing]} min={24} max={96} step={4}
                    onValueChange={([v]) => set({ section_spacing: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Container max width · {form.container_max}px</Label>
                  <Slider value={[form.container_max]} min={1024} max={1600} step={20}
                    onValueChange={([v]) => set({ container_max: v })} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="p-6 rounded-xl"
                  style={{ background: form.color_background, display: "grid", gap: 12,
                    gridTemplateColumns: `repeat(${form.product_grid_cols_desktop}, minmax(0,1fr))` }}
                >
                  {Array.from({ length: form.product_grid_cols_desktop }).map((_, i) => (
                    <div key={i}>{previewCard}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 5 · BUTTONS ──────────────────────────────────────────── */}
        <TabsContent value="buttons">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Primary button</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ColorRow label="Background" value={form.btn_primary_bg} onChange={(v) => set({ btn_primary_bg: v })} />
                <ColorRow label="Text" value={form.btn_primary_text} onChange={(v) => set({ btn_primary_text: v })} />
                <div>
                  <Label>Border radius · {form.btn_border_radius}px</Label>
                  <Slider value={[form.btn_border_radius]} min={0} max={50} step={1}
                    onValueChange={([v]) => set({ btn_border_radius: v })} className="mt-2" />
                </div>
                <div>
                  <Label>Font weight</Label>
                  <Select value={String(form.btn_font_weight)} onValueChange={(v) => set({ btn_font_weight: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400">Regular</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">SemiBold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Letter spacing · {form.btn_letter_spacing}px</Label>
                  <Slider value={[form.btn_letter_spacing]} min={-1} max={4} step={0.5}
                    onValueChange={([v]) => set({ btn_letter_spacing: v })} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Secondary button (outline)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ColorRow label="Border color" value={form.btn_secondary_border} onChange={(v) => set({ btn_secondary_border: v })} />
                <ColorRow label="Text color" value={form.btn_secondary_text} onChange={(v) => set({ btn_secondary_text: v })} />
                <ColorRow label="Background" value={form.btn_secondary_bg} onChange={(v) => set({ btn_secondary_bg: v })} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Live preview</CardTitle></CardHeader>
              <CardContent>
                <div className="p-8 rounded-xl flex justify-center" style={{ background: form.color_background }}>
                  {previewButtons}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 6 · HOMEPAGE SECTIONS ────────────────────────────────── */}
        <TabsContent value="homepage">
          <HomepageSectionsAdmin />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 flex justify-end z-10">
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
