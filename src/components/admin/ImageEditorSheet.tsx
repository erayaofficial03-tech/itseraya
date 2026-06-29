import { useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCw, RefreshCw } from "lucide-react";

interface Props {
  file: File | null;
  open: boolean;
  onConfirm: (blob: Blob, filename: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const DEFAULTS = { brightness: 100, contrast: 100, saturation: 100, sharpness: 100 };

const centerInitial = (mediaWidth: number, mediaHeight: number, aspect?: number): Crop => {
  if (!aspect) {
    return { unit: "%", x: 0, y: 0, width: 100, height: 100 };
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
};

/** Apply a simple 3×3 sharpen convolution to image data. `amount` 0..1. */
const sharpenInPlace = (ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) => {
  if (amount <= 0) return;
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const d = out.data;
  const center = 1 + 4 * amount;
  const side = -amount;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v =
          s[i + c] * center +
          s[i + c - 4] * side +
          s[i + c + 4] * side +
          s[i + c - w * 4] * side +
          s[i + c + w * 4] * side;
        d[i + c] = Math.max(0, Math.min(255, v));
      }
      d[i + 3] = s[i + 3];
    }
  }
  // Copy borders
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = (y * w + x) * 4;
      d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = s[i + 3];
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = (y * w + x) * 4;
      d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = s[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
};

const ImageEditorSheet = ({ file, open, onConfirm, onCancel, aspectRatio }: Props) => {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(DEFAULTS.brightness);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [saturation, setSaturation] = useState(DEFAULTS.saturation);
  const [sharpness, setSharpness] = useState(DEFAULTS.sharpness);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setRotation(0);
    setBrightness(DEFAULTS.brightness);
    setContrast(DEFAULTS.contrast);
    setSaturation(DEFAULTS.saturation);
    setSharpness(DEFAULTS.sharpness);
    setCrop(undefined);
    setCompleted(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg)`,
    maxHeight: "55vh",
    width: "auto",
  };

  const reset = () => {
    setBrightness(DEFAULTS.brightness);
    setContrast(DEFAULTS.contrast);
    setSaturation(DEFAULTS.saturation);
    setSharpness(DEFAULTS.sharpness);
    setRotation(0);
  };

  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerInitial(width, height, aspectRatio));
  };

  const handleDone = async () => {
    if (!imgRef.current || !file) return;
    setBusy(true);
    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const cropPx: PixelCrop = completed ?? {
        unit: "px",
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      };
      const sx = cropPx.x * scaleX;
      const sy = cropPx.y * scaleY;
      const sw = cropPx.width * scaleX;
      const sh = cropPx.height * scaleY;

      const rot = ((rotation % 360) + 360) % 360;
      const swapped = rot === 90 || rot === 270;
      const outW = Math.round(swapped ? sh : sw);
      const outH = Math.round(swapped ? sw : sh);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");
      ctx.imageSmoothingQuality = "high";
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = "none";

      const sharpenAmount = Math.max(0, (sharpness - 100) / 100); // 0..1
      sharpenInPlace(ctx, outW, outH, sharpenAmount);

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", 0.85));
      if (!blob) throw new Error("Export failed");
      const base = file.name.replace(/\.[^.]+$/, "");
      onConfirm(blob, `${base}.webp`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit image</SheetTitle>
          <SheetDescription>Crop, rotate, and adjust before uploading.</SheetDescription>
        </SheetHeader>

        {src && (
          <div className="py-4 space-y-5">
            <div className="flex items-center justify-center bg-muted rounded-xl overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompleted(c)}
                aspect={aspectRatio}
              >
                <img
                  ref={imgRef}
                  src={src}
                  alt="To edit"
                  onLoad={onImageLoaded}
                  style={filterStyle}
                />
              </ReactCrop>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Brightness", value: brightness, set: setBrightness },
                { label: "Contrast", value: contrast, set: setContrast },
                { label: "Saturation", value: saturation, set: setSaturation },
                { label: "Sharpness", value: sharpness, set: setSharpness },
              ].map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <Label>{s.label}</Label>
                    <span className="tabular-nums text-muted-foreground">{s.value}</span>
                  </div>
                  <Slider
                    min={0}
                    max={200}
                    step={1}
                    value={[s.value]}
                    onValueChange={([v]) => s.set(v)}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                  <RotateCw className="h-4 w-4 mr-1.5" /> Rotate
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
                <Button onClick={handleDone} disabled={busy}>{busy ? "Processing…" : "Done"}</Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ImageEditorSheet;
