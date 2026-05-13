import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Ban, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

type AppRole = "admin" | "manager" | "customer";
type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_blocked: boolean;
  role: AppRole;
};

const ROLE_BADGE: Record<AppRole, string> = {
  admin: "bg-gold/20 text-charcoal border-gold/40",
  manager: "bg-blue-100 text-blue-800 border-blue-300",
  customer: "bg-muted text-muted-foreground border-border",
};

const UsersAdmin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "managers" | "customers" | "blocked">("all");
  
  const [confirmBlock, setConfirmBlock] = useState<UserRow | null>(null);
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Reset paging when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, tab]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;

      const roleMap = new Map<string, AppRole>();
      (roles ?? []).forEach((r: any) => {
        // Highest precedence: admin > manager > customer
        const cur = roleMap.get(r.user_id);
        const incoming = r.role as AppRole;
        const rank = (x?: AppRole) => (x === "admin" ? 3 : x === "manager" ? 2 : x === "customer" ? 1 : 0);
        if (rank(incoming) > rank(cur)) roleMap.set(r.user_id, incoming);
      });

      setUsers((profiles ?? []).map((p: any) => ({
        id: p.id, email: p.email, full_name: p.full_name, avatar_url: p.avatar_url,
        created_at: p.created_at, is_blocked: !!p.is_blocked,
        role: roleMap.get(p.id) ?? "customer",
      })));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const MASTER_EMAIL = "admin@itseraya.in";

  const updateRole = async (u: UserRow, next: AppRole) => {
    if (u.role === next) return;
    if (u.email === MASTER_EMAIL) {
      toast.error("The master admin role cannot be changed.");
      return;
    }
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", u.id);
    if (delErr) { toast.error(delErr.message); return; }
    const { error: insErr } = await supabase.from("user_roles").insert({ user_id: u.id, role: next });
    if (insErr) {
      toast.error(insErr.message);
      // restore previous role to keep DB + UI consistent
      await supabase.from("user_roles").insert({ user_id: u.id, role: u.role });
      return;
    }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
    toast.success(`${u.email} is now ${next}`);
  };


  const toggleBlock = async (u: UserRow) => {
    const next = !u.is_blocked;
    const { error } = await supabase.from("profiles").update({ is_blocked: next }).eq("id", u.id);
    if (error) { toast.error(error.message); setConfirmBlock(null); return; }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_blocked: next } : x)));
    toast.success(next ? "User blocked" : "User unblocked");
    setConfirmBlock(null);
  };


  const filtered = useMemo(() => {
    let list = users;
    if (tab === "managers") list = list.filter((u) => u.role === "manager");
    else if (tab === "customers") list = list.filter((u) => u.role === "customer");
    else if (tab === "blocked") list = list.filter((u) => u.is_blocked);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((u) => u.email.toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q));
    return list;
  }, [users, search, tab]);

  const counts = useMemo(() => ({
    all: users.length,
    managers: users.filter((u) => u.role === "manager").length,
    customers: users.filter((u) => u.role === "customer").length,
    blocked: users.filter((u) => u.is_blocked).length,
  }), [users]);


  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-serif text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Master admin <span className="font-medium">admin@itseraya.in</span> is permanent. You may have at most <span className="font-medium">1 additional Admin</span> and <span className="font-medium">1 Manager</span>. New signups always join as Customer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
          <CardDescription>Roles update both the profile record and the user_roles table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="pl-9" />
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="managers">Managers</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="blocked">Blocked</TabsTrigger>
              </TabsList>
            </Tabs>
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
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
                  <Skeleton className="h-9 w-32 hidden md:block" />
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Users appear here after they sign up with email or Google.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
              </p>
              <ul className="divide-y divide-border rounded-md border border-border">
                {filtered.slice(0, visibleCount).map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isMaster = u.email === MASTER_EMAIL;
                  const extraAdminTaken = users.some((x) => x.role === "admin" && x.email !== MASTER_EMAIL && x.id !== u.id);
                  const managerTaken = users.some((x) => x.role === "manager" && x.id !== u.id);
                  return (
                    <li key={u.id} className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
                        ) : (
                          <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate flex items-center gap-2">
                            {u.full_name || u.email.split("@")[0]}
                            {isMaster && <Badge variant="outline" className="bg-gold/20 text-charcoal border-gold/40">Master</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>

                      <Badge variant="outline" className={ROLE_BADGE[u.role]}>{u.role}</Badge>
                      <Badge variant="outline" className={u.is_blocked ? "bg-red-100 text-red-700 border-red-300" : "bg-green-100 text-green-700 border-green-300"}>
                        {u.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(u.created_at), "dd MMM yyyy")}</span>

                      <div className="flex items-center gap-2 justify-end">
                        {isMaster ? (
                          <span className="text-xs text-muted-foreground italic pr-2">Permanent</span>
                        ) : isSelf ? (
                          <span className="text-xs text-muted-foreground italic pr-2">You</span>
                        ) : (
                          <>
                            <Select value={u.role} onValueChange={(v) => updateRole(u, v as AppRole)}>
                              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin" disabled={extraAdminTaken && u.role !== "admin"}>
                                  admin{extraAdminTaken && u.role !== "admin" ? " (slot taken)" : ""}
                                </SelectItem>
                                <SelectItem value="manager" disabled={managerTaken && u.role !== "manager"}>
                                  manager{managerTaken && u.role !== "manager" ? " (slot taken)" : ""}
                                </SelectItem>
                                <SelectItem value="customer">customer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="icon" variant="outline" onClick={() => setConfirmBlock(u)} title={u.is_blocked ? "Unblock" : "Block"}>
                              {u.is_blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
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

      <AlertDialog open={!!confirmBlock} onOpenChange={(o) => !o && setConfirmBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBlock?.is_blocked ? "Unblock this user?" : "Block this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBlock?.is_blocked
                ? <>This will restore access for <strong>{confirmBlock?.email}</strong>.</>
                : <>This will prevent <strong>{confirmBlock?.email}</strong> from using their account until you unblock them.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmBlock && toggleBlock(confirmBlock)}>
              {confirmBlock?.is_blocked ? "Unblock" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersAdmin;
