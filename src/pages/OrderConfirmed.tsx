import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Package, MessageCircle, Loader2 } from "lucide-react";
import CheckoutHeader from "@/components/header/CheckoutHeader";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/queries";

type OrderRow = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  subtotal: number;
  shipping_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
};

type ItemRow = {
  id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_colour: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const OrderConfirmed = () => {
  const { ref } = useParams<{ ref: string }>();
  const { data: settingsData } = useSettings();
  const settings = settingsData as any;
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!ref) return;
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("order_ref", ref)
        .maybeSingle();
      if (o) {
        setOrder(o as OrderRow);
        const { data: its } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", (o as any).id);
        setItems((its as ItemRow[]) || []);
      }
      setLoading(false);
    })();
  }, [ref]);

  const shareOnWhatsApp = () => {
    if (!order) return;
    const text = `I just placed an order with Eraya!\nOrder Ref: ${order.order_ref}\nTotal: ₹${order.total_amount.toLocaleString("en-IN")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-light mb-4">Order not found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find an order with reference "{ref}".
          </p>
          <Link to="/">
            <Button className="rounded-full">Go Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-light text-foreground mb-2">Order Placed!</h1>
          <p className="text-sm text-muted-foreground">
            {settings?.order_confirmation_message ||
              "Thank you! We will verify your payment and confirm your order shortly."}
          </p>
        </div>

        <div className="bg-muted/20 p-6 rounded-lg space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Reference</span>
            <span className="font-mono font-semibold text-foreground">
              {order.order_ref}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full text-xs font-medium uppercase">
              {order.order_status}
            </span>
          </div>

          <div className="border-t border-muted-foreground/20 pt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 bg-muted overflow-hidden flex-shrink-0 rounded">
                  {item.product_image_url && (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-foreground truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                    {item.variant_size && ` · ${item.variant_size}`}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  ₹{item.total_price.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-muted-foreground/20 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-[#C9A84C]">
              ₹{order.total_amount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/orders/${order.order_ref}`} className="flex-1">
            <Button className="w-full bg-[#C9A84C] hover:bg-[#b89640] text-white rounded-full">
              <Package className="h-4 w-4 mr-2" /> Track Order
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full rounded-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        <button
          onClick={shareOnWhatsApp}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Share on WhatsApp
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmed;
