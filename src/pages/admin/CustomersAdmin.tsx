import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Search, Phone, MessageCircle, Heart, Eye, Package, MessagesSquare, Mail, MapPin, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type CustomerRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  is_blocked: boolean;
};

const PAGE_SIZE = 20;

const CustomerDetail = ({ customer, open, onOpenChange }: {
  customer: CustomerRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const customerId = customer?.id;

  const { data: wishlist = [] } = useQuery({
    queryKey: ['customer-wishlist', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data } = await supabase
        .from('wishlist_items')
        .select('*, products(name, original_price, discounted_price, product_images(image_url))')
        .eq('user_id', customerId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: views = [] } = useQuery({
    queryKey: ['customer-views', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data } = await supabase
        .from('product_views')
        .select('*, products(name)')
        .eq('user_id', customerId!)
        .order('viewed_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['customer-orders', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, order_ref, order_status, payment_status, total_amount, created_at')
        .eq('customer_id', customerId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: enquiries = [] } = useQuery({
    queryKey: ['customer-enquiries', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data } = await supabase
        .from('enquiry_sessions')
        .select('id, enquiry_ref, status, customer_name, created_at')
        .eq('user_id', customerId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  if (!customer) return null;

  const phoneDigits = customer.phone?.replace(/\D/g, '') || '';
  const handleCall = () => phoneDigits && window.open(`tel:+91${phoneDigits}`);
  const handleWhatsApp = () => phoneDigits && window.open(`https://wa.me/91${phoneDigits}`, '_blank');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {customer.avatar_url ? (
              <img src={customer.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
            ) : (
              <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {(customer.full_name ?? customer.email).charAt(0).toUpperCase()}
              </span>
            )}
            <span>{customer.full_name || customer.email.split('@')[0]}</span>
          </SheetTitle>
          <SheetDescription>Customer profile and activity</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Info */}
          <section className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{customer.email}</div>
            {customer.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</div>}
            {customer.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{customer.city}</div>}
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Joined {format(new Date(customer.created_at), 'dd MMM yyyy')}</div>
          </section>

          {/* Quick Actions */}
          <section className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCall} disabled={!phoneDigits}>
              <Phone className="h-4 w-4 mr-2" /> Call
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp} disabled={!phoneDigits}>
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </Button>
          </section>

          {/* Wishlist */}
          <section>
            <h3 className="font-medium mb-3 flex items-center gap-2"><Heart className="h-4 w-4" /> Wishlist <Badge variant="outline">{wishlist.length}</Badge></h3>
            {wishlist.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved products.</p>
            ) : (
              <ul className="space-y-2">
                {wishlist.map((w: any) => {
                  const img = w.products?.product_images?.[0]?.image_url;
                  const price = w.products?.discounted_price ?? w.products?.original_price;
                  return (
                    <li key={w.id} className="flex items-center gap-3 p-2 rounded-md border">
                      {img ? <img src={img} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{w.products?.name ?? 'Product'}</p>
                        <p className="text-xs text-muted-foreground">₹{price ?? '—'} · saved {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Views */}
          <section>
            <h3 className="font-medium mb-3 flex items-center gap-2"><Eye className="h-4 w-4" /> Products viewed <Badge variant="outline">{views.length}</Badge></h3>
            {views.length === 0 ? (
              <p className="text-xs text-muted-foreground">No views tracked yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {views.map((v: any) => (
                  <li key={v.id} className="flex justify-between gap-3 py-1 border-b border-border/50 last:border-0">
                    <span className="truncate">{v.products?.name ?? 'Product'}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(v.viewed_at), { addSuffix: true })}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Orders */}
          <section>
            <h3 className="font-medium mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> Orders <Badge variant="outline">{orders.length}</Badge></h3>
            {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground">No orders.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o: any) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 p-2 rounded-md border text-sm">
                    <div>
                      <p className="font-medium">{o.order_ref}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), 'dd MMM yyyy')} · ₹{o.total_amount}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">{o.order_status}</Badge>
                      <span className="text-xs text-muted-foreground">{o.payment_status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Enquiries */}
          <section>
            <h3 className="font-medium mb-3 flex items-center gap-2"><MessagesSquare className="h-4 w-4" /> Enquiries <Badge variant="outline">{enquiries.length}</Badge></h3>
            {enquiries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No enquiries.</p>
            ) : (
              <ul className="space-y-2">
                {enquiries.map((e: any) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 p-2 rounded-md border text-sm">
                    <div>
                      <p className="font-medium">{e.enquiry_ref}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(e.created_at), 'dd MMM yyyy')}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{e.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const CustomersAdmin = () => {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<CustomerRow | null>(null);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id, role"),
        ]);
        if (pErr) throw pErr;
        if (rErr) throw rErr;

        const nonCustomerIds = new Set(
          (roles ?? [])
            .filter((r: any) => r.role === "admin" || r.role === "manager")
            .map((r: any) => r.user_id),
        );

        setRows(
          (profiles ?? [])
            .filter((p: any) => !nonCustomerIds.has(p.id))
            .map((p: any) => ({
              id: p.id,
              email: p.email,
              full_name: p.full_name,
              avatar_url: p.avatar_url,
              phone: p.phone ?? null,
              city: p.city ?? null,
              created_at: p.created_at,
              is_blocked: !!p.is_blocked,
            })),
        );
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.email.toLowerCase().includes(q) || (r.full_name ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tap a customer to see their wishlist, views, orders and enquiries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            All customers
            <Badge variant="outline">{rows.length}</Badge>
          </CardTitle>
          <CardDescription>Manage roles and blocks under Users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
            />
          </div>

          {loading ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No customers yet. They'll appear here after their first Google login.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
              </p>
              <ul className="divide-y divide-border rounded-md border border-border">
                {filtered.slice(0, visibleCount).map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(u)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
                      ) : (
                        <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{u.full_name || u.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          u.is_blocked
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-green-100 text-green-700 border-green-300"
                        }
                      >
                        {u.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {format(new Date(u.created_at), "dd MMM yyyy")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {visibleCount < filtered.length && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Load more ({filtered.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CustomerDetail
        customer={selected}
        open={!!selected}
        onOpenChange={(v) => { if (!v) setSelected(null); }}
      />
    </div>
  );
};

export default CustomersAdmin;
