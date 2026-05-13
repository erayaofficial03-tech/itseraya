import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Gem, FolderTree, Image, Settings as SettingsIcon, LogOut, Menu,
  Users, Inbox, Megaphone, Palette, Type, Search, UserRound, Images, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";

type ItemRole = "staff" | "admin";
const items: { to: string; end?: boolean; icon: any; label: string; role: ItemRole }[] = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard", role: "staff" },
  { to: "/admin/products", icon: Gem, label: "Products", role: "staff" },
  { to: "/admin/categories", icon: FolderTree, label: "Categories", role: "staff" },
  { to: "/admin/announcement", icon: Megaphone, label: "Announcement", role: "staff" },
  { to: "/admin/banner", icon: Image, label: "Homepage & Banner", role: "staff" },
  { to: "/admin/banners", icon: Images, label: "Banners", role: "staff" },
  { to: "/admin/brand", icon: Palette, label: "Brand & Colors", role: "admin" },
  { to: "/admin/labels", icon: Type, label: "Labels & Text", role: "admin" },
  { to: "/admin/seo", icon: Search, label: "SEO & Meta", role: "admin" },
  { to: "/admin/policies", icon: FileText, label: "Policies", role: "admin" },
  { to: "/admin/enquiries", icon: Inbox, label: "Enquiries", role: "staff" },
  { to: "/admin/customers", icon: UserRound, label: "Customers", role: "staff" },
  { to: "/admin/users", icon: Users, label: "Users", role: "admin" },
  { to: "/admin/settings", icon: SettingsIcon, label: "Store Settings", role: "admin" },
];

const SidebarBody = ({ visibleItems, onNavigate, onSignOut }: { visibleItems: typeof items; onNavigate?: () => void; onSignOut: () => void }) => (
  <div className="flex flex-col h-full">
    <div className="px-5 py-6 border-b border-border flex flex-col items-center gap-2 bg-gradient-to-b from-ivory/40 to-transparent">
      <BrandLogo className="h-10 w-auto" onDark />
      <span className="h-px w-8 bg-gold/60" />
      <p className="text-[10px] font-medium tracking-[0.35em] uppercase text-muted-foreground">Admin</p>
    </div>
    <nav className="flex-1 p-3 space-y-1 overflow-auto">
      {visibleItems.map((item) => (
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of Eraya Admin?</AlertDialogTitle>
            <AlertDialogDescription>You'll need to sign in again to access the admin panel.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = items.filter((i) => (i.role === "admin" ? isAdmin : true));

  const qc = useQueryClient();
  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate("/admin/login", { replace: true });
  };
  const currentLabel = visibleItems.find((i) => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)))?.label || "Admin";

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 bg-background border-r border-border flex-col">
        <SidebarBody visibleItems={visibleItems} onSignOut={signOut} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-background border-b border-border grid grid-cols-[auto_1fr_auto] items-center h-14 px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarBody visibleItems={visibleItems} onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
            </SheetContent>
          </Sheet>
          <div className="flex flex-col items-center justify-center gap-1">
            <BrandLogo className="h-7 w-auto" />
            <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-muted-foreground leading-none">
              Admin
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground justify-self-end truncate max-w-[40vw]">
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
