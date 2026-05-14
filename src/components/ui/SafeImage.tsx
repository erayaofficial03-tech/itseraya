import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> & {
  src: string | undefined | null;
  fallbackSrc?: string;
  /** Number of retry attempts before giving up and using fallback. Default 1. */
  maxRetries?: number;
};

/**
 * Resilient image: handles iOS Safari intermittent load failures by
 * retrying with a cache-busting query param, then falling back to a
 * placeholder. Does NOT set crossOrigin so it works with non-CORS hosts.
 */
const SafeImage = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  maxRetries = 1,
  className,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...rest
}: Props) => {
  const initial = src || fallbackSrc;
  const [current, setCurrent] = useState(initial);
  const retries = useRef(0);

  // Reset when the source prop changes (e.g. product swap)
  useEffect(() => {
    retries.current = 0;
    setCurrent(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={cn("bg-muted", className)}
      onError={() => {
        if (retries.current < maxRetries && src) {
          retries.current += 1;
          const sep = src.includes("?") ? "&" : "?";
          setCurrent(`${src}${sep}_r=${Date.now()}`);
          return;
        }
        if (current !== fallbackSrc) {
          setCurrent(fallbackSrc);
        }
      }}
    />
  );
};

export default SafeImage;
