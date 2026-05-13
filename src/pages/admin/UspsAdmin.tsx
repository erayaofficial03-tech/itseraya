import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";

const UspsAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    usp_1: "",
    usp_2: "",
    usp_3: "",
    usp_interval_ms: 3500,
    usp_fade_speed_ms: 300,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      usp_1: (settings as any).usp_1 || "",
      usp_2: (settings as any).usp_2 || "",
      usp_3: (settings as any).usp_3 || "",
      usp_interval_ms: (settings as any).usp_interval_ms ?? 3500,
      usp_fade_speed_ms: (settings as any).usp_fade_speed_ms ?? 300,
    });
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form as any).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("USPs saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">USPs &amp; Reviews</h1>
        <p className="text-sm text-muted-foreground">Top status bar messages and review settings.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Top status bar messages</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Message 1</Label>
            <Input value={form.usp_1} onChange={(e) => setForm({ ...form, usp_1: e.target.value })} placeholder="e.g. Handcrafted with love" />
          </div>
          <div>
            <Label>Message 2</Label>
            <Input value={form.usp_2} onChange={(e) => setForm({ ...form, usp_2: e.target.value })} placeholder="e.g. Free shipping on orders over Rs. 999" />
          </div>
          <div>
            <Label>Message 3</Label>
            <Input value={form.usp_3} onChange={(e) => setForm({ ...form, usp_3: e.target.value })} placeholder="e.g. Easy WhatsApp enquiries" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rotation interval (ms)</Label>
              <Input type="number" min={1000} max={20000}
                value={form.usp_interval_ms}
                onChange={(e) => setForm({ ...form, usp_interval_ms: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Fade speed (ms)</Label>
              <Input type="number" min={100} max={2000}
                value={form.usp_fade_speed_ms}
                onChange={(e) => setForm({ ...form, usp_fade_speed_ms: Number(e.target.value) })} />
            </div>
          </div>
          <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Customer reviews management is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UspsAdmin;
