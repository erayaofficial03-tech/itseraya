/**
 * Production-grade product image processor.
 *
 * - Validates minimum source resolution (no upscaling of low-quality uploads)
 * - Center-crops to fixed 4:5 aspect ratio (luxury editorial consistency)
 * - Generates three WEBP variants: thumb (300×375), md (800×1000), full (1600×2000)
 * - Returns sharp, compressed WEBP blobs ready for upload
 */

export const PRODUCT_ASPECT = 4 / 5; // width / height
export const VARIANTS = {
  thumb: { w: 300, h: 375, quality: 0.78 },
  md: { w: 800, h: 1000, quality: 0.85 },
  full: { w: 1600, h: 2000, quality: 0.9 },
} as const;

export type VariantKey = keyof typeof VARIANTS;

/** Minimum acceptable source — anything below this is too small for 4:5 luxury rendering. */
const MIN_SOURCE_WIDTH = 800;
const MIN_SOURCE_HEIGHT = 1000;

export class LowResolutionError extends Error {
  constructor(public actual: { w: number; h: number }) {
    super(
      `Please upload a higher resolution image for best quality. Minimum ${MIN_SOURCE_WIDTH}×${MIN_SOURCE_HEIGHT}px (you uploaded ${actual.w}×${actual.h}px).`,
    );
    this.name = "LowResolutionError";
  }
}

const loadBitmap = async (file: File): Promise<ImageBitmap> => {
  // createImageBitmap handles EXIF orientation automatically in modern browsers.
  return await createImageBitmap(file, { imageOrientation: "from-image" } as any).catch(
    async () => {
      // Fallback for older browsers
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
        });
        return await createImageBitmap(img);
      } finally {
        URL.revokeObjectURL(url);
      }
    },
  );
};

/**
 * Center-crop the source bitmap to a 4:5 region without distortion.
 * Returns the source rectangle to draw from.
 */
const centerCrop = (srcW: number, srcH: number) => {
  const srcRatio = srcW / srcH;
  let sx = 0,
    sy = 0,
    sw = srcW,
    sh = srcH;
  if (srcRatio > PRODUCT_ASPECT) {
    // Source is wider than 4:5 → crop sides
    sw = Math.round(srcH * PRODUCT_ASPECT);
    sx = Math.round((srcW - sw) / 2);
  } else if (srcRatio < PRODUCT_ASPECT) {
    // Source is taller than 4:5 → crop top/bottom equally
    sh = Math.round(srcW / PRODUCT_ASPECT);
    sy = Math.round((srcH - sh) / 2);
  }
  return { sx, sy, sw, sh };
};

const drawVariant = async (
  bitmap: ImageBitmap,
  crop: { sx: number; sy: number; sw: number; sh: number },
  targetW: number,
  targetH: number,
  quality: number,
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#f9f6f0"; // ivory backstop — matches product card surface
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(bitmap, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, targetW, targetH);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("WEBP encoding failed");
  return blob;
};

export type ProcessedVariants = Record<VariantKey, Blob>;

/**
 * Process an admin-uploaded product image into 3 WEBP variants at 4:5.
 * Throws LowResolutionError if the source is too small (prevents blurry upscale).
 */
export const processProductImage = async (file: File): Promise<ProcessedVariants> => {
  const bitmap = await loadBitmap(file);
  try {
    if (bitmap.width < MIN_SOURCE_WIDTH || bitmap.height < MIN_SOURCE_HEIGHT) {
      throw new LowResolutionError({ w: bitmap.width, h: bitmap.height });
    }
    const crop = centerCrop(bitmap.width, bitmap.height);
    const [thumb, md, full] = await Promise.all([
      drawVariant(bitmap, crop, VARIANTS.thumb.w, VARIANTS.thumb.h, VARIANTS.thumb.quality),
      drawVariant(bitmap, crop, VARIANTS.md.w, VARIANTS.md.h, VARIANTS.md.quality),
      drawVariant(bitmap, crop, VARIANTS.full.w, VARIANTS.full.h, VARIANTS.full.quality),
    ]);
    return { thumb, md, full };
  } finally {
    bitmap.close?.();
  }
};

/**
 * Derive sibling variant URLs from a canonical product image URL produced
 * by `uploadProductImage`. The canonical URL points to the "md" variant
 * and lives at `<uuid>/md.webp` inside the bucket — we can swap the suffix
 * to reach the thumb/full variants.
 *
 * For legacy (non-pipeline) URLs we just return the same URL for all sizes.
 */
export const deriveVariantUrls = (url: string): Record<VariantKey, string> => {
  if (!url) return { thumb: url, md: url, full: url };
  const match = url.match(/^(.*)\/(thumb|md|full)\.webp(\?.*)?$/);
  if (!match) return { thumb: url, md: url, full: url };
  const [, base, , qs = ""] = match;
  return {
    thumb: `${base}/thumb.webp${qs}`,
    md: `${base}/md.webp${qs}`,
    full: `${base}/full.webp${qs}`,
  };
};
