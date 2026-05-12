import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search } from "lucide-react";

type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  target_email: string | null;
  details: Record<string, any> | null;
};

const ACTION_LABEL: Record<string, string> = {
  role_change: "Role changed",
  user_blocked: "User blocked",
  user_unblocked: "User unblocked",
  user_deleted: "User deleted",
};

const ACTION_BADGE: Record<string, string> = {
  role_change: "bg-blue-100 text-blue-800 border-blue-300",
  user_blocked: "bg-red-100 text-red-700 border-red-300",
  user_unblocked: "bg-green-100 text-green-700 border-green-300",
  user_deleted: "bg-muted text-muted-foreground border-border",
};

const PAGE_SIZE = 25;

const AuditLogAdmin = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "role_change" | "user_blocked" | "user_unblocked" | "user_deleted">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, tab]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) toast.error(error.message);
      else setRows((data ?? []) as AuditRow[]);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (tab !== "all" && r.action !== tab) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.actor_email ?? "").toLowerCase().includes(q) ||
      (r.target_email ?? "").toLowerCase().includes(q) ||
      r.action.toLowerCase().includes(q)
    );
  });

  const formatDetails = (r: AuditRow) => {
    const d = r.details || {};
    if (r.action === "role_change" && d.from && d.to) return `${d.from} → ${d.to}`;
    if (Object.keys(d).length === 0) return "—";
    return JSON.stringify(d);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-serif text-3xl">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tracks admin actions like role changes, blocks, and deletes. Showing the last 500 events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Most recent first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by actor, target, or action" className="pl-9" />
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="role_change">Roles</TabsTrigger>
                <TabsTrigger value="user_blocked">Blocked</TabsTrigger>
                <TabsTrigger value="user_unblocked">Unblocked</TabsTrigger>
                <TabsTrigger value="user_deleted">Deleted</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No audit events yet.</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
              </p>
              <ul className="divide-y divide-border rounded-md border border-border">
                {filtered.slice(0, visibleCount).map((r) => (
                  <li key={r.id} className="p-4 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 md:items-center">
                    <Badge variant="outline" className={ACTION_BADGE[r.action] ?? ""}>
                      {ACTION_LABEL[r.action] ?? r.action}
                    </Badge>
                    <div className="min-w-0 text-sm">
                      <p className="truncate">
                        <span className="font-medium">{r.actor_email ?? "Unknown"}</span>
                        {r.target_email && (
                          <>
                            {" → "}
                            <span className="text-muted-foreground">{r.target_email}</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{formatDetails(r)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(r.created_at), "dd MMM yyyy, HH:mm")}
                    </span>
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
    </div>
  );
};

export default AuditLogAdmin;
