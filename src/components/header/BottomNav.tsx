import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Heart, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/queries";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

const itemBase =
  "flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[9px] font-medium tracking-wide transition-colors";

const BottomNav = () => {
  const { data: settings } = useSettings();
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/auth/")) return null;
  if (pathname.startsWith("/reset-password")) return null;

  const handleWa = () => {
    const wa = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!wa) {
      toast.info("WhatsApp number not set yet.");
      return;
    }
    openWhatsApp(wa, "Hi Eraya! I'd love some help.");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${itemBase} ${isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        borderTopColor: "#EDE8E1",
      }}
    >
      <div className="flex items-stretch h-16">
        <NavLink to="/" end className={linkClass}>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/catalogue" className={linkClass}>
          <LayoutGrid className="h-5 w-5" />
          <span>Catalogue</span>
        </NavLink>
        <NavLink to="/wishlist" className={linkClass}>
          <Heart className="h-5 w-5" />
          <span>Wishlist</span>
        </NavLink>
        <button onClick={handleWa} className={`${itemBase} text-muted-foreground hover:text-foreground`}>
          <MessageCircle className="h-5 w-5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
