import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Diamond, Tag, Tags, Megaphone, Image, Star, Monitor, Palette, Type,
  Search, FileText, MessageSquare, Users, UserCog, Settings as SettingsIcon,
  LogOut, Menu, Eye, Calculator, History, Package, Globe,
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
  { label: "Orders",            path: "/admin/orders",       icon: Package,         roles: ["admin","manager"] },
  { label: "Products",          path: "/admin/products",     icon: Diamond,         roles: ["admin","manager"] },
  { label: "Categories",        path: "/admin/categories",   icon: Tag,             roles: ["admin","manager"] },
  { label: "Product Tags",      path: "/admin/tags",         icon: Tags,            roles: ["admin"] },
  { label: "Announcements",     path: "/admin/announcement", icon: Megaphone,       roles: ["admin","manager"] },
  { label: "Banners",           path: "/admin/banners",      icon: Image,           roles: ["admin","manager"] },
  { label: "USPs & Reviews",    path: "/admin/usps",         icon: Star,            roles: ["admin","manager"] },
  { label: "Homepage Sections", path: "/admin/sections",     icon: Monitor,         roles: ["admin","manager"] },
  { label: "Homepage Titles",   path: "/admin/banner",       icon: Type,            roles: ["admin","manager"] },
  { label: "Brand & Colors",    path: "/admin/brand",        icon: Palette,         roles: ["admin"] },
  { label: "Labels & Text",     path: "/admin/labels",       icon: Type,            roles: ["admin"] },
  { label: "SEO & Meta",        path: "/admin/seo",          icon: Search,          roles: ["admin"] },
  { label: "Policies",          path: "/admin/policies",     icon: FileText,        roles: ["admin"] },
  { label: "Enquiries",         path: "/admin/enquiries",    icon: MessageSquare,   roles: ["admin","manager"] },
  { label: "Customers",         path: "/admin/customers",    icon: Users,           roles: ["admin","manager"] },
  { label: "Users",             path: "/admin/users",        icon: UserCog,         roles: ["admin"] },
  { label: "Pricing & Shipping",path: "/admin/pricing",      icon: Calculator,      roles: ["admin"] },
  { label: "Activity Log",      path: "/admin/activity",     icon: History,         roles: ["admin"] },
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
  <div className="flex flex-col h-full bg-[hsl(var(--ink))] text-[hsl(var(--ivory))]">
    {/* Brand block */}
    <div className="px-5 py-6 border-b border-[hsl(var(--ivory))]/10 flex flex-col items-center gap-2">
      <Link to="/admin" onClick={onNavigate} aria-label="Go to admin home" className="inline-flex">
        <BrandLogo className="h-10 w-auto" onDark />
      </Link>
      <span className="h-px w-10 bg-[hsl(var(--champagne))]/70" />
      <p className="text-[10px] font-medium tracking-[0.4em] uppercase text-[hsl(var(--champagne))]">Admin</p>
    </div>

    {/* Profile chip */}
    <Link
      to="/admin/profile"
      onClick={onNavigate}
      className="mx-3 mt-3 flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(var(--ivory))]/5 transition-colors"
    >
      <Avatar className="h-9 w-9 border border-[hsl(var(--champagne))]/60">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-[hsl(var(--ivory))]/10 text-[hsl(var(--ivory))] text-xs">
          {(profile?.full_name || userEmail || "U").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate text-[hsl(var(--ivory))]">{profile?.full_name || "My Profile"}</p>
        <p className="text-[11px] text-[hsl(var(--ivory))]/55 truncate">{userEmail}</p>
      </div>
    </Link>

    {/* Nav */}
    <nav className="flex-1 p-3 space-y-0.5 overflow-auto">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-[hsl(var(--ivory))]/10 text-[hsl(var(--champagne))]"
                : "text-[hsl(var(--ivory))]/75 hover:text-[hsl(var(--ivory))] hover:bg-[hsl(var(--ivory))]/5"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[hsl(var(--champagne))]"
                  aria-hidden
                />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Footer actions */}
    <div className="sticky bottom-0 shrink-0 mt-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[hsl(var(--ivory))]/10 space-y-1 bg-[hsl(var(--ink))]">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 bg-transparent border-[hsl(var(--champagne))]/40 text-[hsl(var(--ivory))] hover:bg-[hsl(var(--champagne))]/10 hover:text-[hsl(var(--champagne))]"
        onClick={() => { onSwitchToCustomer(); onNavigate?.(); }}
      >
        <Eye className="h-4 w-4" /> Switch to Customer View
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-[hsl(var(--ivory))]/70 hover:text-[hsl(var(--ivory))] hover:bg-[hsl(var(--ivory))]/5"
          >
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
  const switchToCustomer = () => {
    void switchMode("customer").catch(() => {});
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-[hsl(var(--ink))]/10">
        <SidebarBody
          visibleItems={visibleItems}
          onSignOut={signOut}
          onSwitchToCustomer={switchToCustomer}
          profile={profile}
          userEmail={user?.email}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar — matches storefront dark header */}
        <header className="md:hidden sticky top-0 z-30 bg-[hsl(var(--ink))] text-[hsl(var(--ivory))] border-b border-[hsl(var(--champagne))]/20 grid grid-cols-[auto_1fr_auto] items-center h-14 px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="text-[hsl(var(--ivory))] hover:bg-[hsl(var(--ivory))]/10 hover:text-[hsl(var(--ivory))]"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-[hsl(var(--ink))] border-r border-[hsl(var(--ivory))]/10">
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
          <Link to="/admin" aria-label="Go to admin home" className="flex flex-col items-center justify-center gap-0.5">
            <BrandLogo className="h-7 w-auto" onDark />
            <span className="text-[9px] font-medium tracking-[0.35em] uppercase text-[hsl(var(--champagne))] leading-none">
              Admin
            </span>
          </Link>
          <div className="w-10 h-10" aria-hidden />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
