import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, Send, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEnquiryCart } from "@/hooks/useEnquiryCart";
import { useSettings, formatINR } from "@/lib/queries";
import { generateEnquiryRef } from "@/lib/enquiryRef";
import { openWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnquiryCartDrawer = ({ open, onOpenChange }: Props) => {
  const { items, removeFromCart, updateQuantity, clearCart } = useEnquiryCart();
  const { data: settings } = useSettings();
  const { user, profile } = useAuth();
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Your enquiry cart is empty.");
      return;
    }
    setSubmitting(true);
    const ref = generateEnquiryRef();
    const customerName = name.trim() || profile?.full_name || (user?.user_metadata as { full_name?: string } | undefined)?.full_name || null;
    const customerEmail = email.trim() || user?.email || null;
    const sessionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

    try {
      const { data: session, error: sErr } = await supabase
        .from("enquiry_sessions")
        .insert({
          session_id: sessionId,
          enquiry_ref: ref,
          customer_email: customerEmail,
          customer_name: customerName,
          notes: note.trim() || null,
          status: "open",
        })
        .select("id")
        .single();
      if (sErr) throw sErr;

      const itemRows = items.map((i) => ({
        session_id: session.id,
        product_id: i.product_id,
        product_name: i.product_name,
        product_price: i.price,
        product_image: i.product_image ?? null,
        selected_size: i.size ?? null,
        selected_colour: i.colour ?? null,
        quantity: i.quantity,
      }));
      const { error: iErr } = await supabase.from("enquiry_items").insert(itemRows);
      if (iErr) throw iErr;

      // Back-compat: log a summary row in legacy enquiries
      await supabase.from("enquiries").insert({
        product_name: `[${ref}] ${items.length} item(s)`,
        product_price: total || null,
        customer_email: customerEmail,
        customer_name: customerName,
        enquiry_ref: ref,
        status: "open",
      });

      // Build WhatsApp message
      const lines = items.map((i) => {
        const variant = [i.size, i.colour].filter(Boolean).join(", ");
        const v = variant ? ` (${variant})` : "";
        const p = i.price != null ? ` — ${formatINR(i.price * i.quantity)}` : "";
        const q = i.quantity > 1 ? ` ×${i.quantity}` : "";
        return `• ${i.product_name}${v}${q}${p}`;
      });
      const msg = [
        "Hi ERAYA! I'd like to enquire about:",
        "",
        `🆔 Enquiry ID: ${ref}`,
        "",
        "📦 Products:",
        ...lines,
        ...(total ? ["", `💰 Total (approx): ${formatINR(total)}`] : []),
        ...(note.trim() ? ["", "📝 Note:", note.trim()] : []),
        "",
        "Please share more details. Thank you! 💛",
      ].join("\n");

      const number = settings?.whatsapp_number?.replace(/\D/g, "");
      if (number) {
        openWhatsApp(number, msg, "enquiry_drawer");
      } else {
        toast.info("WhatsApp number not set — your enquiry is saved.");
      }

      toast.success(`Enquiry ${ref} submitted!`, {
        description: "You can track it anytime from the Track page.",
      });
      clearCart();
      setNote("");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="font-serif flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            Enquiry Cart
            {items.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {items.length} item{items.length > 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Your enquiry cart is empty.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap "Add to Enquiry" on any product to start building your enquiry.
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product_id}-${idx}`}
                className="flex gap-3 p-3 rounded-lg border border-border bg-card"
              >
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-16 w-16 rounded object-cover bg-muted flex-shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded bg-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{item.product_name}</p>
                  {(item.size || item.colour) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[item.size, item.colour].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center border border-border rounded-md">
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="h-7 w-7 flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="h-7 w-7 flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {item.price != null && (
                      <span className="text-sm font-semibold text-gold">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(idx)}
                  aria-label="Remove"
                  className="text-muted-foreground hover:text-destructive p-1 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-background">
            {!user && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}
            <Textarea
              placeholder="Add a note (size preference, customisation, occasion…)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
            {total > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Approx total</span>
                <span className="font-serif text-lg text-gold">{formatINR(total)}</span>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-11 bg-gold text-charcoal hover:bg-gold/90 font-medium"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Sending…" : "Send WhatsApp Enquiry"}
            </Button>
            <Link
              to="/track"
              onClick={() => onOpenChange(false)}
              className="block text-center text-xs text-muted-foreground hover:text-gold"
            >
              Track an existing enquiry →
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EnquiryCartDrawer;
