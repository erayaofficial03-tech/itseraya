import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/hooks/useAuth";

interface Props {
  productId: string;
  productName?: string;
  userId: string;
  userProfile: Profile | null;
  onSubmitted: () => void;
}

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const ReviewForm = ({ productId, productName, userId, userProfile, onSubmitted }: Props) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState(userProfile?.full_name || "");
  const [city, setCity] = useState(userProfile?.city || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a star rating");
    if (text.trim().length < 10) return toast.error("Review must be at least 10 characters");
    if (!name.trim()) return toast.error("Please enter your name");

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      product_name: productName ?? null,
      reviewer_user_id: userId,
      customer_name: name.trim(),
      customer_city: city.trim() || null,
      rating,
      review_text: text.trim(),
      is_approved: false,
      is_hidden: false,
      is_fake: false,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit review");
      return;
    }
    setSubmitted(true);
    onSubmitted();
    toast.success("Review submitted! It will appear after approval 💛");
  };

  if (submitted) {
    return (
      <div className="mt-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE8E1] text-center">
        <p className="text-2xl mb-2">💛</p>
        <p className="text-sm font-semibold">Thank you for your review!</p>
        <p className="text-xs text-[#9A8F85] mt-1">It will appear after approval.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE8E1]">
      <h3 className="font-serif text-base font-semibold mb-4">Write a Review</h3>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="text-3xl leading-none transition-transform hover:scale-110"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <span className={star <= (hoverRating || rating) ? "text-[#C9A84C]" : "text-[#EDE8E1]"}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-[#9A8F85] ml-2">{ratingLabels[rating]}</span>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience with this piece..."
        rows={3}
        maxLength={1000}
        className="w-full text-sm border border-[#EDE8E1] rounded-xl p-3 bg-white resize-none focus:outline-none focus:border-[#C9A84C]"
      />

      <div className="grid grid-cols-2 gap-2 mt-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name *"
          maxLength={100}
          className="text-sm border border-[#EDE8E1] rounded-xl p-3 bg-white focus:outline-none focus:border-[#C9A84C]"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Your city"
          maxLength={80}
          className="text-sm border border-[#EDE8E1] rounded-xl p-3 bg-white focus:outline-none focus:border-[#C9A84C]"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-3 py-3 rounded-full bg-[#C9A84C] text-white text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

export default ReviewForm;
