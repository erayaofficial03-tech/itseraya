import { useNavigate, useLocation } from "react-router-dom";
import { Eye, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

/**
 * Slim banner shown to admins/managers while they browse the storefront.
 * Lets them jump back to the admin dashboard with one tap.
 * Hidden on /admin/* and /login/auth pages.
 */
const AdminPreviewBanner = () => {
  const { isStaff, currentMode } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!isStaff || currentMode !== "customer") return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/auth/")) return null;

  return (
    <div className="sticky top-0 z-[55] flex items-center justify-between gap-2 border-b border-amber-300 bg-amber-50 px-3 py-1.5 text-[12px] text-amber-900 sm:text-xs">
      <span className="flex items-center gap-1.5 truncate">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate"><strong>Preview mode</strong> — viewing as a customer</span>
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1 px-2 text-amber-900 hover:bg-amber-100"
        onClick={() => navigate("/admin")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Admin
      </Button>
    </div>
  );
};

export default AdminPreviewBanner;
