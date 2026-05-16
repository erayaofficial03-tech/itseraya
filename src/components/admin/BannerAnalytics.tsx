import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Eye, MousePointerClick, TrendingUp } from "lucide-react";

type RangeKey = "7d" | "30d" | "90d";
const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d",  label: "7 days",  days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

type Banner = { id: string; heading_text: string | null; title: string | null };

const PALETTE = ["#C9A84C", "#5B8DEF", "#F2778D", "#5DBE9A", "#A67BD8", "#E89A4A", "#3FB6C7", "#D85A87"];

export const BannerAnalytics = ({ banners }: { banners: Banner[] }) => {
  const [range, setRange] = useState<RangeKey>("30d");
  const days = RANGES.find((r) => r.key === range)!.days;
  const since = useMemo(() => startOfDay(subDays(new Date(), days - 1)).toISOString(), [days]);

  const { data, isLoading } = useQuery({
    queryKey: ["banner-analytics", range],
    queryFn: async () => {
      const [clicksRes, impsRes] = await Promise.all([
        supabase.from("banner_clicks").select("banner_id, clicked_at").gte("clicked_at", since).limit(50000),
        supabase.from("banner_impressions").select("banner_id, viewed_at").gte("viewed_at", since).limit(50000),
      ]);
      if (clicksRes.error) throw clicksRes.error;
      if (impsRes.error) throw impsRes.error;
      return {
        clicks: (clicksRes.data || []) as { banner_id: string | null; clicked_at: string }[],
        impressions: (impsRes.data || []) as { banner_id: string | null; viewed_at: string }[],
      };
    },
  });

  const { perBanner, daily, totals } = useMemo(() => {
    const empty = { perBanner: [] as Array<{ id: string; name: string; impressions: number; clicks: number; ctr: number; color: string }>, daily: [] as Array<Record<string, number | string>>, totals: { impressions: 0, clicks: 0, ctr: 0 } };
    if (!data) return empty;

    const counts: Record<string, { impressions: number; clicks: number }> = {};
    banners.forEach((b) => { counts[b.id] = { impressions: 0, clicks: 0 }; });

    data.impressions.forEach((i) => {
      if (i.banner_id && counts[i.banner_id]) counts[i.banner_id].impressions++;
    });
    data.clicks.forEach((c) => {
      if (c.banner_id && counts[c.banner_id]) counts[c.banner_id].clicks++;
    });

    const perBanner = banners.map((b, idx) => {
      const c = counts[b.id];
      const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      return {
        id: b.id,
        name: b.heading_text || b.title || "Untitled",
        impressions: c.impressions,
        clicks: c.clicks,
        ctr,
        color: PALETTE[idx % PALETTE.length],
      };
    }).sort((a, b) => b.clicks - a.clicks);

    // build daily buckets
    const bucket: Record<string, Record<string, number>> = {};
    for (let i = 0; i < days; i++) {
      const day = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
      bucket[day] = {};
      perBanner.forEach((b) => { bucket[day][b.id] = 0; });
    }
    data.clicks.forEach((c) => {
      const day = format(new Date(c.clicked_at), "yyyy-MM-dd");
      if (bucket[day] && c.banner_id && bucket[day][c.banner_id] !== undefined) {
        bucket[day][c.banner_id]++;
      }
    });
    const daily = Object.entries(bucket).map(([day, vals]) => ({
      day: format(new Date(day), days <= 7 ? "EEE d" : "MMM d"),
      ...vals,
    }));

    const totalImps = perBanner.reduce((s, b) => s + b.impressions, 0);
    const totalClicks = perBanner.reduce((s, b) => s + b.clicks, 0);
    return {
      perBanner,
      daily,
      totals: {
        impressions: totalImps,
        clicks: totalClicks,
        ctr: totalImps > 0 ? (totalClicks / totalImps) * 100 : 0,
      },
    };
  }, [data, banners, days]);

  // Only top 5 banners as lines, the rest collapsed
  const topForChart = perBanner.slice(0, 5);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-xl">Banner analytics</h2>
            <p className="text-xs text-muted-foreground">Impressions, clicks, and CTR per banner</p>
          </div>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-3 py-1.5 text-xs",
                  range === r.key ? "bg-[#C9A84C] text-white" : "bg-background hover:bg-muted",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <Kpi icon={<Eye className="h-4 w-4" />} label="Impressions" value={totals.impressions.toLocaleString()} />
          <Kpi icon={<MousePointerClick className="h-4 w-4" />} label="Clicks" value={totals.clicks.toLocaleString()} />
          <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Overall CTR" value={`${totals.ctr.toFixed(2)}%`} />
        </div>

        {/* Chart */}
        <div className="h-64 rounded-lg border border-border p-3">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : daily.length === 0 || topForChart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No data yet for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {topForChart.map((b) => (
                  <Line
                    key={b.id}
                    type="monotone"
                    dataKey={b.id}
                    name={b.name}
                    stroke={b.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Per banner table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Banner</th>
                <th className="text-right py-2 px-3 font-medium">Impressions</th>
                <th className="text-right py-2 px-3 font-medium">Clicks</th>
                <th className="text-right py-2 pl-3 font-medium">CTR</th>
              </tr>
            </thead>
            <tbody>
              {perBanner.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No banners.</td></tr>
              )}
              {perBanner.map((b) => (
                <tr key={b.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                      <span className="truncate">{b.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 tabular-nums">{b.impressions.toLocaleString()}</td>
                  <td className="text-right py-2 px-3 tabular-nums">{b.clicks.toLocaleString()}</td>
                  <td className="text-right py-2 pl-3 tabular-nums font-medium">
                    {b.impressions > 0 ? `${b.ctr.toFixed(2)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const Kpi = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg border border-border p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wider">
      {icon} {label}
    </div>
    <div className="mt-1 text-xl font-serif">{value}</div>
  </div>
);
