import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageEditorSheet from "./ImageEditorSheet";

interface Props {
  bucket: string;
  pathPrefix?: string;
  aspectRatio?: number;
  accept?: string;
  disabled?: boolean;
  /** Called with the resulting public URL after upload. */
  onUploaded: (publicUrl: string, path: string) => void;
  /** Custom trigger. Defaults to a styled file picker button. */
  children?: ReactNode;
  className?: string;
}

const ImageUploadWithEditor = ({
  bucket,
  pathPrefix = "",
  aspectRatio,
  accept = "image/*",
  disabled,
  onUploaded,
  children,
  className,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOpen(true);
    // Allow re-selecting the same file later
    e.target.value = "";
  };

  const handleConfirm = async (blob: Blob, filename: string) => {
    setOpen(false);
    setUploading(true);
    try {
      const prefix = pathPrefix.replace(/^\/+|\/+$/g, "");
      const path = `${prefix ? `${prefix}/` : ""}${Date.now()}-${filename}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType: "image/webp", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(data.publicUrl, path);
      toast.success("Image uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled || uploading}
      />
      <div className={className} onClick={disabled || uploading ? undefined : pick} role="button">
        {children ?? (
          <button
            type="button"
            disabled={disabled || uploading}
            className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        )}
      </div>
      <ImageEditorSheet
        file={file}
        open={open}
        onConfirm={handleConfirm}
        onCancel={() => { setOpen(false); setFile(null); }}
        aspectRatio={aspectRatio}
      />
    </>
  );
};

export default ImageUploadWithEditor;
