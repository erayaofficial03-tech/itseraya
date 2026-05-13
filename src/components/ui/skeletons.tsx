/**
 * Skeleton placeholders — animated pulse in ivory/gold theme.
 */

export const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-gradient-to-r from-ivory via-gold/10 to-ivory ${className}`}
  />
);

export const ProductCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-[#EDE8E1] shadow-sm">
    <SkeletonBlock className="aspect-square w-full rounded-none" />
    <div className="px-3 pt-2 pb-3 space-y-2">
      <SkeletonBlock className="h-2 w-1/3" />
      <SkeletonBlock className="h-3 w-3/4" />
      <SkeletonBlock className="h-3 w-1/3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/** Mimics a single ProductRow (heading + responsive grid/scroll). */
export const ProductRowSkeleton = ({ count = 6 }: { count?: number }) => (
  <section className="w-full mb-10 md:mb-16 px-4 md:px-6">
    <div className="flex justify-between items-end mb-4 md:mb-6">
      <SkeletonBlock className="h-6 md:h-8 w-40" />
      <SkeletonBlock className="h-3 w-16" />
    </div>
    {/* Mobile: 3-col grid */}
    <div className="md:hidden grid grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
    {/* Desktop: row */}
    <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </section>
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
