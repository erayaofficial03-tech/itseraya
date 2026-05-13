import { Link } from "react-router-dom";
import { useCategories, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const CategoryRow = () => {
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const visible = categories.filter((c) => c.is_visible);
  if (!s(settings, "section_categories_visible")) return null;
  if (!visible.length) return null;

  return (
    <section className="w-full px-4 md:px-6 mb-10 md:mb-16">
      <h2 className="font-serif text-[22px] md:text-3xl text-foreground mb-4 md:mb-6">
        {s(settings, "section_categories_title")}
      </h2>

      {/* Mobile: horizontal scroll of 80px circles */}
      <div
        className="md:hidden flex overflow-x-auto gap-4 pb-2 scrollbar-hide -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {visible.map((c, idx) => (
          <Link
            key={c.id}
            to={`/collection/${c.slug}`}
            className={`flex-shrink-0 flex flex-col items-center gap-2 w-20 group ${idx === visible.length - 1 ? "mr-4" : ""}`}
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="w-20 h-20 overflow-hidden rounded-full bg-muted/30 border-2 border-[#EDE8E1] group-hover:border-gold transition-all">
              <img
                src={c.image_url || ""}
                alt={c.name}
                loading="lazy" decoding="async" width={160} height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-center w-20 truncate group-hover:text-gold transition-colors">
              {c.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Tablet & desktop grid */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-5">
        {visible.map((c) => (
          <Link key={c.id} to={`/collection/${c.slug}`} className="group">
            <div className="aspect-square overflow-hidden rounded-full bg-muted/30 mb-2 border-2 border-transparent group-hover:border-gold transition-all">
              <img
                src={c.image_url || ""}
                alt={c.name}
                loading="lazy" decoding="async" width={400} height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="text-center font-serif text-base group-hover:text-gold transition-colors">
              {c.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryRow;
