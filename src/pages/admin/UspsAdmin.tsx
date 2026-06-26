import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminSettings, useAdminFaqs, type Faq } from "@/lib/queries";
import ReviewsManager from "@/components/admin/ReviewsManager";

const ICON_OPTIONS = ["Droplets", "Sparkles", "Leaf", "Truck", "Shield", "Star", "Heart", "Package", "Gift", "Zap", "Award", "Clock"];

const UspsAdmin = () => {
  const { data: settings } = useAdminSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    usp_1: "",
    usp_2: "",
    usp_3: "",
    usp_interval_ms: 3500,
    usp_fade_speed_ms: 300,
    trust_1_label: "Waterproof",
    trust_1_icon: "Droplets",
    trust_2_label: "Tarnish Resistant",
    trust_2_icon: "Sparkles",
    trust_3_label: "Hypoallergenic",
    trust_3_icon: "Leaf",
    trust_4_label: "PAN India Shipping",
    trust_4_icon: "Truck",
  });

  useEffect(() => {
    if (!settings) return;
    const sx = settings as any;
    setForm({
      usp_1: sx.usp_1 || "",
      usp_2: sx.usp_2 || "",
      usp_3: sx.usp_3 || "",
      usp_interval_ms: sx.usp_interval_ms ?? 3500,
      usp_fade_speed_ms: sx.usp_fade_speed_ms ?? 300,
      trust_1_label: sx.trust_1_label ?? "Waterproof",
      trust_1_icon: sx.trust_1_icon ?? "Droplets",
      trust_2_label: sx.trust_2_label ?? "Tarnish Resistant",
      trust_2_icon: sx.trust_2_icon ?? "Sparkles",
      trust_3_label: sx.trust_3_label ?? "Hypoallergenic",
      trust_3_icon: sx.trust_3_icon ?? "Leaf",
      trust_4_label: sx.trust_4_label ?? "PAN India Shipping",
      trust_4_icon: sx.trust_4_icon ?? "Truck",
    });
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form as any).eq("id", 1);
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    }
  };

  // FAQs
  const { data: faqs = [], refetch: refetchFaqs } = useAdminFaqs();
  const [editingFaq, setEditingFaq] = useState<Partial<Faq> | null>(null);

  const saveFaq = async (faq: Partial<Faq>) => {
    if (!faq.question?.trim() || !faq.answer?.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    if (faq.id) {
      const { error } = await (supabase as any).from("faqs").update({
        question: faq.question,
        answer: faq.answer,
        is_visible: faq.is_visible ?? true,
      }).eq("id", faq.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const maxOrder = Math.max(0, ...faqs.map((f) => f.display_order));
      const { error } = await (supabase as any).from("faqs").insert({
        question: faq.question,
        answer: faq.answer,
        display_order: maxOrder + 1,
        is_visible: true,
      });
      if (error) { toast.error(error.message); return; }
    }
    setEditingFaq(null);
    refetchFaqs();
    qc.invalidateQueries({ queryKey: ["faqs"] });
    toast.success("FAQ saved");
  };

  const deleteFaq = async (id: string) => {
    const { error } = await (supabase as any).from("faqs").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetchFaqs();
    qc.invalidateQueries({ queryKey: ["faqs"] });
    toast.success("FAQ deleted");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl">Reviews, Trust &amp; FAQ</h1>
        <p className="text-sm text-muted-foreground">Top status bar messages, trust badges, FAQs and customer reviews.</p>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trust Strip</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            The 4 icons shown under your hero banner. Leave a badge text empty to hide that badge.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <Label>Badge {n} text</Label>
                <Input
                  value={form[`trust_${n}_label`] || ""}
                  onChange={(e) => setForm({ ...form, [`trust_${n}_label`]: e.target.value })}
                  placeholder={["Waterproof", "Tarnish Resistant", "Hypoallergenic", "PAN India Shipping"][n - 1]}
                />
              </div>
              <div className="w-36">
                <Label>Icon</Label>
                <select
                  value={form[`trust_${n}_icon`] || "Sparkles"}
                  onChange={(e) => setForm({ ...form, [`trust_${n}_icon`]: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <Button onClick={save} disabled={busy} style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
          {busy ? "Saving…" : "Save messages & trust badges"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>FAQ — Frequently Asked Questions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                These appear on your FAQ page. Add, edit, or remove any question.
              </p>
            </div>
            <button
              onClick={() => setEditingFaq({ question: "", answer: "", is_visible: true })}
              className="flex items-center gap-1.5 text-sm font-medium text-[#C9A84C] border border-[#C9A84C] rounded-lg px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {faqs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No FAQs yet — click "Add FAQ" to create one.</p>
            )}
            {faqs.map((faq) => (
              <div key={faq.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {faq.question}
                    {!faq.is_visible && <span className="ml-2 text-xs text-muted-foreground">(hidden)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => setEditingFaq({ ...faq })} className="text-xs text-[#C9A84C] underline">
                    Edit
                  </button>
                  <button onClick={() => deleteFaq(faq.id)} className="text-red-400 hover:text-red-600" aria-label="Delete FAQ">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingFaq !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h3 className="font-semibold text-lg">{editingFaq.id ? "Edit FAQ" : "Add FAQ"}</h3>
            <div>
              <Label>Question</Label>
              <Input
                value={editingFaq.question || ""}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                placeholder="e.g. How long does shipping take?"
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={editingFaq.answer || ""}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                placeholder="Write your answer here..."
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingFaq.is_visible ?? true}
                onCheckedChange={(v) => setEditingFaq({ ...editingFaq, is_visible: v })}
              />
              <Label>Visible on website</Label>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => saveFaq(editingFaq)}
                className="flex-1 bg-[#C9A84C] text-white hover:bg-[#B8963E]"
              >
                Save FAQ
              </Button>
              <Button variant="outline" onClick={() => setEditingFaq(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
        <CardContent>
          <ReviewsManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default UspsAdmin;
