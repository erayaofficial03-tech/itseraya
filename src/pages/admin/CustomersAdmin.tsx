import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type CustomerRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_blocked: boolean;
};

const PAGE_SIZE = 20;

const CustomersAdmin = () => {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
          Everyone who signed in with Google to enquire about a piece.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            All customers
            <Badge variant="outline">{rows.length}</Badge>
          </CardTitle>
          <CardDescription>Read-only list. Manage roles and blocks under Users.</CardDescription>
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
                  <li key={u.id} className="flex items-center gap-3 p-4">
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

export default CustomersAdmin;
