import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
