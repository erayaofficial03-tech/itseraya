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
          (allApproved.reduce((a: number, r: any) => a + r.rating, 0) / allApproved.length) * 10
        ) / 10
      : 0;

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6 px-4">
          <span className="text-3xl font-bold text-[#C9A84C]">{avg.toFixed(1)}</span>
          <div>
            <StarRating rating={avg} size="md" showCount={false} />
            <p className="text-xs text-[#9A8F85]">Based on {allApproved.length} reviews</p>
          </div>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl px-4 mb-4">What customers say</h2>
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
          {reviews.map((r: any) => (
            <div
              key={r.id}
              className="snap-start flex-shrink-0 w-72 p-4 rounded-2xl border border-[#EDE8E1] bg-white"
            >
              <StarRating rating={r.rating} size="sm" showCount={false} />
              <p className="text-sm text-[#2C2C2C] mt-2 leading-relaxed line-clamp-5">
                {r.review_text}
              </p>
              <p className="text-sm font-semibold mt-3">{r.customer_name}</p>
              {r.customer_city && (
                <p className="text-xs text-[#9A8F85]">{r.customer_city}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
