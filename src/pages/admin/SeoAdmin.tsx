import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";

const SeoAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    seo_title: "",
    seo_description: "",
    seo_og_image_url: "",
    google_site_verification: "",
    google_analytics_id: "",
    google_tag_manager_id: "",
    seo_brand_keywords: "",
    seo_auto_generate: true,
  });

  useEffect(() => {
    if (!settings) return;
    const s2 = settings as any;
    setForm({
      seo_title: settings.seo_title || "",
      seo_description: settings.seo_description || "",
      seo_og_image_url: s2.seo_og_image_url || "",
      google_site_verification: s2.google_site_verification || "",
      google_analytics_id: s2.google_analytics_id || "",
      google_tag_manager_id: s2.google_tag_manager_id || "",
      seo_brand_keywords: s2.seo_brand_keywords || "",
      seo_auto_generate: s2.seo_auto_generate !== false,
    });
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  };

  const titleOver = form.seo_title.length > 60;
  const descOver = form.seo_description.length > 160;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">SEO & Meta</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Search appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label>Page title</Label>
              <span className={`text-xs ${titleOver ? "text-destructive" : "text-muted-foreground"}`}>
                {form.seo_title.length}/60
              </span>
            </div>
            <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Meta description</Label>
              <span className={`text-xs ${descOver ? "text-destructive" : "text-muted-foreground"}`}>
                {form.seo_description.length}/160
              </span>
            </div>
            <Textarea rows={3} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
          </div>
          <div>
            <Label>OG / Share image</Label>
            <Input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = await uploadImage(f, "branding");
                setForm({ ...form, seo_og_image_url: url });
              }
            }} />
            <p className="text-xs text-muted-foreground mt-1">Recommended: 1200×630px</p>
            {form.seo_og_image_url && <img src={form.seo_og_image_url} className="mt-2 w-full max-w-md rounded border" alt="OG preview" />}
          </div>

          <div>
            <Label>WhatsApp share preview</Label>
            <div className="mt-2 rounded-lg border overflow-hidden max-w-sm bg-muted/30">
              {form.seo_og_image_url && <img src={form.seo_og_image_url} className="w-full aspect-[1200/630] object-cover" alt="" />}
              <div className="p-3">
                <div className="font-medium text-sm line-clamp-2">{form.seo_title || "Page title"}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{form.seo_description || "Meta description"}</div>
                <div className="text-[10px] text-muted-foreground mt-2 uppercase">itseraya.in</div>
              </div>
            </div>
          </div>

          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save SEO"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Google Integration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Google Search Console Verification Code</Label>
            <Input
              value={form.google_site_verification}
              onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })}
              placeholder="abc123xyz..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get from search.google.com/search-console → Verify → HTML tag method. Paste only the content value, not the full tag.
            </p>
          </div>
          <div>
            <Label>Google Analytics Measurement ID</Label>
            <Input
              value={form.google_analytics_id}
              onChange={(e) => setForm({ ...form, google_analytics_id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: G-XXXXXXXXXX — get from analytics.google.com
            </p>
          </div>
          <div>
            <Label>Google Tag Manager ID</Label>
            <Input
              value={form.google_tag_manager_id}
              onChange={(e) => setForm({ ...form, google_tag_manager_id: e.target.value })}
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: GTM-XXXXXXX — get from tagmanager.google.com
            </p>
          </div>

          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save Google Settings"}
          </Button>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm">
              After saving the verification code, go to Google Search Console and click <strong>Verify</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                  Open Google Search Console ↗
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://itseraya.in/sitemap.xml" target="_blank" rel="noopener noreferrer">
                  Open Sitemap ↗
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://itseraya.in/robots.txt" target="_blank" rel="noopener noreferrer">
                  Open robots.txt ↗
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Auto SEO & Keywords</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Auto-generate product SEO</Label>
              <p className="text-xs text-muted-foreground mt-1">
                When ON, product titles, descriptions, and keywords are generated automatically.
              </p>
            </div>
            <Switch
              checked={form.seo_auto_generate}
              onCheckedChange={(v) => setForm({ ...form, seo_auto_generate: v })}
            />
          </div>
          <div>
            <Label>Global SEO Keywords</Label>
            <Textarea
              rows={3}
              value={form.seo_brand_keywords}
              onChange={(e) => setForm({ ...form, seo_brand_keywords: e.target.value })}
              placeholder="Eraya, artificial jewellery, fashion jewellery India, ..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated. Added to all pages automatically.
            </p>
          </div>
          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save Auto SEO"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoAdmin;
