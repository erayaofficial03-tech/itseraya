interface Props {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const StarRating = ({ rating, count, size = "sm", showCount = true }: Props) => {
  if (!rating || rating === 0) return null;

  const sizes = {
    sm: { star: "text-[11px]", text: "text-[10px]" },
    md: { star: "text-sm", text: "text-xs" },
    lg: { star: "text-lg", text: "text-sm" },
  };

  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 leading-none">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`f${i}`} className={`${sizes[size].star} text-[#C9A84C]`}>★</span>
        ))}
        {hasHalf && <span className={`${sizes[size].star} text-[#C9A84C]`}>★</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`e${i}`} className={`${sizes[size].star} text-[#EDE8E1]`}>★</span>
        ))}
      </div>
      {showCount && count !== undefined && count > 0 && (
        <span className={`${sizes[size].text} text-[#9A8F85]`}>({count})</span>
      )}
    </div>
  );
};

export default StarRating;
