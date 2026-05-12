import { Link } from "react-router-dom";
import { useCategories } from "@/lib/queries";

const CategoryRow = () => {
  const { data: categories = [] } = useCategories();
  const visible = categories.filter((c) => c.is_visible);
  if (!visible.length) return null;

  return (
    <section className="w-full px-6 mb-16">
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
        Shop by Category
      </h2>

      {/* Mobile: 4.5-card horizontal peek scroller */}
      <div
        className="peek-row md:hidden -mx-6 px-6 pb-2"
        style={{ ["--peek" as string]: "4.5", ["--peek-gap" as string]: "0.75rem" }}
      >
        {visible.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className="group">
            <div className="aspect-square overflow-hidden rounded-full bg-muted/30 mb-2 border-2 border-transparent group-hover:border-gold transition-all">
              <img
                src={c.image_url || ""}
                alt={c.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="text-center font-serif text-sm group-hover:text-gold transition-colors truncate">
              {c.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Tablet & desktop: 6 / 8 column grid */}
      <div className="hidden md:grid md:grid-cols-6 lg:grid-cols-8 gap-4 lg:gap-5">
        {visible.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className="group">
            <div className="aspect-square overflow-hidden rounded-full bg-muted/30 mb-2 border-2 border-transparent group-hover:border-gold transition-all">
              <img
                src={c.image_url || ""}
                alt={c.name}
                loading="lazy"
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
