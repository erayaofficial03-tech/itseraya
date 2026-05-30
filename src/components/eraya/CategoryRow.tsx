import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { useCategories, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

/**
 * Editorial category tiles — rounded rectangles, 4:5 portrait crop,
 * soft shadow on hover, label below in Cormorant.
 */
const CategoryRow = () => {
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const visible = categories.filter((c) => c.is_visible);
  if (!s(settings, "section_categories_visible")) return null;
  if (!visible.length) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  const padX =
    "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] " +
    "md:pl-[max(2rem,env(safe-area-inset-left))] md:pr-[max(2rem,env(safe-area-inset-right))] " +
    "lg:pl-[max(2.5rem,env(safe-area-inset-left))] lg:pr-[max(2.5rem,env(safe-area-inset-right))]";

  const scrollPadX =
    "[scroll-padding-left:max(1rem,env(safe-area-inset-left))] [scroll-padding-right:max(1rem,env(safe-area-inset-right))] " +
    "md:[scroll-padding-left:max(2rem,env(safe-area-inset-left))] md:[scroll-padding-right:max(2rem,env(safe-area-inset-right))] " +
    "lg:[scroll-padding-left:max(2.5rem,env(safe-area-inset-left))] lg:[scroll-padding-right:max(2.5rem,env(safe-area-inset-right))]";

  return (
    <section className="w-full section-y">
      <div className={`flex items-end justify-between mb-6 md:mb-10 ${padX}`}>
        <div>
          <span className="eyebrow">Shop by edit</span>
          <h2 className="font-display text-[28px] md:text-4xl lg:text-5xl mt-1 text-ink">
            {s(settings, "section_categories_title")}
          </h2>
        </div>
      </div>

      {/* Horizontal scroll rail — all breakpoints */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex overflow-x-auto gap-3 md:gap-4 lg:gap-6 pb-2 scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain] scroll-smooth ${padX} ${scrollPadX}`}
      >
        {visible.map((c) => (
          <Link
            key={c.id}
            to={`/collection/${c.slug}`}
            className="group shrink-0 w-[140px] md:w-[180px] lg:w-[200px] snap-start"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-warm lift-hover">
              <img
                src={c.image_url || ""}
                alt={c.name}
                loading="lazy"
                decoding="async"
                width={400}
                height={500}
                className="img-soft-zoom absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                <span className="eyebrow text-ivory/80">Explore</span>
              </div>
            </div>
            <p className="mt-3 md:mt-4 font-display text-base md:text-xl text-ink text-center">
              {c.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Scroll progress indicator */}
      <div className={`mt-3 ${padX}`}>
        <div className="h-[2px] w-full bg-ivory-warm rounded-full overflow-hidden">
          <div
            className="h-full bg-ink/30 rounded-full transition-transform duration-150 ease-out origin-left"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>
    </section>
  );
};

export default CategoryRow;
