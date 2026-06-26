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
    <SkeletonBlock className="aspect-[4/5] w-full rounded-none" />
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

export const OrderCardSkeleton = () => (
  <div className="rounded-2xl border border-[#EDE8E1] p-4 space-y-3 animate-pulse">
    <div className="flex justify-between items-center">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-6 w-20 rounded-full" />
    </div>
    <div className="flex gap-2">
      {[1,2,3].map(i => <SkeletonBlock key={i} className="h-12 w-12 rounded-lg" />)}
    </div>
    <div className="flex justify-between">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-9 w-28 rounded-full" />
    </div>
  </div>
);

export const CustomerRowSkeleton = () => (
  <div className="flex items-center gap-3 p-4 border-b animate-pulse">
    <SkeletonBlock className="h-10 w-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="h-3 w-48" />
    </div>
    <SkeletonBlock className="h-6 w-16 rounded-full" />
  </div>
);

export const WishlistSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-3 p-4 animate-pulse">
    <div className="flex items-center gap-4 pb-4">
      <SkeletonBlock className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-3 w-48" />
      </div>
    </div>
    {[1,2,3,4,5].map(i => <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />)}
  </div>
);
