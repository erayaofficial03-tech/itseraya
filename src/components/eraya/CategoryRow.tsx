import { Link } from "react-router-dom";
import { useCategories, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

/**
 * Editorial category tiles — rounded rectangles, 4:5 portrait crop,
 * soft shadow on hover, label below in Cormorant.
 */
const CategoryRow = () => {
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const visible = categories.filter((c) => c.is_visible);
  if (!s(settings, "section_categories_visible")) return null;
  if (!visible.length) return null;

  return (
    <section className="w-full section-y">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <span className="eyebrow">Shop by edit</span>
            <h2 className="font-display text-3xl md:text-5xl mt-2 text-ink">
              {s(settings, "section_categories_title")}
            </h2>
          </div>
        </div>

        {/* Mobile: horizontal snap rail */}
        <div
          className="md:hidden flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory"
        >
          {visible.map((c) => (
            <Link
              key={c.id}
              to={`/collection/${c.slug}`}
              className="group shrink-0 w-[140px] snap-start"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-warm lift-hover">
                <img
                  src={c.image_url || ""}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  width={280}
                  height={350}
                  className="img-soft-zoom absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
              </div>
              <p className="mt-3 font-display text-base text-ink text-center">
                {c.name}
              </p>
            </Link>
          ))}
        </div>

        {/* Tablet & desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {visible.map((c) => (
            <Link key={c.id} to={`/collection/${c.slug}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-warm lift-hover">
                <img
                  src={c.image_url || ""}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  width={500}
                  height={625}
                  className="img-soft-zoom absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="eyebrow text-ivory/80">Explore</span>
                </div>
              </div>
              <p className="mt-4 font-display text-xl text-ink text-center">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryRow;
