import { Link } from "react-router-dom";
import { useCategories } from "@/lib/queries";

const CategoryRow = () => {
  const { data: categories = [] } = useCategories();
  const visible = categories.filter((c) => c.is_visible);
  if (!visible.length) return null;

  return (
    <section className="w-full px-6 mb-16">
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">Shop by Category</h2>
      <div className="flex md:grid gap-3 md:gap-4 lg:gap-5 md:grid-cols-6 lg:grid-cols-8 overflow-x-auto md:overflow-visible pb-2 -mx-6 px-6 md:mx-0 md:px-0 snap-x">
        {visible.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className="flex-shrink-0 w-[22vw] max-w-[110px] md:w-auto md:max-w-none snap-start group"
          >
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
