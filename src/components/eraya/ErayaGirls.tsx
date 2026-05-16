import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "@/components/eraya/StarRating";

type Review = {
  id: string;
  customer_name: string;
  customer_city: string | null;
  rating: number;
  review_text: string | null;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "♡";

/**
 * Instagram-story-style row of customer bubbles, pulled from approved reviews.
 * Falls back to elegant initial-avatars over a champagne gradient when no images exist.
 */
const ErayaGirls = () => {
  const { data: reviews = [] } = useQuery({
    queryKey: ["eraya-girls"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, customer_name, customer_city, rating, review_text")
        .eq("is_approved", true)
        .eq("is_hidden", false)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(12);
      return (data || []) as Review[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!reviews.length) return null;

  return (
    <section className="w-full section-y bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <span className="eyebrow">Loved by women everywhere</span>
          <h2 className="font-display text-3xl md:text-5xl mt-2 text-ink">
            ERAYA Girls <span className="text-champagne">✨</span>
          </h2>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="snap-start shrink-0 flex flex-col items-center text-center w-[88px] md:w-[110px]"
            >
              <div className="p-[2px] rounded-full bg-gradient-to-br from-champagne via-champagne-soft to-blush-deep">
                <div className="h-[78px] w-[78px] md:h-[100px] md:w-[100px] rounded-full bg-ivory flex items-center justify-center">
                  <span className="font-display text-2xl md:text-3xl text-champagne-deep tracking-wide">
                    {initials(r.customer_name)}
                  </span>
                </div>
              </div>
              <p className="mt-3 font-display text-sm md:text-base text-ink truncate w-full">
                {r.customer_name.split(" ")[0]}
              </p>
              <div className="mt-1 scale-75 origin-top">
                <StarRating rating={r.rating} size="sm" showCount={false} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ErayaGirls;
