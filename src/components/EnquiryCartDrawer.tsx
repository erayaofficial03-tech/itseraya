import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, Send, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEnquiryCart } from "@/hooks/useEnquiryCart";
import { useSettings, formatINR } from "@/lib/queries";
import { usePricingComponents } from "@/lib/pricing";
import { generateEnquiryRef } from "@/lib/enquiryRef";
import { openWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnquiryCartDrawer = ({ open, onOpenChange }: Props) => {
  const { items, removeFromCart, updateQuantity, clearCart } = useEnquiryCart();
  const { data: settings } = useSettings();
  const { data: pricingComponents = [] } = usePricingComponents();
  const { user, profile } = useAuth();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requireLogin = !!(settings as any)?.enquiry_requires_login;
  const blockedByLogin = requireLogin && !user;

  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);

  // Shipping = sum of all configured shipping_charge components (applied on total cart value).
  // If a free-shipping threshold is set and met, shipping is waived.
  const shippingRows = pricingComponents.filter((c) => c.section === "shipping_charge");
  const flatShipping = shippingRows.reduce((s, x) => s + Number(x.amount || 0), 0);
  const freeMin = Number((settings as any)?.shipping_free_above ?? settings?.shipping_free_min_order ?? 0);
  const freeShip = freeMin > 0 && subtotal >= freeMin;
  const shipping = items.length === 0 ? 0 : freeShip ? 0 : flatShipping;
  const total = subtotal + shipping;

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (blockedByLogin) {
      // UI replaces the send button with a Google sign-in card,
      // so this guard should never trigger — kept as a safety net.
      return;
    }
    setSubmitting(true);
    const ref = generateEnquiryRef();
    const customerName = profile?.full_name || (user?.user_metadata as { full_name?: string } | undefined)?.full_name || null;
    const customerEmail = user?.email || null;
    const sessionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    // Pre-generate the row id so we never need to SELECT the inserted row back
    // (enquiry_sessions has no guest SELECT policy by design — guests look up
    // their session via the secure lookup_enquiry_by_ref RPC instead).
    const sessionRowId = crypto.randomUUID();

    try {
      const { error: sErr } = await supabase
        .from("enquiry_sessions")
        .insert({
          id: sessionRowId,
          session_id: sessionId,
          enquiry_ref: ref,
          user_id: user?.id || null,
          customer_email: customerEmail,
          customer_name: customerName,
          notes: note.trim() || null,
          status: "open",
        });
      if (sErr) throw sErr;

      const itemRows = items.map((i) => ({
        session_id: sessionRowId,
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

      await supabase.from("enquiries").insert({
        product_name: `[${ref}] ${items.length} item(s)`,
        product_price: total || null,
        customer_email: customerEmail,
        customer_name: customerName,
        enquiry_ref: ref,
        status: "open",
      });

      const lines = items.map((i) => {
        const variant = [i.size, i.colour].filter(Boolean).join(", ");
        const v = variant ? ` (${variant})` : "";
        const p = i.price != null ? ` — ${formatINR(i.price * i.quantity)}` : "";
        const q = i.quantity > 1 ? ` ×${i.quantity}` : "";
        return `• ${i.product_name}${v}${q}${p}`;
      });
      const msg = [
        "Hi ERAYA! I'd like to place this order:",
        "",
        `🆔 Order Ref: ${ref}`,
        "",
        "📦 Products:",
        ...lines,
        "",
        `Subtotal: ${formatINR(subtotal)}`,
        `Shipping: ${shipping === 0 ? "FREE" : formatINR(shipping)}`,
        `*Total: ${formatINR(total)}*`,
        ...(note.trim() ? ["", "📝 Note:", note.trim()] : []),
        "",
        "Please confirm. Thank you! 💛",
      ].join("\n");

      const number = settings?.whatsapp_number?.replace(/\D/g, "");
      if (number) {
        openWhatsApp(number, msg, "enquiry_drawer");
      } else {
        toast.info("WhatsApp number not set — your order is saved.");
      }

      toast.success(`Order ${ref} submitted!`, {
        description: "Track it anytime from the Track page.",
      });
      clearCart();
      setNote("");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border flex-shrink-0">
          <SheetTitle className="font-serif flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            Your Cart
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
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap "Add to Cart" on any product to start.
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
            <Textarea
              placeholder="Add a note (size preference, customisation, occasion…)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />

            {/* Breakdown */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              {shippingRows.length > 0 && (
                <div className="pl-1 space-y-0.5">
                  {shippingRows.map((sh) => (
                    <div key={sh.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>· {sh.label}</span>
                      <span>{freeShip ? "—" : formatINR(Number(sh.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Shipping {freeShip && <span className="text-emerald-600 text-xs">(free)</span>}
                </span>
                <span className="font-medium">
                  {shipping === 0 ? (freeShip ? "FREE" : formatINR(0)) : formatINR(shipping)}
                </span>
              </div>
              {!freeShip && freeMin > 0 && subtotal < freeMin && (
                <p className="text-[11px] text-muted-foreground">
                  Add {formatINR(freeMin - subtotal)} more for free shipping.
                </p>
              )}
              <div className="border-t border-border pt-1.5 mt-1.5 flex items-center justify-between">
                <span className="font-serif">Total</span>
                <span className="font-serif text-lg text-gold">{formatINR(total)}</span>
              </div>
            </div>

            {blockedByLogin ? (
              <div className="p-4 bg-muted/40 rounded-2xl text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to send your enquiry
                </p>
                <button
                  onClick={async () => {
                    const result = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: `${window.location.origin}/auth/callback`,
                    });
                    if (result.error) {
                      toast.error("Google sign-in failed.");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white border-2 border-[#EDE8E1] text-[15px] font-semibold hover:border-[#C9A84C] hover:shadow-md transition-all"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p className="text-xs text-muted-foreground">
                  Your orders and wishlist will be saved automatically
                </p>
              </div>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-11 bg-gold text-charcoal hover:bg-gold/90 font-medium"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Sending…" : "Order on WhatsApp"}
              </Button>
            )}
            <Link
              to="/track"
              onClick={() => onOpenChange(false)}
              className="block text-center text-xs text-muted-foreground hover:text-gold"
            >
              Track an existing order →
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EnquiryCartDrawer;
