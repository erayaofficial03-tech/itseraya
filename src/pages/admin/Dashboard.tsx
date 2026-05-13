import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, FolderTree, MessageCircle, Users as UsersIcon } from "lucide-react";
import { useProducts, useCategories } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  WhatsAppClicksWidget, TopProductsWidget, BannerPerformanceWidget,
  EnquiryTrendWidget, ConversionFunnelWidget,
} from "./dashboard-widgets";

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
      </div>

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
