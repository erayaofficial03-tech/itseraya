import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";

const BannerAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    hero_image_url: "", hero_headline: "", hero_subtext: "", hero_cta_label: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        hero_image_url: settings.hero_image_url || "",
        hero_headline: settings.hero_headline || "",
        hero_subtext: settings.hero_subtext || "",
        hero_cta_label: settings.hero_cta_label || "",
      });
    }
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
        <h1 className="font-serif text-3xl">Banner & Homepage</h1>
        <p className="text-sm text-muted-foreground">Customise the homepage hero.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Hero banner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero image</Label>
            <Input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = await uploadImage(f, "branding");
                setForm({ ...form, hero_image_url: url });
              }
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
          <div>
            <Label>CTA button label</Label>
            <Input value={form.hero_cta_label} onChange={(e) => setForm({ ...form, hero_cta_label: e.target.value })} />
          </div>
          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save banner"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Featured products</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Toggle "Featured" on individual products in the <strong>Products</strong> page.
            New Arrivals shows products tagged <code>new</code>, Trending Now shows <code>bestseller</code>, On Sale shows discounted items.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerAdmin;
