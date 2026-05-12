import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Gem, FolderTree, Image, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import erayaLogo from "@/assets/eraya-logo.png";

const items = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Gem, label: "Products" },
  { to: "/admin/categories", icon: FolderTree, label: "Categories" },
  { to: "/admin/banner", icon: Image, label: "Banner & Homepage" },
  { to: "/admin/settings", icon: SettingsIcon, label: "Profile & Settings" },
];

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-serif text-2xl">Access denied</h1>
        <p className="text-muted-foreground">This account doesn't have admin privileges.</p>
        <Button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}>
          Sign out
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="w-64 bg-background border-r border-border flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={erayaLogo} alt="Eraya" className="h-9 w-auto" />
          <div>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-gold text-charcoal" : "text-foreground hover:bg-muted"
                }`
              }
              style={({ isActive }) => isActive ? { background: "hsl(var(--gold))" } : undefined}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
