import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, ShieldCheck, User as UserIcon, Search } from "lucide-react";

type AppRole = "admin" | "manager" | "customer";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole;
};

const ROLE_META: Record<AppRole, { label: string; icon: typeof Shield; className: string }> = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    className: "bg-gold/20 text-charcoal border-gold/40",
  },
  manager: {
    label: "Manager",
    icon: Shield,
    className: "bg-primary/15 text-primary border-primary/30",
  },
  customer: {
    label: "Customer",
    icon: UserIcon,
    className: "bg-muted text-muted-foreground border-border",
  },
};

const AdminsAdmin = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;

      const roleMap = new Map<string, AppRole>();
      (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role as AppRole));

      const merged: UserRow[] = (profiles ?? []).map((p: any) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        role: roleMap.get(p.id) ?? "customer",
      }));
      setUsers(merged);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (user: UserRow, next: AppRole) => {
    if (user.role === next) return;
    if (user.role === "admin" || next === "admin") {
      toast.error("The Admin role is reserved for admin@itseraya.in.");
      return;
    }
    setUpdatingId(user.id);
    try {
      // Remove any existing non-admin roles, then insert the new one (unique on user+role)
      const { error: delErr } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .neq("role", "admin");
      if (delErr) throw delErr;

      const { error: insErr } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: next });
      if (insErr) throw insErr;

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: next } : u)));
      toast.success(`${user.email} is now ${ROLE_META[next].label}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update role");
      load();
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.full_name ?? "").toLowerCase().includes(q),
    );
  }, [users, search]);

  const counts = useMemo(() => {
    const c = { admin: 0, manager: 0, customer: 0 };
    users.forEach((u) => (c[u.role] += 1));
    return c;
  }, [users]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage every account that has signed in. Promote a Customer to Manager or revert at any time.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["admin", "manager", "customer"] as const).map((r) => {
          const Meta = ROLE_META[r];
          const Icon = Meta.icon;
          return (
            <Card key={r}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`h-9 w-9 rounded-full border flex items-center justify-center ${Meta.className}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{Meta.label}s</p>
                  <p className="font-serif text-2xl leading-none">{counts[r]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
          <CardDescription>
            Only <span className="font-medium">admin@itseraya.in</span> can hold the Admin role. Managers can be assigned to any other account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name"
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading users…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No users found.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {filtered.map((u) => {
                const Meta = ROLE_META[u.role];
                const Icon = Meta.icon;
                const isAdmin = u.role === "admin";
                return (
                  <li
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{u.full_name || u.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className={`gap-1 ${Meta.className} shrink-0`}>
                      <Icon className="h-3 w-3" /> {Meta.label}
                    </Badge>

                    <div className="shrink-0 sm:w-44">
                      {isAdmin ? (
                        <p className="text-xs text-muted-foreground italic">Reserved account</p>
                      ) : (
                        <Select
                          value={u.role}
                          disabled={updatingId === u.id}
                          onValueChange={(v) => updateRole(u, v as AppRole)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsAdmin;
