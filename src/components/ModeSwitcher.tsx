import { useLocation, useNavigate } from "react-router-dom";
import { Eye, Settings as Cog } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Floating mode-switcher button for admin/manager users.
 * Hidden on /admin/* routes (use sidebar entry instead) and on /login flows.
 */
const ModeSwitcher = () => {
  const { user, isStaff, currentMode, switchMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !isStaff) return null;
  const path = location.pathname;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/complete-profile") ||
    path.startsWith("/auth/")
  ) {
    return null;
  }

  const toAdmin = async () => {
    await switchMode("admin");
    navigate("/admin");
  };

  return (
    <button
      onClick={toAdmin}
      className="fixed top-20 right-4 z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gold shadow-md text-xs font-medium text-charcoal hover:bg-gold/10 transition-colors"
      aria-label="Switch to Admin Mode"
      title={`Currently in ${currentMode} mode`}
    >
      <Cog className="h-3.5 w-3.5 text-gold" />
      Admin Mode
    </button>
  );
};

export default ModeSwitcher;
