import { useState } from "react";
import { Share2, Link as LinkIcon, FileDown, Smartphone, MessageCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import type { Product, Settings } from "@/lib/queries";
import { productImage } from "@/lib/queries";
import { generateProductPdf } from "@/lib/pdf";

interface ShareMenuProps {
  product: Product;
  settings: Settings | undefined;
  buttonLabel: string;
  className?: string;
  /** CSS selector or element ref for the product image to capture for image share. */
  imageSelector?: string;
}

const ShareMenu = ({
  product,
  settings,
  buttonLabel,
  className,
  imageSelector = "[data-product-image]",
}: ShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const priceNum = product.discounted_price ?? product.original_price;
  const priceText = `Rs. ${Math.round(priceNum).toLocaleString("en-IN")}`;
  const waNum = settings?.whatsapp_number?.replace(/\D/g, "") || "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
    setOpen(false);
  };

  const shareWhatsApp = () => {
    const text = `Hi! I'm interested in *${product.name}*\nPrice: ${priceText}\n\n${url}`;
    const target = waNum ? `https://wa.me/${waNum}` : "https://wa.me/";
    window.open(`${target}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setOpen(false);
  };

  const sharePdf = async () => {
    try {
      await generateProductPdf(product, settings);
      const msg = `Hi! I'm interested in *${product.name}*\nPrice: ${priceText}\n\nPlease find the product details attached.\n\n${url}`;
      const target = waNum ? `https://wa.me/${waNum}` : "https://wa.me/";
      window.open(`${target}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
      toast.success("PDF downloaded — open WhatsApp and attach the file to share it");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't create PDF");
    }
    setOpen(false);
  };

  const shareImage = async () => {
    setOpen(false);
    try {
      const el =
        (document.querySelector(imageSelector) as HTMLElement | null) ||
        (document.querySelector(`img[alt="${product.name}"]`) as HTMLElement | null);
      if (!el) {
        toast.error("Couldn't find the product image to share");
        return;
      }
      const canvas = await html2canvas(el, { useCORS: true, backgroundColor: "#ffffff" });
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92),
      );
      if (!blob) {
        toast.error("Couldn't prepare the image");
        return;
      }
      const file = new File([blob], `${product.name.replace(/\s+/g, "-")}.jpg`, {
        type: "image/jpeg",
      });
      const text = `Hi! I'm interested in *${product.name}*\nPrice: ${priceText}\n\n${url}`;
      // @ts-ignore - canShare typing
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: product.name, text });
        return;
      }
      // Fallback: download the image and open WhatsApp
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(dlUrl);
      const target = waNum ? `https://wa.me/${waNum}` : "https://wa.me/";
      window.open(`${target}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      toast.info("Image downloaded — attach it in WhatsApp to share");
    } catch {
      toast.error("Open the product image and use your phone's share button to send it on WhatsApp");
    }
  };

  const shareDevice = async () => {
    if (!navigator.share) {
      toast.info("Sharing isn't supported on this device — try Copy Link.");
      return;
    }
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} from Eraya`,
        url,
      });
    } catch {
      /* user cancelled */
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 /> {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-1">
        <button
          onClick={shareWhatsApp}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-gold" /> Share on WhatsApp
        </button>
        <button
          onClick={shareImage}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <ImageIcon className="h-4 w-4 text-gold" /> Share Image on WhatsApp
        </button>
        <button
          onClick={sharePdf}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <FileDown className="h-4 w-4 text-gold" /> Share as PDF
        </button>
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <LinkIcon className="h-4 w-4 text-gold" /> Copy link
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={shareDevice}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
          >
            <Smartphone className="h-4 w-4 text-gold" /> Share via device
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ShareMenu;
