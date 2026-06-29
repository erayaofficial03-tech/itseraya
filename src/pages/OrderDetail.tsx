import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, MessageCircle, Truck, ArrowLeft, Star } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/lib/queries";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type OrderRow = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_screenshot_url: string | null;
  payment_upi_ref: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

type ItemRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_colour: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-gray-100 text-gray-700",
  confirmed: "bg-[#C9A84C]/15 text-[#C9A84C]",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const OrderDetail = () => {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: settingsData } = useSettings();
  const settings = settingsData as any;
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?redirect=/orders/${ref}`);
      return;
    }
    (async () => {
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("order_ref", ref!)
        .eq("customer_id", user.id)
        .maybeSingle();
      if (o) {
        setOrder(o as OrderRow);
        const { data: its } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", (o as any).id);
        setItems((its as ItemRow[]) || []);
        if ((o as OrderRow).payment_screenshot_url) {
          const { data: signed } = await supabase.storage
            .from("payment-screenshots")
            .createSignedUrl((o as OrderRow).payment_screenshot_url!, 3600);
          setScreenshotUrl(signed?.signedUrl || null);
        }
      }
      setLoading(false);
    })();
  }, [ref, user, authLoading, navigate]);

  const contactAdmin = () => {
    if (!order) return;
    const number = settings?.whatsapp_number;
    if (!number) return;
    const text = `Hi Eraya, I have a question about my order *${order.order_ref}*`;
    window.open(buildWhatsAppUrl(number, text), "_blank", "noopener,noreferrer");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-light mb-4">Order not found</h1>
          <Link to="/orders">
            <Button className="rounded-full">View My Orders</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex items-center gap-3 px-4 md:px-6 pt-4 md:hidden">
        <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-full border border-[#EDE8E1]">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-xl">Order Details</h1>
      </div>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <Link
          to="/orders"
          className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> My Orders
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-light text-foreground font-mono">
              {order.order_ref}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`text-xs uppercase px-3 py-1 rounded-full font-medium ${
              STATUS_STYLES[order.order_status] || STATUS_STYLES.placed
            }`}
          >
            {order.order_status}
          </span>
        </div>

        {order.tracking_number && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6 flex items-center gap-3">
            <Truck className="h-5 w-5 text-purple-700" />
            <div>
              <p className="text-xs text-purple-700 font-medium">Tracking Number</p>
              <p className="font-mono text-sm font-semibold text-purple-900">
                {order.tracking_number}
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        <section className="bg-muted/20 p-5 rounded-lg mb-4">
          <h2 className="text-sm font-medium text-foreground mb-4">Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-muted overflow-hidden rounded flex-shrink-0">
                  {item.product_image_url && (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-foreground">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                    {item.variant_size && ` · ${item.variant_size}`}
                    {item.variant_colour && ` · ${item.variant_colour}`}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  ₹{item.total_price.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-muted-foreground/20 mt-4 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {order.shipping_amount === 0
                  ? "Free"
                  : `₹${order.shipping_amount.toLocaleString("en-IN")}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-muted-foreground/20 font-semibold">
              <span>Total</span>
              <span className="text-[#C9A84C]">
                ₹{order.total_amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="bg-muted/20 p-5 rounded-lg mb-4">
          <h2 className="text-sm font-medium text-foreground mb-3">
            Delivery Address
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium">{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p>{order.customer_address}</p>
            <p>
              {order.customer_city}, {order.customer_state} {order.customer_pincode}
            </p>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-muted/20 p-5 rounded-lg mb-4">
          <h2 className="text-sm font-medium text-foreground mb-3">Payment</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium uppercase text-xs">
              {order.payment_status.replace(/_/g, " ")}
            </span>
          </div>
          {order.payment_upi_ref && (
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">UPI Ref</span>
              <span className="font-mono">{order.payment_upi_ref}</span>
            </div>
          )}
          {screenshotUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Payment screenshot (blurred for privacy)
              </p>
              <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted">
                <img
                  src={screenshotUrl}
                  alt="Payment screenshot"
                  className={`w-full h-full object-cover transition-all duration-300 ${revealed ? "" : "blur-md"}`}
                />
                {!revealed && (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs font-medium hover:bg-black/40 transition-colors"
                  >
                    Tap to reveal
                  </button>
                )}
              </div>
              {revealed && (
                <button
                  type="button"
                  onClick={() => setRevealed(false)}
                  className="text-[10px] text-muted-foreground mt-1 underline"
                >
                  Hide
                </button>
              )}
            </div>
          )}
        </section>

        <Button
          onClick={contactAdmin}
          variant="outline"
          className="w-full rounded-full"
        >
          <MessageCircle className="h-4 w-4 mr-2" /> Contact Us on WhatsApp
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
