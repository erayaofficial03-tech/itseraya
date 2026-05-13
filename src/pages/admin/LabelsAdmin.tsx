import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";

const TEXT_KEYS = [
  "nav_home_label", "nav_catalogue_label",
  "product_enquiry_button_label", "product_share_button_label", "product_pdf_button_label",
  "product_description_label", "product_related_title",
  "catalogue_heading", "catalogue_subtext", "catalogue_download_label",
  "category_empty_message", "category_pieces_label",
  "footer_copyright", "footer_whatsapp_label",
  "pdf_footer_text",
  "admin_panel_title", "admin_welcome_message",
] as const;

const BOOL_KEYS = [
  "nav_show_search",
  "product_tag_visible",
  "footer_show_logo", "footer_show_social", "footer_show_whatsapp",
] as const;

type FormState = Record<string, string | boolean>;

const LabelsAdmin = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    if (!settings) return;
    const next: FormState = {};
    TEXT_KEYS.forEach((k) => { next[k] = (settings as any)[k] ?? ""; });
    BOOL_KEYS.forEach((k) => { next[k] = (settings as any)[k] ?? true; });
    setForm(next);
  }, [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").update(form as any).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Labels saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  };

  const text = (key: typeof TEXT_KEYS[number], label: string, multiline = false, hint?: string) => (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={(form[key] as string) || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      ) : (
        <Input value={(form[key] as string) || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
  const toggle = (key: typeof BOOL_KEYS[number], label: string) => (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={!!form[key]} onCheckedChange={(v) => setForm({ ...form, [key]: v })} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl pb-24">
      <div>
        <h1 className="font-serif text-3xl">Labels & Text</h1>
        <p className="text-sm text-muted-foreground">All visible text across the site.</p>
      </div>

      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="nav" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>Navigation</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("nav_home_label", "Home label")}
            {text("nav_catalogue_label", "Catalogue label")}
            {toggle("nav_show_search", "Show search")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="product" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>Product page</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("product_enquiry_button_label", "Enquiry button label")}
            {text("product_share_button_label", "Share button label")}
            {text("product_pdf_button_label", "PDF button label")}
            {text("product_description_label", "Description heading")}
            {text("product_related_title", "Related products heading")}
            {toggle("product_tag_visible", "Show tags")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="catalogue" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>Catalogue page</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("catalogue_heading", "Page heading")}
            {text("catalogue_subtext", "Subtext", true)}
            {text("catalogue_download_label", "Download button label")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="category" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>Category page</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("category_empty_message", "Empty message")}
            {text("category_pieces_label", "Pieces label")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="footer" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>Footer</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("footer_copyright", "Copyright text", false, "Use {year} for current year")}
            {text("footer_whatsapp_label", "WhatsApp label")}
            {toggle("footer_show_logo", "Show logo")}
            {toggle("footer_show_social", "Show social icons")}
            {toggle("footer_show_whatsapp", "Show WhatsApp")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pdf" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>PDF labels</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("pdf_footer_text", "PDF footer text", true, "Use {whatsapp} for WhatsApp number")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="admin" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger>Admin panel</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {text("admin_panel_title", "Admin panel title")}
            {text("admin_welcome_message", "Welcome message")}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 lg:left-72 bg-background border-t border-border p-4 z-20">
        <div className="max-w-3xl">
          <Button onClick={save} disabled={busy} className="w-full md:w-auto" style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
            {busy ? "Saving…" : "Save all labels"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LabelsAdmin;
