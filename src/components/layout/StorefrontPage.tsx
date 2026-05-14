import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps every storefront page so its content clears the fixed mobile
 * BottomNav (h-16 = 64px) + the iOS home-indicator safe area.
 * Desktop (md+) gets no extra padding because BottomNav is hidden there.
 *
 * Usage:
 *   <StorefrontPage>...</StorefrontPage>
 *   <StorefrontPage as="main" className="bg-ivory">...</StorefrontPage>
 */
const StorefrontPage = ({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) => (
  <Tag
    className={cn(
      "pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0",
      className
    )}
  >
    {children}
  </Tag>
);

export default StorefrontPage;
