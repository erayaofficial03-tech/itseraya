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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Ban, ShieldCheck, Trash2 } from "lucide-react";
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
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

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

  const updateRole = async (u: UserRow, next: AppRole) => {
    if (u.role === next) return;
    if (u.role === "admin" || next === "admin") {
      toast.error("The Admin role is reserved for admin@itseraya.in.");
      return;
    }
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", u.id).neq("role", "admin");
    if (delErr) { toast.error(delErr.message); return; }
    const { error: insErr } = await supabase.from("user_roles").insert({ user_id: u.id, role: next });
    if (insErr) { toast.error(insErr.message); return; }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
    toast.success(`${u.email} is now ${next}`);
  };

  const toggleBlock = async (u: UserRow) => {
    const next = !u.is_blocked;
    const { error } = await supabase.from("profiles").update({ is_blocked: next }).eq("id", u.id);
    if (error) { toast.error(error.message); return; }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_blocked: next } : x)));
    toast.success(next ? "User blocked" : "User unblocked");
  };

  const deleteUser = async (u: UserRow) => {
    const { error: rErr } = await supabase.from("user_roles").delete().eq("user_id", u.id);
    if (rErr) { toast.error(rErr.message); return; }
    const { error: pErr } = await supabase.from("profiles").delete().eq("id", u.id);
    if (pErr) { toast.error(pErr.message); return; }
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    toast.success("User removed");
    setConfirmDelete(null);
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-serif text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-assigned managers: <span className="font-medium">erayaofficial03@gmail.com</span>. Admin: <span className="font-medium">admin@itseraya.in</span>.
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
            <p className="text-sm text-muted-foreground py-12 text-center">Loading users…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Users appear here after their first Google login.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {filtered.map((u) => {
                const isSelf = currentUser?.id === u.id;
                const isAdminRow = u.role === "admin";
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
                        <p className="font-medium text-sm truncate">{u.full_name || u.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className={ROLE_BADGE[u.role]}>{u.role}</Badge>
                    <Badge variant="outline" className={u.is_blocked ? "bg-red-100 text-red-700 border-red-300" : "bg-green-100 text-green-700 border-green-300"}>
                      {u.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(u.created_at), "dd MMM yyyy")}</span>

                    <div className="flex items-center gap-2 justify-end">
                      {isSelf || isAdminRow ? (
                        <span className="text-xs text-muted-foreground italic pr-2">{isSelf ? "You" : "Reserved"}</span>
                      ) : (
                        <>
                          <Select value={u.role} onValueChange={(v) => updateRole(u, v as AppRole)}>
                            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">manager</SelectItem>
                              <SelectItem value="customer">customer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="outline" onClick={() => toggleBlock(u)} title={u.is_blocked ? "Unblock" : "Block"}>
                            {u.is_blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => setConfirmDelete(u)} title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{confirmDelete?.email}</strong> from profiles and roles. They can sign in again with Google to recreate their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && deleteUser(confirmDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersAdmin;
