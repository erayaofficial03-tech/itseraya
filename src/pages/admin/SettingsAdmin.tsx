import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    whatsapp_number: "",
    whatsapp_float_visible: true,
    whatsapp_message_template: "",
    catalogue_whatsapp_message_template: "",
    store_address: "", store_email: "", store_phone: "", store_city: "",
    pwa_name: "", pwa_short_name: "", pwa_description: "",
    pwa_theme_color: "#C9A84C", pwa_background_color: "#FAF7F2",
    
    about_title: "", about_body: "", about_image_url: "",
    enquiry_mode: "cart" as "cart" | "direct",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        whatsapp_number: (() => {
          const d = (settings.whatsapp_number || "").replace(/\D/g, "");
          return d.startsWith("91") ? d.slice(2) : d;
        })(),
        whatsapp_float_visible: (settings as any).whatsapp_float_visible !== false,
        whatsapp_message_template: (settings as any).whatsapp_message_template || "",
        catalogue_whatsapp_message_template: (settings as any).catalogue_whatsapp_message_template || "",
        store_address: (settings as any).store_address || "",
        store_email: (settings as any).store_email || "",
        store_phone: (settings as any).store_phone || "",
        store_city: (settings as any).store_city || "",
        pwa_name: (settings as any).pwa_name || "",
        pwa_short_name: (settings as any).pwa_short_name || "",
        pwa_description: (settings as any).pwa_description || "",
        pwa_theme_color: (settings as any).pwa_theme_color || "#C9A84C",
        pwa_background_color: (settings as any).pwa_background_color || "#FAF7F2",
        about_title: (settings as any).about_title || "",
        about_body: (settings as any).about_body || "",
        about_image_url: (settings as any).about_image_url || "",
        enquiry_mode: ((settings as any).enquiry_mode || "cart") as "cart" | "direct",
      });
    }
  }, [settings]);

  const save = async () => {
    setBusy(true);
    // Strip everything, drop leading 91 if user pasted with country code, then re-prefix.
    let local = form.whatsapp_number.replace(/\D/g, "");
    if (local.startsWith("91") && local.length > 10) local = local.slice(2);
    if (local && local.length !== 10) {
      toast.error("Enter a valid 10-digit Indian WhatsApp number.");
      setBusy(false); return;
    }
    if (local && !/^[6-9]\d{9}$/.test(local)) {
      toast.error("Indian mobile numbers must start with 6, 7, 8 or 9.");
      setBusy(false); return;
    }
    const cleanWa = local ? `91${local}` : "";
    const { error } = await supabase.from("settings").update({
      ...form,
      whatsapp_number: cleanWa || null,
      about_image_url: form.about_image_url || null,
    } as any).eq("id", 1);
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
        <CardHeader><CardTitle>Contact &amp; messaging</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>WhatsApp number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground select-none">
                +91
              </span>
              <Input
                className="rounded-l-none"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={form.whatsapp_number.replace(/\D/g, "").slice(0, 10)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm({ ...form, whatsapp_number: digits });
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              India (+91) is fixed. Enter the 10-digit mobile number starting with 6–9.
            </p>
          </div>
          {(() => {
            const d = form.whatsapp_number.replace(/\D/g, "").slice(0, 10);
            const valid = /^[6-9]\d{9}$/.test(d);
            return (
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm">Show floating WhatsApp chat button</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {valid
                      ? "Appears on every customer page (bottom-right)."
                      : "Hidden until a valid 10-digit WhatsApp number is saved."}
                  </p>
                </div>
                <Switch
                  checked={form.whatsapp_float_visible && valid}
                  disabled={!valid}
                  onCheckedChange={(v) => setForm({ ...form, whatsapp_float_visible: v })}
                />
              </div>
            );
          })()}
          <p className="text-xs text-muted-foreground">
            Top-bar USP messages and rotation timing live in{" "}
            <span className="font-medium text-charcoal">USPs &amp; Reviews</span>.
          </p>
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

      <Card>
        <CardHeader><CardTitle>WhatsApp message templates</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Product enquiry message</Label>
            <Textarea rows={6} value={form.whatsapp_message_template} onChange={(e) => setForm({ ...form, whatsapp_message_template: e.target.value })} />
            <p className="text-xs text-muted-foreground">Available variables: <code>{"{product_name}"}</code>, <code>{"{price}"}</code>, <code>{"{url}"}</code></p>
          </div>
          <div className="space-y-2">
            <Label>Catalogue share message</Label>
            <Textarea rows={6} value={form.catalogue_whatsapp_message_template} onChange={(e) => setForm({ ...form, catalogue_whatsapp_message_template: e.target.value })} />
            <p className="text-xs text-muted-foreground">Sent when sharing the catalogue PDF on WhatsApp. Available placeholders: store name, tagline, URL, WhatsApp number.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Store info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Address</Label><Input value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input value={form.store_email} onChange={(e) => setForm({ ...form, store_email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} /></div>
          </div>
          <div><Label>City</Label><Input value={form.store_city} onChange={(e) => setForm({ ...form, store_city: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>PWA settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>App name</Label><Input value={form.pwa_name} onChange={(e) => setForm({ ...form, pwa_name: e.target.value })} /></div>
            <div><Label>Short name</Label><Input value={form.pwa_short_name} onChange={(e) => setForm({ ...form, pwa_short_name: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={form.pwa_description} onChange={(e) => setForm({ ...form, pwa_description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Theme color</Label><Input type="color" value={form.pwa_theme_color} onChange={(e) => setForm({ ...form, pwa_theme_color: e.target.value })} /></div>
            <div><Label>Background color</Label><Input type="color" value={form.pwa_background_color} onChange={(e) => setForm({ ...form, pwa_background_color: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About page</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>About title</Label>
            <Input value={form.about_title} onChange={(e) => setForm({ ...form, about_title: e.target.value })} placeholder="Our Story" />
          </div>
          <div>
            <Label>About story</Label>
            <Textarea rows={6} value={form.about_body} onChange={(e) => setForm({ ...form, about_body: e.target.value })} placeholder="Tell your brand story…" />
            <p className="text-xs text-muted-foreground mt-1">Line breaks are preserved.</p>
          </div>
          <div>
            <Label>About hero image</Label>
            <Input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = await uploadImage(f, "branding");
                setForm({ ...form, about_image_url: url });
              }
            }} />
            {form.about_image_url && <img src={form.about_image_url} className="mt-2 w-full max-w-md aspect-[16/7] object-cover rounded" />}
            <p className="text-xs text-muted-foreground mt-1">Optional — leave empty for a warm gradient fallback.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Enquiry Mode</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cart mode lets customers add multiple items before enquiring on WhatsApp.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, enquiry_mode: "cart" })}
              className={`text-left rounded-lg border p-4 transition-colors ${
                form.enquiry_mode === "cart"
                  ? "border-gold bg-gold/5"
                  : "border-border hover:border-gold/60"
              }`}
            >
              <p className="font-medium text-sm">Enquiry Cart</p>
              <p className="text-xs text-muted-foreground mt-1">
                "I Love It" adds to cart. Customer sends all items together.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, enquiry_mode: "direct" })}
              className={`text-left rounded-lg border p-4 transition-colors ${
                form.enquiry_mode === "direct"
                  ? "border-gold bg-gold/5"
                  : "border-border hover:border-gold/60"
              }`}
            >
              <p className="font-medium text-sm">Direct WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-1">
                "I Love It" opens WhatsApp directly with the product.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
        {busy ? "Saving…" : "Save all settings"}
      </Button>
    </div>
  );
};

export default SettingsAdmin;
