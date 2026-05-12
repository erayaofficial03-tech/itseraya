import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import erayaLogo from "@/assets/eraya-logo.png";

const Loader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-ivory gap-4">
    <img src={erayaLogo} alt="Eraya" className="h-12 w-auto" />
    <span className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
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
    if (!isStaff) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  if (require === "adminOnly") {
    if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    if (!isAdmin) return <Navigate to="/admin" replace />;
    return <>{children}</>;
  }

  // public
  if (user && isStaff) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default RoleGuard;
