import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import erayaLogo from "@/assets/eraya-logo.png";
import { ShieldX } from "lucide-react";

const Loader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-ivory gap-4">
    <img src={erayaLogo} alt="Eraya" className="h-12 w-auto" />
    <span className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
  </div>
);

const AccessDenied = ({ message }: { message: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-ivory gap-4 px-6">
    <img src={erayaLogo} alt="Eraya" className="h-12 w-auto" />
    <ShieldX className="h-10 w-10 text-red-500 mt-4" />
    <h1 className="font-serif text-xl text-charcoal text-center">Access Denied</h1>
    <p className="text-sm text-muted-foreground text-center max-w-xs">{message}</p>
    <a href="/" className="mt-4 text-sm text-gold hover:underline">← Back to home</a>
  </div>
);

/**
 * RoleGuard
 *  - require="admin": admin OR manager may view; non-staff redirect to "/".
 *  - require="adminOnly": only admin may view (managers redirected to /admin).
 *  - require="public": anyone — but staff in admin-mode are redirected to /admin.
 *  - require="authed": any signed-in user.
 */
export const RoleGuard = ({
  require,
  children,
}: {
  require: "admin" | "adminOnly" | "public" | "authed";
  children: React.ReactNode;
}) => {
  const { user, profile, isAdmin, isStaff, currentMode, loading, roleChecked } = useAuth();
  const location = useLocation();

  if (loading || (user && !roleChecked)) return <Loader />;

  // Universal: signed-in users with incomplete profiles must finish onboarding.
  if (
    user &&
    profile &&
    !profile.profile_complete &&
    location.pathname !== "/complete-profile" &&
    location.pathname !== "/auth/callback"
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (require === "authed") {
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return <>{children}</>;
  }

  if (require === "admin") {
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (!isStaff)
      return (
        <AccessDenied message="You do not have permission to access the admin panel. Admin or manager privileges are required." />
      );
    return <>{children}</>;
  }

  if (require === "adminOnly") {
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (!isAdmin) return <AccessDenied message="This area is restricted to administrators only." />;
    return <>{children}</>;
  }

  // public — staff browsing in admin mode get redirected to /admin
  if (user && isStaff && currentMode === "admin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default RoleGuard;
