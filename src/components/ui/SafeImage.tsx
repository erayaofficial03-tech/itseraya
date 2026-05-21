import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> & {
  src: string | undefined | null;
  fallbackSrc?: string;
  /** Number of retry attempts before giving up and using fallback. Default 1. */
  maxRetries?: number;
  /** Show a champagne shimmer placeholder until the image decodes. */
  shimmer?: boolean;
};

/**
 * Resilient product image:
 *  - Reserves space (no layout shift) — caller provides aspect-ratio wrapper
 *  - Shimmer + fade-in while loading
 *  - Retries with cache-bust on iOS Safari intermittent failures
 *  - Falls back to a neutral placeholder on hard error
 */
const SafeImage = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  maxRetries = 1,
  className,
  alt = "",
  loading = "lazy",
  decoding = "async",
  shimmer = true,
  onLoad,
  ...rest
}: Props) => {
  const initial = src || fallbackSrc;
  const [current, setCurrent] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const retries = useRef(0);

  useEffect(() => {
    retries.current = 0;
    setLoaded(false);
    setCurrent(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <>
      {shimmer && !loaded && (
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(110deg,#f4efe6_8%,#faf6ec_18%,#f4efe6_33%)] bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite]"
          style={{ animationName: "shimmer" }}
        />
      )}
      <img
        {...rest}
        src={current}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cn(
          "transition-opacity duration-500 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onError={() => {
          if (retries.current < maxRetries && src) {
            retries.current += 1;
            const sep = src.includes("?") ? "&" : "?";
            setCurrent(`${src}${sep}_r=${Date.now()}`);
            return;
          }
          if (current !== fallbackSrc) {
            setCurrent(fallbackSrc);
          } else {
            // Even fallback failed — reveal the (broken) img so layout settles.
            setLoaded(true);
          }
        }}
      />
    </>
  );
};

export default SafeImage;
