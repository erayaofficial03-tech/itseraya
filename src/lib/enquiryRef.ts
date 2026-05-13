/**
 * Generate a short, human-friendly enquiry reference like "ENQ-A4F7".
 * Uses crypto random bytes when available, base36 encoded.
 */
export const generateEnquiryRef = (): string => {
  const len = 4;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit ambiguous chars
  let out = "ENQ-";
  const bytes = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
};
