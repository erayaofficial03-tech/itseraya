import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, MessageSquare, Users as UsersIcon, Heart,
  Search as SearchIcon, ExternalLink, AlertCircle, Clock,
} from "lucide-react";
import { useProducts, useCategories, useAdminSettings } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  WhatsAppClicksWidget, TopProductsWidget, BannerPerformanceWidget,
  EnquiryTrendWidget, ConversionFunnelWidget,
} from "./dashboard-widgets";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const GoLiveChecklist = () => {
  const { data: settings } = useAdminSettings();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const [activeBanners, setActiveBanners] = useState(0);
  const [payment, setPayment] = useState<{ upi_id: string | null; upi_qr_url: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("banners")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      setActiveBanners(count ?? 0);
      const { data } = await (supabase as any)
        .from("payment_settings")
        .select("upi_id, upi_qr_url")
        .eq("id", 1)
        .maybeSingle();
      if (data) setPayment(data);
    })();
  }, []);

  const s: any = settings || {};
  const checks = [
    { label: "Logo uploaded", done: !!s.logo_url, action: "/admin/brand", actionLabel: "Upload logo" },
    { label: "WhatsApp number set", done: !!s.whatsapp_number, action: "/admin/settings", actionLabel: "Add number" },
    { label: "UPI ID set for payments", done: !!payment?.upi_id, action: "/admin/settings", actionLabel: "Add UPI ID" },
    { label: "UPI QR code uploaded", done: !!payment?.upi_qr_url, action: "/admin/settings", actionLabel: "Upload QR" },
    { label: "Hero banner added", done: activeBanners > 0, action: "/admin/banners", actionLabel: "Add banner" },
    { label: "Categories with images (≥3)", done: categories.filter((c: any) => c.image_url && c.is_visible).length >= 3, action: "/admin/categories", actionLabel: "Add images" },
    { label: "Products added (min 5)", done: products.filter((p: any) => p.is_visible).length >= 5, action: "/admin/products", actionLabel: "Add products" },
    { label: "Products have real images", done: products.filter((p: any) => (p.product_images?.length ?? 0) > 0).length >= 3, action: "/admin/products", actionLabel: "Upload photos" },
    { label: "SEO title and description set", done: !!s.seo_title && !!s.seo_description, action: "/admin/seo", actionLabel: "Set SEO" },
    { label: "Google Search Console verified", done: !!s.google_site_verification, action: "/admin/seo", actionLabel: "Add verification code" },
    { label: "Tagline set", done: !!s.tagline && s.tagline !== "Adorn Your Story", action: "/admin/brand", actionLabel: "Set tagline" },
    { label: "About page content set", done: !!s.about_body, action: "/admin/settings", actionLabel: "Write brand story" },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const allDone = doneCount === checks.length;
  const pct = Math.round((doneCount / checks.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base">
            {allDone ? "🎉 Store is Live Ready!" : "🚀 Go-Live Checklist"}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{doneCount} of {checks.length} completed</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#C9A84C" }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0">
            <span className="flex items-center gap-2 min-w-0">
              <span aria-hidden>{check.done ? "✅" : "🔴"}</span>
              <span className={`text-sm truncate ${check.done ? "text-muted-foreground line-through" : ""}`}>
                {check.label}
              </span>
            </span>
            {!check.done && (
              <Link to={check.action} className="text-xs font-medium hover:underline flex-shrink-0" style={{ color: "#C9A84C" }}>
                {check.actionLabel} →
              </Link>
            )}
          </div>
        ))}
        {allDone && (
          <div className="mt-3 rounded-lg p-4 text-center" style={{ background: "#FEF3C7" }}>
            <p className="text-sm font-medium">🎉 Eraya is ready for customers!</p>
            <p className="text-xs text-muted-foreground mt-1">Share itseraya.in with your first customers.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickStat = ({
  icon: Icon, emoji, label, primary, secondary, to,
}: { icon: any; emoji: string; label: string; primary: string | number; secondary?: string; to: string }) => (
  <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl">
    <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-gold/40 cursor-pointer h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <span aria-hidden>{emoji}</span> {label}
          </span>
          <Icon className="h-4 w-4 text-gold" />
        </div>
        <p className="text-2xl font-serif leading-tight">{primary}</p>
        {secondary && <p className="text-xs text-muted-foreground mt-1">{secondary}</p>}
      </CardContent>
    </Card>
  </Link>
);

type RecentOrder = {
  id: string; order_ref: string | null; total_amount: number | null; order_status: string | null;
  payment_status: string | null; created_at: string; customer_name: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const Dashboard = () => {
  const { isAdmin, profile, user } = useAuth();
  const firstName = (profile?.full_name?.split(" ")[0]) || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [enquiriesNew, setEnquiriesNew] = useState(0);
  const [enquiriesPending, setEnquiriesPending] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [customersNewToday, setCustomersNewToday] = useState(0);
  const [wishlistWeek, setWishlistWeek] = useState(0);

  const [pendingPayments, setPendingPayments] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    (async () => {
      const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7);
      const todayISO = startOfToday.toISOString();
      const weekISO = startOfWeek.toISOString();

      const [
        ordersTodayRes, enquiriesNewRes, enquiriesPendingRes,
        customersRes, customersNewRes, wishlistRes,
        pendingPayRes, recentOrdersRes,
      ] = await Promise.all([
        supabase.from("orders").select("total_amount").gte("created_at", todayISO),
        supabase.from("enquiry_sessions").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
        supabase.from("enquiry_sessions").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
        (supabase as any).from("wishlists").select("id", { count: "exact", head: true }).gte("created_at", weekISO),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending_review"),
        supabase.from("orders").select("id, order_ref, total_amount, order_status, payment_status, created_at, customer_name").order("created_at", { ascending: false }).limit(5),
      ]);

      const todayRows = (ordersTodayRes.data || []) as any[];
      setOrdersToday(todayRows.length);
      setRevenueToday(todayRows.reduce((s, r) => s + (Number(r?.total_amount) || 0), 0));
      setEnquiriesNew(enquiriesNewRes.count ?? 0);
      setEnquiriesPending(enquiriesPendingRes.count ?? 0);
      setCustomerCount(customersRes.count ?? 0);
      setCustomersNewToday(customersNewRes.count ?? 0);
      setWishlistWeek(wishlistRes.count ?? 0);
      setPendingPayments(pendingPayRes.count ?? 0);
      setRecentOrders(((recentOrdersRes.data || []) as unknown) as RecentOrder[]);
    })().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif">
          Good {timeOfDay}, {firstName} <span aria-hidden>👋</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening at Eraya today
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <QuickStat
          icon={ShoppingBag} emoji="💰" label="Orders today"
          primary={ordersToday}
          secondary={formatINR(revenueToday)}
          to="/admin/orders"
        />
        <QuickStat
          icon={MessageSquare} emoji="📩" label="Enquiries"
          primary={`New: ${enquiriesNew}`}
          secondary={`Pending: ${enquiriesPending}`}
          to="/admin/enquiries"
        />
        <QuickStat
          icon={UsersIcon} emoji="👥" label="Customers"
          primary={`Total: ${customerCount}`}
          secondary={`New today: ${customersNewToday}`}
          to="/admin/customers"
        />
        <QuickStat
          icon={Heart} emoji="💛" label="Wishlist saves"
          primary={wishlistWeek}
          secondary="This week"
          to="/admin/products"
        />
      </div>

      {/* Urgent action items */}
      {(pendingPayments > 0 || enquiriesPending > 0) && (
        <div className="space-y-2">
          {pendingPayments > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {pendingPayments} order{pendingPayments > 1 ? "s" : ""} waiting for payment confirmation
              </span>
              <Link to="/admin/orders" className="text-red-600 text-sm font-semibold underline">
                Review now →
              </Link>
            </div>
          )}
          {enquiriesPending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {enquiriesPending} enquir{enquiriesPending > 1 ? "ies" : "y"} need a response
              </span>
              <Link to="/admin/enquiries" className="text-amber-600 text-sm font-semibold underline">
                View enquiries →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Go-Live Checklist */}
      {isAdmin && <GoLiveChecklist />}

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent orders</CardTitle>
          <Link to="/admin/orders" className="text-xs text-gold hover:underline">View all →</Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      #{o.order_ref || o.id.slice(0, 6)} · {o.customer_name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(o.created_at), "dd MMM, HH:mm")} · {formatINR(Number(o.total_amount) || 0)}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_BADGE[o.order_status || "pending"] || "bg-muted text-muted-foreground"}`}>
                    {o.order_status || "pending"}
                  </span>
                  <Link to={`/admin/orders?ref=${o.order_ref || ""}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Open</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WhatsAppClicksWidget />
        <TopProductsWidget />
        <EnquiryTrendWidget />
        <ConversionFunnelWidget />
        <BannerPerformanceWidget />
        <InstallEventsWidget />
      </div>

      {isAdmin && (
        <Card className="border-gold/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-gold" />
              Google Search Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ul className="space-y-1.5 text-muted-foreground">
              <li>✅ SEO-friendly URLs active (<code className="text-xs">/jewellery/&lt;slug&gt;</code>, <code className="text-xs">/collection/&lt;slug&gt;</code>)</li>
              <li>✅ Sitemap generated at <code className="text-xs">/sitemap.xml</code></li>
              <li>✅ <code className="text-xs">robots.txt</code> configured</li>
              <li>✅ Structured data (Product, Organization, BreadcrumbList) active</li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-gold/40 text-gold hover:bg-gold/10">
                Open Google Search Console <ExternalLink className="h-3 w-3" />
              </a>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted">
                Open Sitemap <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
