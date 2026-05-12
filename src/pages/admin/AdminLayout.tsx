import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Gem, FolderTree, Image, Settings as SettingsIcon, LogOut, Menu, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import erayaLogo from "@/assets/eraya-logo.png";

const items = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Gem, label: "Products" },
  { to: "/admin/categories", icon: FolderTree, label: "Categories" },
  { to: "/admin/banner", icon: Image, label: "Banner & Homepage" },
  { to: "/admin/settings", icon: SettingsIcon, label: "Profile & Settings" },
  { to: "/admin/admins", icon: Users, label: "Users" },
];

const SidebarBody = ({ onNavigate, onSignOut }: { onNavigate?: () => void; onSignOut: () => void }) => (
  <div className="flex flex-col h-full">
    <div className="px-5 py-6 border-b border-border flex flex-col items-center gap-2 bg-gradient-to-b from-ivory/40 to-transparent">
      <img src={erayaLogo} alt="Eraya" className="h-10 w-auto" />
      <span className="h-px w-8 bg-gold/60" />
      <p className="text-[10px] font-medium tracking-[0.35em] uppercase text-muted-foreground">Admin</p>
    </div>
    <nav className="flex-1 p-3 space-y-1 overflow-auto">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? "text-charcoal" : "text-foreground hover:bg-muted"
            }`
          }
          style={({ isActive }) => (isActive ? { background: "hsl(var(--gold))" } : undefined)}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
    <div className="p-3 border-t border-border">
      <Button variant="ghost" className="w-full justify-start gap-2" onClick={onSignOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  </div>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = async () => { await supabase.auth.signOut(); navigate("/admin/login", { replace: true }); };
  const currentLabel = items.find((i) => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)))?.label || "Admin";

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 bg-background border-r border-border flex-col">
        <SidebarBody onSignOut={signOut} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-background border-b border-border grid grid-cols-[auto_1fr_auto] items-center h-14 px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarBody onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
            </SheetContent>
          </Sheet>
          <div className="flex flex-col items-center justify-center gap-1">
            <img src={erayaLogo} alt="Eraya" className="h-7 w-auto" />
            <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-muted-foreground leading-none">
              Admin
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground justify-self-end">
            {currentLabel}
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
