import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, FolderTree, MessageCircle, Users as UsersIcon, Search as SearchIcon, ExternalLink } from "lucide-react";
import { useProducts, useCategories, useSettings } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  WhatsAppClicksWidget, TopProductsWidget, BannerPerformanceWidget,
  EnquiryTrendWidget, ConversionFunnelWidget, InstallEventsWidget,
} from "./dashboard-widgets";

const GoLiveChecklist = () => {
  const { data: settings } = useSettings();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const [activeBanners, setActiveBanners] = useState(0);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("banners")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      setActiveBanners(count ?? 0);
    })();
  }, []);

  const s: any = settings || {};
  const checks = [
    { label: "Logo uploaded", done: !!s.logo_url, action: "/admin/brand", actionLabel: "Upload logo" },
    { label: "WhatsApp number set", done: !!s.whatsapp_number, action: "/admin/settings", actionLabel: "Add number" },
    { label: "UPI ID set for payments", done: !!s.upi_id, action: "/admin/settings", actionLabel: "Add UPI ID" },
    { label: "UPI QR code uploaded", done: !!s.upi_qr_url, action: "/admin/settings", actionLabel: "Upload QR" },
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
          <span className="text-xs text-muted-foreground">
            {doneCount} of {checks.length} completed
          </span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: "#C9A84C" }}
          />
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



const Stat = ({ icon: Icon, label, value, to }: { icon: any; label: string; value: string | number; to: string }) => (
  <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg">
    <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-gold/40 cursor-pointer h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-5 w-5 text-gold" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-serif">{value}</p>
      </CardContent>
    </Card>
  </Link>
);

type RecentUser = { id: string; email: string; full_name: string | null; avatar_url: string | null; created_at: string };

const Dashboard = () => {
  const { isAdmin, isManager, profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email || "User";
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const [userCount, setUserCount] = useState<number | string>("—");
  const [enquiryCount, setEnquiryCount] = useState<number | string>("—");
  const [recent, setRecent] = useState<RecentUser[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [{ count: uc }, { count: ec }, { data: r }, { data: pipe }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("enquiry_sessions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, email, full_name, avatar_url, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("enquiry_sessions").select("status").limit(2000),
      ]);
      setUserCount(uc ?? 0);
      setEnquiryCount(ec ?? 0);
      setRecent(r ?? []);
      const tally: Record<string, number> = {};
      (pipe || []).forEach((e: { status: string | null }) => {
        const k = e.status || "open";
        tally[k] = (tally[k] || 0) + 1;
      });
      setPipeline(tally);
    })();
  }, []);

  const PIPELINE_STAGES: { key: string; label: string; color: string }[] = [
    { key: "open", label: "Open", color: "bg-blue-500" },
    { key: "contacted", label: "Contacted", color: "bg-amber-500" },
    { key: "interested", label: "Interested", color: "bg-purple-500" },
    { key: "negotiation", label: "Negotiation", color: "bg-indigo-500" },
    { key: "followup_pending", label: "Follow-up", color: "bg-orange-500" },
    { key: "closed_won", label: "Won", color: "bg-emerald-500" },
    { key: "closed_lost", label: "Lost", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome Back {displayName}</p>
      </div>

      {isAdmin && <GoLiveChecklist />}




      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat icon={Gem} label="Products" value={products.length} to="/admin/products" />
        <Stat icon={FolderTree} label="Categories" value={categories.length} to="/admin/categories" />
        <Stat icon={MessageCircle} label="Enquiries" value={enquiryCount} to="/admin/enquiries" />
        <Stat icon={UsersIcon} label="Total Users" value={userCount} to="/admin/users" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Enquiry Pipeline</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs text-muted-foreground">{stage.label}</span>
                </div>
                <p className="text-2xl font-serif">{pipeline[stage.key] ?? 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <div>
              <p className="font-medium text-foreground mb-2">Next steps to appear on Google:</p>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                <li>Open Google Search Console</li>
                <li>Add property: <code className="text-xs">itseraya.in</code></li>
                <li>Verify ownership (HTML tag method)</li>
                <li>Submit sitemap: <code className="text-xs">itseraya.in/sitemap.xml</code></li>
                <li>Request indexing for the homepage</li>
              </ol>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-gold/40 text-gold hover:bg-gold/10"
              >
                Open Google Search Console <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted"
              >
                Open Sitemap <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted"
              >
                Open robots.txt <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Recent signups</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover border" />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.full_name || u.email.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{format(new Date(u.created_at), "dd MMM, HH:mm")}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
