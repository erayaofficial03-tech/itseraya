import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdminSettings } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const FONTS = ["Inter", "Playfair Display", "Georgia", "Arial", "Times New Roman"];

interface PolicyFormState {
  return_title: string;
  return_body: string;
  shipping_title: string;
  shipping_body: string;
  cancellation_title: string;
  cancellation_body: string;
  privacy_title: string;
  privacy_body: string;
  terms_title: string;
  terms_body: string;
  font_family: string;
  font_size: string;
  text_color: string;
  heading_color: string;
  bg_color: string;
}

const blank: PolicyFormState = {
  return_title: "",
  return_body: "",
  shipping_title: "",
  shipping_body: "",
  cancellation_title: "",
  cancellation_body: "",
  privacy_title: "",
  privacy_body: "",
  terms_title: "",
  terms_body: "",
  font_family: "Inter",
  font_size: "16",
  text_color: "#2C2C2C",
  heading_color: "#C9A84C",
  bg_color: "#FAF8F5",
};

const PoliciesAdmin = () => {
  const { data: settings } = useAdminSettings();
  const sx = (settings as unknown as Record<string, string | undefined>) ?? {};
  const qc = useQueryClient();
  const [form, setForm] = useState<PolicyFormState>(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      return_title: sx.policy_return_title || "Return Policy",
      return_body: sx.policy_return_body || "",
      shipping_title: sx.policy_shipping_title || "Shipping Policy",
      shipping_body: sx.policy_shipping_body || "",
      cancellation_title: sx.policy_cancellation_title || "Cancellation Policy",
      cancellation_body: sx.policy_cancellation_body || "",
      privacy_title: sx.policy_privacy_title || "Privacy Policy",
      privacy_body: sx.policy_privacy_body || "",
      terms_title: sx.policy_terms_title || "Terms of Service",
      terms_body: sx.policy_terms_body || "",
      font_family: sx.policy_font_family || "Inter",
      font_size: sx.policy_font_size || "16",
      text_color: sx.policy_text_color || "#2C2C2C",
      heading_color: sx.policy_heading_color || "#C9A84C",
      bg_color: sx.policy_bg_color || "#FAF8F5",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const set = <K extends keyof PolicyFormState>(k: K, v: PolicyFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const payload: Record<string, string> = {
      policy_return_title: form.return_title,
      policy_return_body: form.return_body,
      policy_shipping_title: form.shipping_title,
      policy_shipping_body: form.shipping_body,
      policy_cancellation_title: form.cancellation_title,
      policy_cancellation_body: form.cancellation_body,
      policy_privacy_title: form.privacy_title,
      policy_privacy_body: form.privacy_body,
      policy_terms_title: form.terms_title,
      policy_terms_body: form.terms_body,
      policy_font_family: form.font_family,
      policy_font_size: form.font_size,
      policy_text_color: form.text_color,
      policy_heading_color: form.heading_color,
      policy_bg_color: form.bg_color,
    };
    const { error } = await supabase
      .from("settings")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(payload as any)
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Failed to save policies");
      return;
    }
    qc.invalidateQueries({ queryKey: ["settings"] });
    toast.success("Policies saved");
  };

  const previewStyle = {
    fontFamily: form.font_family,
    fontSize: `${form.font_size}px`,
    color: form.text_color,
    backgroundColor: form.bg_color,
  };

  const policyEditor = (
    label: string,
    titleKey: keyof PolicyFormState,
    bodyKey: keyof PolicyFormState,
    href: string,
  ) => {
    const body = form[bodyKey] as string;
    return (
      <AccordionItem value={label}>
        <AccordionTrigger className="text-base font-medium">{label}</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={form[titleKey] as string}
              onChange={(e) => set(titleKey, e.target.value as PolicyFormState[typeof titleKey])}
            />
          </div>
          <div className="space-y-1">
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => set(bodyKey, e.target.value as PolicyFormState[typeof bodyKey])}
              rows={8}
              className="font-mono text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{body.length} characters</span>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gold hover:underline"
              >
                Preview <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Policies</h1>
        <p className="text-sm text-muted-foreground">
          Edit your store policies and how they look. Saved instantly across the public site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Policy content</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["Return Policy"]}>
            {policyEditor("Return Policy", "return_title", "return_body", "/return-policy")}
            {policyEditor("Shipping Policy", "shipping_title", "shipping_body", "/shipping-policy")}
            {policyEditor(
              "Cancellation Policy",
              "cancellation_title",
              "cancellation_body",
              "/cancellation-policy",
            )}
            {policyEditor("Privacy Policy", "privacy_title", "privacy_body", "/privacy-policy")}
            {policyEditor("Terms of Service", "terms_title", "terms_body", "/terms-of-service")}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shared styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Font family</Label>
              <Select value={form.font_family} onValueChange={(v) => set("font_family", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Font size: {form.font_size}px</Label>
              <Slider
                min={14}
                max={20}
                step={1}
                value={[Number(form.font_size) || 16]}
                onValueChange={(v) => set("font_size", String(v[0]))}
              />
            </div>
            <div className="space-y-1">
              <Label>Text color</Label>
              <input
                type="color"
                value={form.text_color}
                onChange={(e) => set("text_color", e.target.value)}
                className="h-10 w-full rounded border border-border bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <Label>Heading color</Label>
              <input
                type="color"
                value={form.heading_color}
                onChange={(e) => set("heading_color", e.target.value)}
                className="h-10 w-full rounded border border-border bg-transparent"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Background color</Label>
              <input
                type="color"
                value={form.bg_color}
                onChange={(e) => set("bg_color", e.target.value)}
                className="h-10 w-full rounded border border-border bg-transparent"
              />
            </div>
          </div>

          <div className="rounded-lg p-5 border border-border" style={previewStyle}>
            <p
              className="font-serif text-2xl mb-2"
              style={{ color: form.heading_color, fontFamily: form.font_family }}
            >
              Live preview heading
            </p>
            <p>
              The quick brown fox jumps over the lazy dog. This is how the body
              text will look on your policy pages with the current font, size,
              and colors.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-gold text-charcoal hover:bg-gold/90">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving…" : "Save all policies"}
        </Button>
      </div>
    </div>
  );
};

export default PoliciesAdmin;
