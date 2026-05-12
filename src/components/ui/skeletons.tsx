/**
 * Skeleton placeholders — animated pulse in ivory/gold theme.
 */

export const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-gradient-to-r from-ivory via-gold/10 to-ivory ${className}`}
  />
);

export const ProductCardSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBlock className="aspect-[4/5] w-full" />
    <SkeletonBlock className="h-3 w-3/4" />
    <SkeletonBlock className="h-3 w-1/3" />
  </div>
);

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="space-y-2">
    <SkeletonBlock className="aspect-square w-full rounded-full" />
    <SkeletonBlock className="h-3 w-2/3 mx-auto" />
  </div>
);

export const CategoryRowSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CategoryCardSkeleton key={i} />
    ))}
  </div>
);

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <span className="h-7 w-7 rounded-full border-2 border-gold border-t-transparent animate-spin" />
  </div>
);
