import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";
import { useSettings, useCategories } from "@/lib/queries";

const Header = () => {
  const { data: settings } = useSettings();
  const { data: categories = [] } = useCategories();
  const [open, setOpen] = useState(false);
  const logo = settings?.logo_url || erayaLogo;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? "text-gold" : "text-foreground hover:text-gold"
    }`;

  return (
    <header className="w-full sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden lg:flex space-x-6">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          {categories.filter((c) => c.is_visible).slice(0, 5).map((c) => (
            <NavLink key={c.id} to={`/category/${c.slug}`} className={navLinkClass}>
              {c.name}
            </NavLink>
          ))}
          <NavLink to="/catalogue" className={navLinkClass}>Catalogue</NavLink>
        </nav>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} alt={settings?.store_name || "Eraya"} className="h-10 w-auto" />
        </Link>

        <div className="w-10" />
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-6 py-4 space-y-3">
            <NavLink to="/" end onClick={() => setOpen(false)} className="block py-1">Home</NavLink>
            {categories.filter((c) => c.is_visible).map((c) => (
              <NavLink key={c.id} to={`/category/${c.slug}`} onClick={() => setOpen(false)} className="block py-1">
                {c.name}
              </NavLink>
            ))}
            <NavLink to="/catalogue" onClick={() => setOpen(false)} className="block py-1">Catalogue</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
