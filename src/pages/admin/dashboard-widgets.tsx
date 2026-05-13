import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";

const since = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

type SourceRow = { source: string | null };
type ViewRow = { product_id: string | null };
type ClickRow = { banner_id: string | null };
type EnqRow = { created_at: string };

export const WhatsAppClicksWidget = () => {
  const [data, setData] = useState<{ source: string; count: number }[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("whatsapp_clicks")
        .select("source")
        .gte("clicked_at", since(30));
      const tally: Record<string, number> = {};
      (rows as SourceRow[] | null || []).forEach((r) => {
        const k = r.source || "unknown";
        tally[k] = (tally[k] || 0) + 1;
      });
      setData(Object.entries(tally).map(([source, count]) => ({ source, count })));
    })();
  }, []);
  const total = data?.reduce((s, d) => s + d.count, 0) ?? 0;
  const labels: Record<string, string> = {
    float_button: "Float button",
    product_card: "Product card",
    enquiry_drawer: "Enquiry drawer",
    product_detail: "Product detail",
    unknown: "Other",
  };
  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">WhatsApp Clicks</CardTitle>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? <Skeleton className="h-32 w-full" /> : (
          <>
            <p className="text-3xl font-serif text-gold mb-3">{total}</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.map((d) => ({ ...d, label: labels[d.source] || d.source }))}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const TopProductsWidget = () => {
  const [data, setData] = useState<{ id: string; name: string; image: string | null; count: number }[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data: views } = await supabase
        .from("product_views")
        .select("product_id")
        .gte("viewed_at", since(30));
      const tally: Record<string, number> = {};
      (views as ViewRow[] | null || []).forEach((r) => {
        if (r.product_id) tally[r.product_id] = (tally[r.product_id] || 0) + 1;
      });
      const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (top.length === 0) { setData([]); return; }
      const ids = top.map(([id]) => id);
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, product_images(image_url, sort_order)")
        .in("id", ids);
      const byId = new Map((prods || []).map((p: { id: string; name: string; product_images?: { image_url: string; sort_order: number }[] }) => {
        const img = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null;
        return [p.id, { name: p.name, image: img }];
      }));
      setData(top.map(([id, count]) => ({ id, count, name: byId.get(id)?.name ?? "Unknown", image: byId.get(id)?.image ?? null })));
    })();
  }, []);
  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">Most Viewed Products</CardTitle>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? <Skeleton className="h-32 w-full" /> : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No views yet.</p>
        ) : (
          <ol className="space-y-2">
            {data.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="font-serif text-lg w-6 text-gold">{i + 1}</span>
                {p.image
                  ? <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                  : <div className="h-10 w-10 rounded bg-muted" />}
                <span className="flex-1 text-sm truncate">{p.name}</span>
                <span className="text-xs font-medium text-muted-foreground">{p.count} views</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export const BannerPerformanceWidget = () => {
  const [data, setData] = useState<{ id: string; title: string; count: number }[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data: clicks } = await supabase
        .from("banner_clicks")
        .select("banner_id")
        .gte("clicked_at", since(30));
      const tally: Record<string, number> = {};
      (clicks as ClickRow[] | null || []).forEach((r) => {
        if (r.banner_id) tally[r.banner_id] = (tally[r.banner_id] || 0) + 1;
      });
      const ids = Object.keys(tally);
      if (ids.length === 0) { setData([]); return; }
      const { data: banners } = await supabase.from("banners").select("id, title").in("id", ids);
      const byId = new Map((banners || []).map((b: { id: string; title: string | null }) => [b.id, b.title || "Untitled"]));
      setData(Object.entries(tally).map(([id, count]) => ({ id, title: byId.get(id) || "Banner", count })).sort((a, b) => b.count - a.count));
    })();
  }, []);
  if (data && data.length === 0) return null;
  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">Banner Performance</CardTitle>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? <Skeleton className="h-32 w-full" /> : (
          <ul className="space-y-2">
            {data.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{b.title}</span>
                <span className="font-medium text-gold">{b.count}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export const EnquiryTrendWidget = () => {
  const [data, setData] = useState<{ date: string; count: number }[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("enquiry_sessions")
        .select("created_at")
        .gte("created_at", since(14));
      const tally: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = format(startOfDay(subDays(new Date(), i)), "MMM dd");
        tally[d] = 0;
      }
      (rows as EnqRow[] | null || []).forEach((r) => {
        const d = format(startOfDay(new Date(r.created_at)), "MMM dd");
        if (d in tally) tally[d]++;
      });
      setData(Object.entries(tally).map(([date, count]) => ({ date, count })));
    })();
  }, []);
  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">Enquiry Trend</CardTitle>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 14 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? <Skeleton className="h-40 w-full" /> : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3, fill: "#C9A84C" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ConversionFunnelWidget = () => {
  const [stats, setStats] = useState<{ views: number; enquiries: number; whatsapp: number; won: number } | null>(null);
  useEffect(() => {
    (async () => {
      const [{ count: v }, { count: e }, { count: w }, { count: won }] = await Promise.all([
        supabase.from("product_views").select("id", { count: "exact", head: true }).gte("viewed_at", since(30)),
        supabase.from("enquiry_sessions").select("id", { count: "exact", head: true }).gte("created_at", since(30)),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("clicked_at", since(30)),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "closed_won").gte("created_at", since(30)),
      ]);
      setStats({ views: v ?? 0, enquiries: e ?? 0, whatsapp: w ?? 0, won: won ?? 0 });
    })();
  }, []);
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">Conversion Funnel</CardTitle>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {!stats ? <Skeleton className="h-40 w-full" /> : (
          <div className="space-y-2">
            {[
              { label: "Product Views", val: stats.views, base: stats.views },
              { label: "Enquiry Opened", val: stats.enquiries, base: stats.views },
              { label: "WhatsApp Sent", val: stats.whatsapp, base: stats.enquiries },
              { label: "Closed Won", val: stats.won, base: stats.enquiries },
            ].map((row, i, arr) => {
              const max = arr[0].val || 1;
              const w = Math.max(8, Math.round((row.val / max) * 100));
              return (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground">
                      {row.val.toLocaleString()}
                      {i > 0 && <span className="ml-2 text-gold">{pct(row.val, row.base)}%</span>}
                    </span>
                  </div>
                  <div className="h-6 rounded bg-muted overflow-hidden">
                    <div className="h-full bg-gold/80" style={{ width: `${w}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type InstallEventRow = { event_type: string; platform: string | null };

export const InstallEventsWidget = () => {
  const [data, setData] = useState<InstallEventRow[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("install_events")
        .select("event_type, platform")
        .gte("occurred_at", since(30));
      setData((rows as InstallEventRow[] | null) ?? []);
    })();
  }, []);

  const counts: Record<string, number> = {};
  const platformCounts: Record<string, number> = {};
  (data ?? []).forEach((r) => {
    counts[r.event_type] = (counts[r.event_type] || 0) + 1;
    const p = r.platform || "other";
    platformCounts[p] = (platformCounts[p] || 0) + 1;
  });

  const labels: Record<string, string> = {
    prompt_shown: "Button tapped",
    ios_guide_opened: "iOS guide opened",
    copy_link: "Link copied",
    accepted: "Accepted",
    dismissed: "Dismissed",
    installed: "Installed",
  };
  const order = ["prompt_shown", "ios_guide_opened", "copy_link", "accepted", "dismissed", "installed"];
  const chartData = order
    .filter((k) => counts[k])
    .map((k) => ({ label: labels[k], count: counts[k] }));

  const total = data?.length ?? 0;

  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">App Installs</CardTitle>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? <Skeleton className="h-32 w-full" /> : total === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No install activity yet.</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-3xl font-serif text-gold">{counts.installed ?? 0}</p>
              <p className="text-xs text-muted-foreground">
                {total} total events
              </p>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/60">
              {Object.entries(platformCounts).map(([p, c]) => (
                <span key={p} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {p} · {c}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
