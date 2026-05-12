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
 * RoleGuard — strict role-based routing.
 *  - require="admin": only admins may view; non-admins redirect to "/".
 *  - require="public": only non-admins may view; admins redirect to "/admin".
 */
export const RoleGuard = ({
  require,
  children,
}: {
  require: "admin" | "public";
  children: React.ReactNode;
}) => {
  const { user, isAdmin, loading, roleChecked } = useAuth();
  const location = useLocation();

  if (loading || (user && !roleChecked)) return <Loader />;

  if (require === "admin") {
    if (!user) {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
    if (!isAdmin) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // public
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default RoleGuard;
