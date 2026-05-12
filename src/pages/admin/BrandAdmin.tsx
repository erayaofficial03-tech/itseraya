import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";
import { hexToHsl, isValidHex } from "@/lib/colors";

const BrandAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    logo_url: "",
    favicon_url: "",
    store_name: "",
    tagline: "",
    color_primary: "#C9A84C",
    color_background: "#FAF7F2",
    color_text: "#2C2C2C",
    color_accent: "#F2C4CE",
    enquiry_button_color: "#C9A84C",
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      logo_url: settings.logo_url || "",
      favicon_url: settings.favicon_url || "",
      store_name: settings.store_name || "",
      tagline: settings.tagline || "",
      color_primary: settings.color_primary || "#C9A84C",
      color_background: settings.color_background || "#FAF7F2",
      color_text: settings.color_text || "#2C2C2C",
      color_accent: settings.color_accent || "#F2C4CE",
      enquiry_button_color: settings.enquiry_button_color || "#C9A84C",
    });
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    setBusy(false);
    if (error) { toast.error(error.message); return; }

    // Apply colors instantly without reload
    const root = document.documentElement;
    const apply = (token: string, hex: string) => {
      if (isValidHex(hex)) root.style.setProperty(`--${token}`, hexToHsl(hex));
    };
    apply("gold", form.color_primary);
    apply("primary", form.color_primary);
    apply("background", form.color_background);
    apply("ivory", form.color_background);
    apply("foreground", form.color_text);
    apply("charcoal", form.color_text);
    apply("brand-accent", form.color_accent);

    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const upload = async (file: File, key: "logo_url" | "favicon_url") => {
    const url = await uploadImage(file, "branding");
    setForm((f) => ({ ...f, [key]: url }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">Brand & Colors</h1>
        <p className="text-sm text-muted-foreground">Color changes apply instantly site-wide.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo_url")} />
            {form.logo_url && <img src={form.logo_url} className="mt-2 h-16" alt="Logo preview" />}
          </div>
          <div>
            <Label>Favicon</Label>
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "favicon_url")} />
            {form.favicon_url && <img src={form.favicon_url} className="mt-2 h-8 w-8" alt="Favicon preview" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Store name</Label>
              <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {([
              ["color_primary", "Primary / Gold"],
              ["color_background", "Background"],
              ["color_text", "Text"],
              ["color_accent", "Accent / Pink"],
              ["enquiry_button_color", "Enquiry button"],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-16 h-10 p-1" />
                  <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="flex-1" />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label>Live preview</Label>
            <div className="mt-2 rounded-lg p-6 border" style={{ background: form.color_background, color: form.color_text }}>
              <h3 className="text-2xl font-serif" style={{ color: form.color_primary }}>{form.store_name || "Your store"}</h3>
              <p className="text-sm">{form.tagline || "Your tagline"}</p>
              <div className="mt-3 flex gap-2">
                <span className="inline-block h-8 w-8 rounded-full" style={{ background: form.color_primary }} />
                <span className="inline-block h-8 w-8 rounded-full" style={{ background: form.color_accent }} />
                <span className="inline-block h-8 w-8 rounded-full border" style={{ background: form.enquiry_button_color }} />
              </div>
            </div>
          </div>

          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save brand"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandAdmin;
