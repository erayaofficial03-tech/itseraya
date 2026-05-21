import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LowResolutionError,
  processProductImage,
  type VariantKey,
} from "./imageProcessing";

/** Generic upload (logos, banners, categories) — unchanged. */
export const uploadImage = async (file: File, bucket: string, folder = "") => {
  const ext = file.name.split(".").pop();
  const path = `${folder}${folder ? "/" : ""}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) {
    toast.error(`Upload failed: ${error.message}`);
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Production product image upload:
 *  - Validates min resolution (toasts a clear warning, never upscales)
 *  - Smart center-crops to 4:5
 *  - Generates & uploads 3 WEBP variants (thumb / md / full)
 *  - Returns the canonical `md` URL to store in DB; sibling variants are
 *    derived at render time via `deriveVariantUrls`.
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  let variants;
  try {
    variants = await processProductImage(file);
  } catch (err) {
    if (err instanceof LowResolutionError) {
      toast.error(err.message);
    } else {
      toast.error(`Could not process image: ${(err as Error).message}`);
    }
    throw err;
  }

  const id = crypto.randomUUID();
  const bucket = "product-images";
  const order: VariantKey[] = ["thumb", "md", "full"];

  const uploads = order.map(async (key) => {
    const path = `${id}/${key}.webp`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, variants[key], {
        upsert: false,
        contentType: "image/webp",
        cacheControl: "31536000, immutable",
      });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  });

  try {
    const [, mdUrl] = await Promise.all(uploads);
    return mdUrl;
  } catch (err) {
    toast.error(`Upload failed: ${(err as Error).message}`);
    throw err;
  }
};
