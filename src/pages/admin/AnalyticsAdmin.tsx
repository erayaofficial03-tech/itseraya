import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, useProducts, useCategories } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay } from "date-fns";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, Eye, MessageCircle, ShoppingBag, TrendingUp, Smartphone, ExternalLink, Heart,
} from "lucide-react";

type RangeKey = "1" | "7" | "30" | "90";
const RANGE_LABELS: Record<RangeKey, string> = { "1": "Today", "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" };

const dayKey = (d: string | Date) => format(new Date(d), "yyyy-MM-dd");
const buildDailySeries = (days: number) => {
  const out: { date: string; label: string }[] = [];
  const start = startOfDay(subDays(new Date(), days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    out.push({ date: dayKey(d), label: format(d, "MMM d") });
  }
  return out;
};

const StatCard = ({ icon: Icon, label, value, hint }: any) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-gold" />
      </div>
      <p className="text-2xl font-serif leading-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

const SectionHeader = () => (
  <div className="mb-6 pb-4 border-b border-border">
    <h1 className="text-2xl font-bold">Analytics</h1>
    <p className="text-sm text-muted-foreground mt-1">
      Visitor stats, clicks, conversions — everything in one place
    </p>
  </div>
);

const AnalyticsAdmin = () => {
  const [range, setRange] = useState<RangeKey>("30");
  const days = Number(range);
  const startISO = useMemo(() => startOfDay(subDays(new Date(), days - 1)).toISOString(), [days]);

  const { data: settings } = useSettings();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<{ viewed_at: string; product_id: string | null }[]>([]);
  const [waClicks, setWaClicks] = useState<{ clicked_at: string; source: string | null; product_id: string | null }[]>([]);
  const [enquiries, setEnquiries] = useState<{ created_at: string; id: string }[]>([]);
  const [enquiryItems, setEnquiryItems] = useState<{ product_id: string | null; product_name: string | null }[]>([]);
  const [orders, setOrders] = useState<{ created_at: string }[]>([]);
  const [orderItems, setOrderItems] = useState<{ product_id: string | null; product_name: string | null; quantity: number | null }[]>([]);
  const [installs, setInstalls] = useState<{ occurred_at: string; event_type: string | null; platform: string | null }[]>([]);
  const [bannerClicks, setBannerClicks] = useState<{ banner_id: string | null }[]>([]);
  const [bannerImps, setBannerImps] = useState<{ banner_id: string | null }[]>([]);
  const [bannerNames, setBannerNames] = useState<Record<string, string>>({});
  const [signups, setSignups] = useState<{ id: string; email: string; full_name: string | null; city: string | null; created_at: string }[]>([]);
  const [wishlists, setWishlists] = useState<{ product_id: string | null }[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [
        vRes, wRes, eRes, eiRes, oRes, oiRes, iRes, bcRes, biRes, bRes, sRes, wlRes,
      ] = await Promise.all([
        supabase.from("product_views").select("viewed_at, product_id").gte("viewed_at", startISO),
        supabase.from("whatsapp_clicks").select("clicked_at, source, product_id").gte("clicked_at", startISO),
        supabase.from("enquiry_sessions").select("created_at, id").gte("created_at", startISO),
        supabase.from("enquiry_items").select("product_id, product_name").gte("created_at", startISO),
        supabase.from("orders").select("created_at").gte("created_at", startISO),
        supabase.from("order_items").select("product_id, product_name, quantity").gte("created_at", startISO),
        supabase.from("install_events").select("occurred_at, event_type, platform").gte("occurred_at", startISO),
        supabase.from("banner_clicks").select("banner_id").gte("clicked_at", startISO),
        supabase.from("banner_impressions").select("banner_id").gte("viewed_at", startISO),
        supabase.from("banners").select("id, title"),
        supabase.from("profiles").select("id, email, full_name, city, created_at").order("created_at", { ascending: false }),
        (supabase as any).from("wishlist_items").select("product_id").gte("created_at", startISO),
      ]);
      if (cancelled) return;
      setViews((vRes.data || []) as any);
      setWaClicks((wRes.data || []) as any);
      setEnquiries((eRes.data || []) as any);
      setEnquiryItems((eiRes.data || []) as any);
      setOrders((oRes.data || []) as any);
      setOrderItems((oiRes.data || []) as any);
      setInstalls((iRes.data || []) as any);
      setBannerClicks((bcRes.data || []) as any);
      setBannerImps((biRes.data || []) as any);
      const bm: Record<string, string> = {};
      (bRes.data || []).forEach((b: any) => { bm[b.id] = b.title || "Untitled"; });
      setBannerNames(bm);
      setSignups((sRes.data || []) as any);
      setWishlists((wlRes.data || []) as any);
      setLoading(false);
    })().catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [startISO]);

  // KPIs
  const totalVisitors = views.length;
  const totalWA = waClicks.length;
  const totalEnq = enquiries.length;
  const totalOrders = orders.length;
  const convRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(2) + "%" : "—";

  // Trend chart data
  const trend = useMemo(() => {
    const series = buildDailySeries(days);
    const idx: Record<string, any> = {};
    series.forEach((s) => { idx[s.date] = { date: s.label, Visitors: 0, Enquiries: 0, Orders: 0 }; });
    views.forEach((v) => { const k = dayKey(v.viewed_at); if (idx[k]) idx[k].Visitors++; });
    enquiries.forEach((e) => { const k = dayKey(e.created_at); if (idx[k]) idx[k].Enquiries++; });
    orders.forEach((o) => { const k = dayKey(o.created_at); if (idx[k]) idx[k].Orders++; });
    return series.map((s) => idx[s.date]);
  }, [views, enquiries, orders, days]);

  // Install funnel
  const installCounts = useMemo(() => {
    const c = { prompt_shown: 0, accepted: 0, installed: 0, ios: 0, android: 0 };
    installs.forEach((i) => {
      const t = (i.event_type || "").toLowerCase();
      if (t.includes("prompt")) c.prompt_shown++;
      if (t.includes("accept")) c.accepted++;
      if (t.includes("install")) c.installed++;
      const p = (i.platform || "").toLowerCase();
      if (p.includes("ios")) c.ios++;
      if (p.includes("android")) c.android++;
    });
    return c;
  }, [installs]);

  // Products tab
  const productMap = useMemo(() => {
    const m: Record<string, any> = {};
    (products as any[]).forEach((p) => { m[p.id] = p; });
    return m;
  }, [products]);

  const productStats = useMemo(() => {
    const stats: Record<string, { views: number; wishes: number; wa: number; name: string }> = {};
    const bump = (id: string | null | undefined, key: "views" | "wishes" | "wa", name?: string) => {
      if (!id) return;
      if (!stats[id]) stats[id] = { views: 0, wishes: 0, wa: 0, name: productMap[id]?.name || name || id.slice(0, 6) };
      stats[id][key]++;
    };
    views.forEach((v) => bump(v.product_id, "views"));
    wishlists.forEach((w) => bump(w.product_id, "wishes"));
    waClicks.forEach((w) => bump(w.product_id, "wa"));
    return Object.entries(stats).map(([id, s]) => ({ id, ...s })).sort((a, b) => b.views - a.views).slice(0, 20);
  }, [views, wishlists, waClicks, productMap]);

  const { data: wishlistStats } = useQuery({
    queryKey: ['wishlist-stats'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('wishlist_items')
        .select('product_id, products(name, original_price)')
        .order('created_at', { ascending: false });
      const counts: Record<string, { name: string; count: number; price: number }> = {};
      (data || []).forEach((item: any) => {
        const id = item.product_id;
        if (!counts[id]) counts[id] = { name: item.products?.name || 'Unknown', count: 0, price: item.products?.original_price || 0 };
        counts[id].count++;
      });
      return Object.entries(counts).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
    }
  });

  const topEnquiredProducts = useMemo(() => {
    const t: Record<string, { name: string; count: number }> = {};
    enquiryItems.forEach((i) => {
      const k = i.product_id || i.product_name || "";
      if (!k) return;
      if (!t[k]) t[k] = { name: i.product_name || productMap[k]?.name || k.slice(0, 6), count: 0 };
      t[k].count++;
    });
    return Object.values(t).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [enquiryItems, productMap]);

  const topOrderedProducts = useMemo(() => {
    const t: Record<string, { name: string; qty: number }> = {};
    orderItems.forEach((i) => {
      const k = i.product_id || i.product_name || "";
      if (!k) return;
      if (!t[k]) t[k] = { name: i.product_name || productMap[k]?.name || k.slice(0, 6), qty: 0 };
      t[k].qty += Number(i.quantity) || 0;
    });
    return Object.values(t).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [orderItems, productMap]);

  // Customers tab
  const signupsInRange = useMemo(
    () => signups.filter((s) => new Date(s.created_at).getTime() >= new Date(startISO).getTime()),
    [signups, startISO]
  );
  const newCustomerTrend = useMemo(() => {
    const series = buildDailySeries(days);
    const idx: Record<string, any> = {};
    series.forEach((s) => { idx[s.date] = { date: s.label, New: 0 }; });
    signupsInRange.forEach((s) => { const k = dayKey(s.created_at); if (idx[k]) idx[k].New++; });
    return series.map((s) => idx[s.date]);
  }, [signupsInRange, days]);

  const topCities = useMemo(() => {
    const t: Record<string, number> = {};
    signups.forEach((s) => { const c = (s.city || "").trim(); if (c) t[c] = (t[c] || 0) + 1; });
    return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [signups]);

  // WhatsApp tab
  const waBySource = useMemo(() => {
    const t: Record<string, number> = {};
    waClicks.forEach((w) => { const k = w.source || "unknown"; t[k] = (t[k] || 0) + 1; });
    return Object.entries(t).map(([source, count]) => ({ source, count }));
  }, [waClicks]);

  const waTrend = useMemo(() => {
    const series = buildDailySeries(days);
    const idx: Record<string, any> = {};
    series.forEach((s) => { idx[s.date] = { date: s.label, Clicks: 0 }; });
    waClicks.forEach((w) => { const k = dayKey(w.clicked_at); if (idx[k]) idx[k].Clicks++; });
    return series.map((s) => idx[s.date]);
  }, [waClicks, days]);

  // Banners tab
  const bannerStats = useMemo(() => {
    const imps: Record<string, number> = {};
    const clk: Record<string, number> = {};
    bannerImps.forEach((b) => { if (b.banner_id) imps[b.banner_id] = (imps[b.banner_id] || 0) + 1; });
    bannerClicks.forEach((b) => { if (b.banner_id) clk[b.banner_id] = (clk[b.banner_id] || 0) + 1; });
    const ids = new Set<string>([...Object.keys(imps), ...Object.keys(clk)]);
    return Array.from(ids).map((id) => {
      const i = imps[id] || 0;
      const c = clk[id] || 0;
      return { id, name: bannerNames[id] || id.slice(0, 6), impressions: i, clicks: c, ctr: i > 0 ? ((c / i) * 100).toFixed(1) + "%" : "—" };
    }).sort((a, b) => b.impressions - a.impressions);
  }, [bannerImps, bannerClicks, bannerNames]);

  // SEO health
  const s: any = settings || {};
  const productsWithDesc = (products as any[]).filter((p) => p.description && p.description.length > 30).length;
  const productsWithImages = (products as any[]).filter((p) => (p.product_images?.length ?? 0) > 0).length;
  const catsWithImages = (categories as any[]).filter((c) => c.image_url).length;
  const isVerified = !!s.google_site_verification;

  return (
    <div>
      <SectionHeader />

      {/* Range picker */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
          <Button
            key={k}
            size="sm"
            variant={range === k ? "default" : "outline"}
            onClick={() => setRange(k)}
          >
            {RANGE_LABELS[k]}
          </Button>
        ))}
        {loading && <span className="text-xs text-muted-foreground ml-2">Loading…</span>}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="search">Google Search</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={Eye} label="Visitors" value={totalVisitors} />
            <StatCard icon={MessageCircle} label="WhatsApp clicks" value={totalWA} />
            <StatCard icon={MessageCircle} label="Enquiries" value={totalEnq} />
            <StatCard icon={ShoppingBag} label="Orders" value={totalOrders} />
            <StatCard icon={TrendingUp} label="Conversion" value={convRate} hint="Orders ÷ Visitors" />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Daily trend</CardTitle></CardHeader>
            <CardContent style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Visitors" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Enquiries" stroke="#C9A84C" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Orders" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" /> Install funnel</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Prompt shown</p>
                  <p className="text-2xl font-serif">{installCounts.prompt_shown}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-serif">{installCounts.accepted}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Installed</p>
                  <p className="text-2xl font-serif">{installCounts.installed}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">iOS</p>
                  <p className="text-lg font-medium">{installCounts.ios}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Android</p>
                  <p className="text-lg font-medium">{installCounts.android}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Most viewed products</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr><th className="text-left py-2">Product</th><th className="text-right">Views</th><th className="text-right">Wishlist</th><th className="text-right">WhatsApp</th></tr>
                </thead>
                <tbody>
                  {productStats.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No data</td></tr>}
                  {productStats.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link to={`/admin/products?id=${p.id}`} className="hover:underline">{p.name}</Link>
                      </td>
                      <td className="text-right">{p.views}</td>
                      <td className="text-right">{p.wishes}</td>
                      <td className="text-right">{p.wa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-gold" /> Most wishlisted products
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2">Product</th>
                    <th className="text-right">Saved by</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {!wishlistStats?.length && (
                    <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No wishlist data yet</td></tr>
                  )}
                  {wishlistStats?.map(([id, stat]: any) => (
                    <tr key={id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link to={`/admin/products?id=${id}`} className="hover:underline">{stat.name}</Link>
                      </td>
                      <td className="text-right">{stat.count} customers</td>
                      <td className="text-right">₹{stat.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                Products with high wishlist saves but low orders = opportunity to run a promotion or restock.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Top enquired</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {topEnquiredProducts.length === 0 && <li className="py-3 text-sm text-muted-foreground">No data</li>}
                  {topEnquiredProducts.map((p, i) => (
                    <li key={i} className="py-2 flex justify-between text-sm"><span className="truncate">{p.name}</span><span className="font-medium">{p.count}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Top ordered</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {topOrderedProducts.length === 0 && <li className="py-3 text-sm text-muted-foreground">No data</li>}
                  {topOrderedProducts.map((p, i) => (
                    <li key={i} className="py-2 flex justify-between text-sm"><span className="truncate">{p.name}</span><span className="font-medium">{p.qty}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CUSTOMERS */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard icon={Users} label="Total customers" value={signups.length} />
            <StatCard icon={Users} label="New in range" value={signupsInRange.length} />
            <StatCard icon={Users} label="With city set" value={signups.filter((s) => !!s.city).length} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">New customers per day</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newCustomerTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="New" stroke="#C9A84C" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Top cities</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {topCities.length === 0 && <li className="py-3 text-sm text-muted-foreground">No city data</li>}
                  {topCities.map(([city, n]) => (
                    <li key={city} className="py-2 flex justify-between text-sm"><span>{city}</span><span className="font-medium">{n}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Recent signups</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {signups.slice(0, 8).map((u) => (
                    <li key={u.id} className="py-2 text-sm">
                      <p className="font-medium truncate">{u.full_name || u.email.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email} {u.city ? `· ${u.city}` : ""} · {format(new Date(u.created_at), "dd MMM")}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WHATSAPP */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Clicks by source</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waBySource}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#25D366" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Daily trend</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Clicks" stroke="#25D366" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BANNERS */}
        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Banner performance</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2">Banner</th>
                    <th className="text-right">Impressions</th>
                    <th className="text-right">Clicks</th>
                    <th className="text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {bannerStats.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No banner activity yet</td></tr>}
                  {bannerStats.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2">{b.name}</td>
                      <td className="text-right">{b.impressions}</td>
                      <td className="text-right">{b.clicks}</td>
                      <td className="text-right">{b.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOOGLE SEARCH */}
        <TabsContent value="search" className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold">Google Search Console</h3>
            {isVerified ? (
              <div>
                <p className="text-green-600 text-sm mt-1">✅ Verified — Your site is connected to Google</p>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4285F4] text-white text-sm font-medium"
                >
                  Open Google Search Console <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  In Search Console you can see: which keywords bring visitors, how many impressions your site gets, and which pages rank on Google.
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-amber-600 text-sm">⚠️ Not connected yet</p>
                <Link to="/admin/seo" className="text-sm text-gold underline mt-1 block">
                  → Go to Google & SEO to connect
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold">Sitemap</h3>
            <p className="text-sm text-muted-foreground mt-1">Your sitemap helps Google find all your products.</p>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-gold underline inline-block">
              View sitemap →
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Submit this URL in Google Search Console: itseraya.in/sitemap.xml
            </p>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-2">
            <h3 className="font-semibold">SEO Health Check</h3>
            {[
              { label: "SEO title set",              done: !!s.seo_title },
              { label: "SEO description set",        done: !!s.seo_description },
              { label: "Google verification done",   done: !!s.google_site_verification },
              { label: "Google Analytics connected", done: !!s.google_analytics_id },
              { label: "Products have descriptions (≥5)", done: productsWithDesc >= 5 },
              { label: "Products have images (≥5)",  done: productsWithImages >= 5 },
              { label: "Categories have images (≥3)",done: catsWithImages >= 3 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>{item.done ? "✅" : "🔴"}</span>
                <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.label}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsAdmin;
