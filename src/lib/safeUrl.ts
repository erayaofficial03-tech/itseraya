/**
 * Returns a safe URL string, or "#" if the input is unsafe.
 * Allows http(s)://, mailto:, tel:, and relative paths starting with "/".
 * Blocks javascript:, data:, vbscript:, and other dangerous schemes.
 */
export const safeUrl = (url: string | null | undefined): string => {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (!trimmed) return "#";
  // Allow relative paths and hash links
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) {
    return trimmed;
  }
  // Allow safe absolute schemes only
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return "#";
};

export const isSafeUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const trimmed = String(url).trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    /^(https?:|mailto:|tel:)/i.test(trimmed)
  );
};
