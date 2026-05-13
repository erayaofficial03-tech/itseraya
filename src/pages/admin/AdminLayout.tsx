import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Diamond, Tag, Megaphone, Image, Star, Monitor, Palette, Type,
  Search, FileText, MessageSquare, Users, UserCog, Settings as SettingsIcon,
  LogOut, Menu, Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";

type NavRole = "admin" | "manager";
const navItems: { label: string; path: string; end?: boolean; icon: any; roles: NavRole[] }[] = [
  { label: "Dashboard",         path: "/admin",              end: true, icon: LayoutDashboard, roles: ["admin","manager"] },
  { label: "Products",          path: "/admin/products",     icon: Diamond,         roles: ["admin","manager"] },
  { label: "Categories",        path: "/admin/categories",   icon: Tag,             roles: ["admin","manager"] },
  { label: "Announcements",     path: "/admin/announcement", icon: Megaphone,       roles: ["admin","manager"] },
  { label: "Banners",           path: "/admin/banners",      icon: Image,           roles: ["admin","manager"] },
  { label: "USPs & Reviews",    path: "/admin/usps",         icon: Star,            roles: ["admin","manager"] },
  { label: "Homepage Sections", path: "/admin/banner",       icon: Monitor,         roles: ["admin","manager"] },
  { label: "Brand & Colors",    path: "/admin/brand",        icon: Palette,         roles: ["admin"] },
  { label: "Labels & Text",     path: "/admin/labels",       icon: Type,            roles: ["admin"] },
  { label: "SEO & Meta",        path: "/admin/seo",          icon: Search,          roles: ["admin"] },
  { label: "Policies",          path: "/admin/policies",     icon: FileText,        roles: ["admin"] },
  { label: "Enquiries",         path: "/admin/enquiries",    icon: MessageSquare,   roles: ["admin","manager"] },
  { label: "Customers",         path: "/admin/customers",    icon: Users,           roles: ["admin","manager"] },
  { label: "Users",             path: "/admin/users",        icon: UserCog,         roles: ["admin"] },
  { label: "Store Settings",    path: "/admin/settings",     icon: SettingsIcon,    roles: ["admin"] },
];

type NavItem = typeof navItems[number];

const SidebarBody = ({
  visibleItems,
  onNavigate,
  onSignOut,
  onSwitchToCustomer,
  profile,
  userEmail,
}: {
  visibleItems: NavItem[];
  onNavigate?: () => void;
  onSignOut: () => void;
  onSwitchToCustomer: () => void;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  userEmail?: string | null;
}) => (
  <div className="flex flex-col h-full">
    <div className="px-5 py-6 border-b border-border flex flex-col items-center gap-2 bg-gradient-to-b from-ivory/40 to-transparent">
      <Link to="/admin" onClick={onNavigate} aria-label="Go to admin home" className="inline-flex">
        <BrandLogo className="h-10 w-auto" />
      </Link>
      <span className="h-px w-8 bg-gold/60" />
      <p className="text-[10px] font-medium tracking-[0.35em] uppercase text-muted-foreground">Admin</p>
    </div>

    <Link
      to="/admin/profile"
      onClick={onNavigate}
      className="mx-3 mt-3 flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
    >
      <Avatar className="h-9 w-9 border border-gold">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-charcoal text-ivory text-xs">
          {(profile?.full_name || userEmail || "U").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{profile?.full_name || "My Profile"}</p>
        <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
      </div>
    </Link>

    <nav className="flex-1 p-3 space-y-1 overflow-auto">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
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
    <div className="p-3 border-t border-border space-y-1">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-gold/40 text-charcoal hover:bg-gold/10"
        onClick={() => { onSwitchToCustomer(); onNavigate?.(); }}
      >
        <Eye className="h-4 w-4" /> Switch to Customer View
      </Button>
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
  const { isAdmin, isManager, profile, user, switchMode } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((i) => {
    if (isAdmin) return true;
    if (isManager) return i.roles.includes("manager");
    return false;
  });

  const qc = useQueryClient();
  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate("/login", { replace: true });
  };
  const switchToCustomer = async () => {
    await switchMode("customer");
    navigate("/", { replace: true });
  };
  const currentLabel = visibleItems.find((i) => (i.end ? location.pathname === i.path : location.pathname.startsWith(i.path)))?.label || "Admin";

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 bg-background border-r border-border flex-col">
        <SidebarBody
          visibleItems={visibleItems}
          onSignOut={signOut}
          onSwitchToCustomer={switchToCustomer}
          profile={profile}
          userEmail={user?.email}
        />
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
              <SidebarBody
                visibleItems={visibleItems}
                onNavigate={() => setMobileOpen(false)}
                onSignOut={signOut}
                onSwitchToCustomer={switchToCustomer}
                profile={profile}
                userEmail={user?.email}
              />
            </SheetContent>
          </Sheet>
          <Link to="/admin" aria-label="Go to admin home" className="flex flex-col items-center justify-center gap-1">
            <BrandLogo className="h-7 w-auto" />
            <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-muted-foreground leading-none">
              Admin
            </span>
          </Link>
          <div className="w-10 h-10" aria-hidden />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
