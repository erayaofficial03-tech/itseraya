import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type LogRow = {
  id: string;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
};

const ActivityLogAdmin = () => {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin_activity_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_activity_log" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as LogRow[];
    },
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl">Admin Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Recent pricing and calculator changes by admins/managers (last 200 entries).
        </p>
      </div>

      <Card className="divide-y">
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && !rows.length && (
          <div className="p-4 text-sm text-muted-foreground">No activity yet.</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="p-4 grid sm:grid-cols-[140px_1fr_auto] gap-3 items-start">
            <div className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString()}
              <div className="opacity-70">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{r.entity}</Badge>
                <span className="font-medium">{r.action}</span>
                {r.entity_id && (
                  <span className="text-xs text-muted-foreground font-mono">
                    #{r.entity_id.slice(0, 8)}
                  </span>
                )}
              </div>
              {r.details && Object.keys(r.details).length > 0 && (
                <pre className="text-[11px] bg-muted/40 rounded p-2 overflow-x-auto">
                  {JSON.stringify(r.details, null, 2)}
                </pre>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {r.user_email ?? "unknown"}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default ActivityLogAdmin;
