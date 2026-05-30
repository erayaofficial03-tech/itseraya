import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Package, ChevronRight } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type OrderRow = {
  id: string;
  order_ref: string;
  total_amount: number;
  order_status: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-gray-100 text-gray-700",
  confirmed: "bg-[#C9A84C]/15 text-[#C9A84C]",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login?redirect=/orders");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_ref, total_amount, order_status, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as OrderRow[]) || []);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-light text-foreground mb-6">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">No orders yet.</p>
            <Link to="/catalogue">
              <Button className="rounded-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.order_ref}`}
                className="block bg-muted/20 hover:bg-muted/30 transition-colors p-4 rounded-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {o.order_ref}
                      </span>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium ${
                          STATUS_STYLES[o.order_status] || STATUS_STYLES.placed
                        }`}
                      >
                        {o.order_status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#C9A84C]">
                      ₹{o.total_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
