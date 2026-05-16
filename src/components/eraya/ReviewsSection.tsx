import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "@/components/eraya/StarRating";

const ReviewsSection = () => {
  const { data: reviews = [] } = useQuery({
    queryKey: ["featured-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .eq("is_hidden", false)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(12);
      return data || [];
    },
  });

  const { data: allApproved = [] } = useQuery({
    queryKey: ["aggregate-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating")
        .eq("is_approved", true)
        .eq("is_hidden", false);
      return data || [];
    },
  });

  if (reviews.length === 0) return null;

  const avg =
    allApproved.length > 0
      ? Math.round(
          (allApproved.reduce((a: number, r: any) => a + r.rating, 0) /
            allApproved.length) *
            10,
        ) / 10
      : 0;

  return (
    <section id="reviews" className="w-full section-y bg-blush/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <span className="eyebrow">Wear your glow ✨</span>
          <h2 className="font-display text-3xl md:text-5xl mt-2 text-ink">
            What customers say
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="font-display text-4xl md:text-5xl text-champagne-deep leading-none">
              {avg.toFixed(1)}
            </span>
            <div className="flex flex-col items-start">
              <StarRating rating={avg} size="md" showCount={false} />
              <p className="text-xs text-ink-mute mt-0.5">
                Based on {allApproved.length} review{allApproved.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto px-1 pb-4 scrollbar-hide snap-x snap-mandatory">
          {reviews.map((r: any) => (
            <article
              key={r.id}
              className="snap-start shrink-0 w-[78%] sm:w-80 md:w-96 p-6 md:p-8 rounded-2xl bg-ivory border border-champagne/20 shadow-soft"
            >
              <StarRating rating={r.rating} size="sm" showCount={false} />
              <p className="font-display italic text-lg md:text-xl text-ink mt-4 leading-relaxed line-clamp-5">
                "{r.review_text}"
              </p>
              <div className="mt-5 pt-4 border-t border-champagne/15">
                <p className="font-body text-sm font-medium text-ink">
                  {r.customer_name}
                </p>
                {r.customer_city && (
                  <p className="text-xs text-ink-mute mt-0.5">{r.customer_city}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
