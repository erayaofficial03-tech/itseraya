import { useEffect } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingBag, ChevronRight } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

  useEffect(() => {
    if (!authLoading && !user) navigate("/login?redirect=/orders");
  }, [user, authLoading, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_ref, total_amount, order_status, created_at, order_items(id)")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 pb-24 md:pb-10"><PageTransition>
        <h1 className="text-2xl font-light text-foreground mb-6">My Orders</h1>

        {(authLoading || isLoading) ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="text-5xl mb-4" aria-hidden>🛍️</div>
            <h2 className="font-serif text-xl text-foreground mb-2">No orders yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Browse our collection and place your first order.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/catalogue">
                <ShoppingBag className="h-4 w-4 mr-2" /> Browse Collection
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => {
              const itemCount = Array.isArray(o.order_items) ? o.order_items.length : 0;
              return (
                <Link
                  key={o.id}
                  to={`/orders/${o.order_ref}`}
                  className="block bg-muted/20 hover:bg-muted/30 transition-colors p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        {itemCount > 0 && ` · ${itemCount} item${itemCount > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#C9A84C]">
                        ₹{Number(o.total_amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageTransition></main>
      <Footer />
    </div>
  );
};

export default MyOrders;
