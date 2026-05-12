import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings, useSocialLinks, type SocialLink } from "@/lib/queries";
import { uploadImage } from "@/lib/upload";

const PLATFORMS = ["Instagram", "Facebook", "Pinterest", "YouTube", "Twitter/X", "Other"];

const SettingsAdmin = () => {
  const { data: settings } = useSettings();
  const { data: socials = [] } = useSocialLinks();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    store_name: "", tagline: "", logo_url: "", whatsapp_number: "",
    usp_interval_ms: 3500, usp_fade_speed_ms: 300,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name,
        tagline: settings.tagline,
        logo_url: settings.logo_url || "",
        whatsapp_number: settings.whatsapp_number || "",
        usp_interval_ms: settings.usp_interval_ms,
        usp_fade_speed_ms: settings.usp_fade_speed_ms,
      });
    }
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const cleanWa = form.whatsapp_number.replace(/\D/g, "");
    if (cleanWa && (cleanWa.length < 10 || cleanWa.length > 15)) {
      toast.error("WhatsApp number must be 10–15 digits including country code.");
      setBusy(false); return;
    }
    const { error } = await supabase.from("settings").update({
      store_name: form.store_name,
      tagline: form.tagline,
      logo_url: form.logo_url || null,
      whatsapp_number: cleanWa || null,
      usp_interval_ms: form.usp_interval_ms,
      usp_fade_speed_ms: form.usp_fade_speed_ms,
    }).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  };

  // Social links state
  const [newSocial, setNewSocial] = useState({ platform: "Instagram", url: "" });

  const addSocial = async () => {
    if (!newSocial.url) return;
    const { error } = await supabase.from("social_links").insert({
      platform: newSocial.platform, url: newSocial.url,
      display_order: socials.length, is_visible: true,
    });
    if (error) toast.error(error.message);
    else {
      setNewSocial({ platform: "Instagram", url: "" });
      qc.invalidateQueries({ queryKey: ["social_links"] });
    }
  };

  const updateSocial = async (id: string, patch: Partial<SocialLink>) => {
    const { error } = await supabase.from("social_links").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["social_links"] });
  };

  const removeSocial = async (id: string) => {
    const { error } = await supabase.from("social_links").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["social_links"] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">Profile & Settings</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Store identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
          <div>
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = await uploadImage(f, "branding");
                setForm({ ...form, logo_url: url });
              }
            }} />
            {form.logo_url && <img src={form.logo_url} className="mt-2 h-16" />}
          </div>
          <div>
            <Label>WhatsApp number</Label>
            <Input
              placeholder="919XXXXXXXXX (with country code, no +)"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used by the "I Love It" enquiry button. Digits only, including country code.
            </p>
          </div>
          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Social links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {socials.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Select value={s.platform} onValueChange={(v) => updateSocial(s.id, { platform: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Input
                value={s.url}
                onChange={(e) => updateSocial(s.id, { url: e.target.value })}
                placeholder="https://…"
              />
              <Switch checked={s.is_visible} onCheckedChange={(v) => updateSocial(s.id, { is_visible: v })} />
              <Button size="icon" variant="ghost" onClick={() => removeSocial(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Select value={newSocial.platform} onValueChange={(v) => setNewSocial({ ...newSocial, platform: v })}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Input
              placeholder="https://instagram.com/eraya"
              value={newSocial.url}
              onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
            />
            <Button onClick={addSocial}><Plus /> Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsAdmin;
