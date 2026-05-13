import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; href?: string };

interface Props {
  items: Crumb[];
  /** Hide on small screens; default true */
  hideOnMobile?: boolean;
}

const Breadcrumb = ({ items, hideOnMobile = true }: Props) => {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`${hideOnMobile ? "hidden md:flex" : "flex"} items-center gap-1.5 text-xs text-muted-foreground`}
    >
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {c.href && !last ? (
              <Link to={c.href} className="hover:text-foreground transition-colors">
                {c.name}
              </Link>
            ) : (
              <span className={last ? "text-foreground" : ""}>{c.name}</span>
            )}
            {!last && <ChevronRight className="h-3 w-3 opacity-60" />}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
