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
 *  - require="public": only non-staff may view; staff redirect to "/admin".
 */
export const RoleGuard = ({
  require,
  children,
}: {
  require: "admin" | "adminOnly" | "public";
  children: React.ReactNode;
}) => {
  const { user, isAdmin, isStaff, loading, roleChecked } = useAuth();
  const location = useLocation();

  if (loading || (user && !roleChecked)) return <Loader />;

  if (require === "admin") {
    if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    if (!isStaff) return <AccessDenied message="You do not have permission to access the admin panel. Admin or manager privileges are required." />;
    return <>{children}</>;
  }

  if (require === "adminOnly") {
    if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    if (!isAdmin) return <AccessDenied message="This area is restricted to administrators only." />;
    return <>{children}</>;
  }

  // public
  if (user && isStaff) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default RoleGuard;
