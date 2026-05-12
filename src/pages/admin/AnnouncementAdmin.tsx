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

const AnnouncementAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    announcement_visible: false,
    announcement_text: "",
    announcement_bg_color: "#C9A84C",
    announcement_text_color: "#2C2C2C",
    announcement_dismissible: true,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      announcement_visible: !!settings.announcement_visible,
      announcement_text: settings.announcement_text || "",
      announcement_bg_color: settings.announcement_bg_color || "#C9A84C",
      announcement_text_color: settings.announcement_text_color || "#2C2C2C",
      announcement_dismissible: settings.announcement_dismissible ?? true,
    });
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
        <h1 className="font-serif text-3xl">Announcement bar</h1>
        <p className="text-sm text-muted-foreground">Site-wide banner shown above the header.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show announcement bar</Label>
            <Switch checked={form.announcement_visible} onCheckedChange={(v) => setForm({ ...form, announcement_visible: v })} />
          </div>
          <div>
            <Label>Announcement text</Label>
            <Input value={form.announcement_text} onChange={(e) => setForm({ ...form, announcement_text: e.target.value })} placeholder="🎉 Free delivery on orders above ₹999!" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Background color</Label>
              <Input type="color" value={form.announcement_bg_color} onChange={(e) => setForm({ ...form, announcement_bg_color: e.target.value })} />
            </div>
            <div>
              <Label>Text color</Label>
              <Input type="color" value={form.announcement_text_color} onChange={(e) => setForm({ ...form, announcement_text_color: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Dismissible</Label>
            <Switch checked={form.announcement_dismissible} onCheckedChange={(v) => setForm({ ...form, announcement_dismissible: v })} />
          </div>

          <div>
            <Label>Live preview</Label>
            <div className="mt-2 rounded border" style={{ background: form.announcement_bg_color, color: form.announcement_text_color }}>
              <div className="px-4 py-2 text-sm text-center">{form.announcement_text || "Your announcement here"}</div>
            </div>
          </div>

          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save announcement"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementAdmin;
